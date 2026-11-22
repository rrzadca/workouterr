using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Workouterr.Api.Users;

/// <summary>An account. The app's own fields are added here as tasks need them.</summary>
public class User : IdentityUser<Guid>
{
    public const int DisplayNameMaxLength = 50;

    /// <summary>Shown instead of the email (avatar initial, greetings); null when the user hasn't set one.</summary>
    public string? DisplayName { get; set; }

    /// <summary>Null until the theme button is first tapped: until then the app follows the system theme.</summary>
    public Theme? Theme { get; set; }

    /// <summary>Whether the rest timer plays a sound at zero (the full-screen cue shows either way).</summary>
    public bool RestTimerSound { get; set; } = true;
}

// Lower-case names on the wire, the values the app's `data-theme` attribute takes. The converter sits on the type, so
// every serializer (the tests' HttpClient too) reads and writes these names, not only the API's configured one.
[JsonConverter(typeof(JsonStringEnumConverter<Theme>))]
public enum Theme
{
    [JsonStringEnumMemberName("light")] Light,
    [JsonStringEnumMemberName("dark")] Dark,
}
