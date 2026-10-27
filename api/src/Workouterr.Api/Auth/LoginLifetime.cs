namespace Workouterr.Api.Auth;

/// <summary>How long a login lasts: extended by use, but never past its maximum.</summary>
public static class LoginLifetime
{
    /// <summary>A login unused for this long expires.</summary>
    public static readonly TimeSpan Sliding = TimeSpan.FromDays(30);

    /// <summary>A request extends the login only once the last extension is this old, so the store is written at most
    /// once a day per login.</summary>
    public static readonly TimeSpan RenewAfter = TimeSpan.FromDays(1);

    /// <summary>A login expires this long after it started, however often it is used.</summary>
    public static readonly TimeSpan Maximum = TimeSpan.FromDays(90);
}
