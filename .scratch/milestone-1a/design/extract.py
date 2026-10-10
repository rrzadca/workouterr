"""Unpack the Claude Design export into plain files that people and agents can read.

The HTML export keeps every source file gzipped and base64-encoded inside a JSON manifest.
This script writes them out under `source/`, next to this file:

- `source/tokens.css`: design tokens (colors, type, spacing, radii, shadows, motion) and base styles
- `source/design-system/**`: the design-system components (compiled from JSX to React.createElement)
  and `guidelines/tailwind.config.js`
- `source/screens/*`: the app screens as the original JSX

Usage: python3 -I extract.py
The `source/` directory is deleted and rebuilt on every run.
"""

import base64
import gzip
import json
import re
import shutil
from pathlib import Path

DESIGN_DIRECTORY = Path(__file__).resolve().parent
EXPORT_FILE = DESIGN_DIRECTORY / "Workouterr Mac App.html"
OUTPUT_DIRECTORY = DESIGN_DIRECTORY / "source"

# The design-system bundle also carries compiled copies of the desktop screens; the JSX versions are kept instead.
DUPLICATED_MODULE_PREFIX = "ui_kits/desktop-app/"

# Screen files with no single component to name them after.
SCREEN_FILE_NAMES_BY_FIRST_EXPORT = {
    "TODAY": "data.js",
    "exById": "kit.jsx",
}


def read_bundler_block(html, block_type):
    match = re.search(rf'<script type="__bundler/{block_type}">(.*?)</script>', html, re.DOTALL)
    return json.loads(match.group(1))


def decode_resource(resource):
    data = base64.b64decode(resource["data"])
    if resource.get("compressed"):
        data = gzip.decompress(data)
    return data.decode("utf-8")


def write_output_file(relative_path, content):
    path = OUTPUT_DIRECTORY / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(DESIGN_DIRECTORY)}")


def extract_tokens(template):
    first_style = re.search(r"<style>(.*?)</style>", template, re.DOTALL).group(1)
    font_faces = r"/\* [\w-]+ \*/\s*@font-face \{.*?\}\s*"
    without_font_faces = re.sub(font_faces, "", first_style, flags=re.DOTALL)
    fonts_note = (
        "/* Fonts (Google Fonts): Geist 300-800, Geist Mono 400-700, Black Ops One 400.\n"
        "   The export embeds them as @font-face blocks; extract.py leaves those out. */\n\n"
    )
    write_output_file("tokens.css", fonts_note + without_font_faces)


def extract_design_system(bundle):
    module_pattern = re.compile(
        r"try \{ \(\(\) => \{\n(.*?)\n\}\)\(\); \} catch \(e\) \{ __ds_ns\.__errors\.push\(\{ path: \"([^\"]+)\"",
        re.DOTALL,
    )
    for module_match in module_pattern.finditer(bundle):
        module_source, module_path = module_match.groups()
        if module_path.startswith(DUPLICATED_MODULE_PREFIX):
            continue
        output_path = re.sub(r"\.jsx$", ".js", module_path)
        write_output_file(f"design-system/{output_path}", f"// {module_path} (compiled)\n{module_source}")


def screen_file_name(screen_source):
    exports = re.search(r"Object\.assign\(window, \{\s*(\w+)", screen_source).group(1)
    return SCREEN_FILE_NAMES_BY_FIRST_EXPORT.get(exports, f"{exports}.jsx")


def extract_screens(template, manifest):
    screen_identifiers = re.findall(r'<script type="text/babel" src="([\w-]+)">', template)
    for screen_identifier in screen_identifiers:
        screen_source = decode_resource(manifest[screen_identifier])
        write_output_file(f"screens/{screen_file_name(screen_source)}", screen_source)


def main():
    html = EXPORT_FILE.read_text(encoding="utf-8")
    manifest = read_bundler_block(html, "manifest")
    template = read_bundler_block(html, "template")
    design_system_identifier = re.search(r'<script src="([\w-]+)"></script>', template).group(1)

    shutil.rmtree(OUTPUT_DIRECTORY, ignore_errors=True)
    extract_tokens(template)
    extract_design_system(decode_resource(manifest[design_system_identifier]))
    extract_screens(template, manifest)


if __name__ == "__main__":
    main()
