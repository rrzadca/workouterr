namespace Workouterr.Api.Auth;

/// <summary>One signed-in device: the server-side half of the login cookie, which carries only <see cref="Id"/>.</summary>
public class Login
{
    /// <summary>The session ID in the cookie. Random, and the cookie is encrypted, so it can't be guessed or forged.</summary>
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    /// <summary>The serialized authentication ticket: the user's claims and the cookie properties.</summary>
    public required byte[] Ticket { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>The sliding expiry, capped at <see cref="CreatedAt"/> + <see cref="LoginLifetime.Maximum"/>.</summary>
    public DateTimeOffset ExpiresAt { get; set; }
}

/// <summary>Endpoint metadata: a request to this endpoint ends the login it was sent with, so the sign-in it makes
/// stores a new login under a new session ID.</summary>
public sealed class ReplacesCurrentLogin;
