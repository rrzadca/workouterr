using System.Text.RegularExpressions;

namespace Workouterr.Api.Diagnostics;

/// <summary>
/// Replaces anything shaped like an email address with <c>[email]</c>, for text the API doesn't write itself (an error
/// the browser sent, Identity's messages) that ends up in the logs. Notes and workout values have no shape to find, so
/// what sends that text must keep them out.
/// </summary>
public static partial class EmailRedaction
{
    public const string Placeholder = "[email]";

    public static string? Redact(string? text) => text is null ? null : EmailPattern().Replace(text, Placeholder);

    // The domain is labels and a letters-only top level: Safari's stack frames (`check@https://host/main.js:1:2`) have
    // an @ too, but a scheme and a colon after it, so they stay as they are.
    [GeneratedRegex(@"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b")]
    private static partial Regex EmailPattern();
}
