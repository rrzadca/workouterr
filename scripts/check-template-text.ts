/*
 * Fails when an Angular template shows text that does not come from a translation key.
 * Every visible string goes through Transloco in web, or arrives through an input in ui.
 *
 * Run: node scripts/check-template-text.ts (part of `npm run lint`)
 */
import { globSync, readFileSync } from 'node:fs';
import {
  ASTWithSource,
  Interpolation,
  parseTemplate,
  TmplAstRecursiveVisitor,
  tmplAstVisitAll,
  type AST,
  type ParseSourceSpan,
  type TmplAstBoundText,
  type TmplAstText,
  type TmplAstTextAttribute,
} from '@angular/compiler';

const templateGlobs = ['web/src/app/**/*.html', 'ui/src/**/*.html'];

/** Attributes a user sees or hears; others (class, routerLink, aria-hidden, …) are not UI text. */
const visibleAttributes = new Set([
  'alt',
  'title',
  'placeholder',
  'label',
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
]);

export interface HardCodedText {
  line: number;
  column: number;
  text: string;
}

/** Only text with letters counts, so separators like "·", "/" or "%" may stay in templates. */
function hasWords(text: string): boolean {
  return /\p{Letter}/u.test(text);
}

class HardCodedTextFinder extends TmplAstRecursiveVisitor {
  readonly found: HardCodedText[] = [];

  override visitText(text: TmplAstText): void {
    this.report(text.value, text.sourceSpan);
  }

  override visitBoundText(text: TmplAstBoundText): void {
    // {{ 'key' | transloco }} kg → the strings around the expressions are ['', ' kg']
    // instanceof on the generic ASTWithSource narrows to ASTWithSource<any>; name the type it really holds
    const expression = text.value instanceof ASTWithSource ? (text.value as ASTWithSource<AST>).ast : text.value;
    if (expression instanceof Interpolation) {
      this.report(expression.strings.join(' '), text.sourceSpan);
    }
  }

  override visitTextAttribute(attribute: TmplAstTextAttribute): void {
    if (visibleAttributes.has(attribute.name)) {
      this.report(attribute.value, attribute.sourceSpan);
    }
  }

  private report(text: string, span: ParseSourceSpan): void {
    if (hasWords(text)) {
      this.found.push({ line: span.start.line + 1, column: span.start.col + 1, text: text.trim() });
    }
  }
}

export function findHardCodedText(template: string, templateUrl: string): HardCodedText[] {
  const parsed = parseTemplate(template, templateUrl, { preserveWhitespaces: false });
  if (parsed.errors) {
    throw new Error(`${templateUrl}: ${parsed.errors.map((error) => error.msg).join('; ')}`);
  }
  const finder = new HardCodedTextFinder();
  tmplAstVisitAll(finder, parsed.nodes);
  return finder.found;
}

if (import.meta.main) {
  const files = templateGlobs.flatMap((pattern) => globSync(pattern)).sort();
  let problemCount = 0;
  for (const file of files) {
    for (const problem of findHardCodedText(readFileSync(file, 'utf8'), file)) {
      console.error(`${file}:${problem.line}:${problem.column}  hard-coded text "${problem.text}"`);
      problemCount += 1;
    }
  }
  if (problemCount > 0) {
    console.error(`\n${problemCount} hard-coded text(s) in templates; use a Transloco key in web or an input in ui.`);
    process.exit(1);
  }
  console.log(`No hard-coded text in ${files.length} templates.`);
}
