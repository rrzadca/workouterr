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

    /// <summary>When the login was last extended (or created): the ticket's issued time. A renewal checks it in the
    /// same UPDATE that writes it, so a login is extended at most once a day however many requests overlap.</summary>
    public DateTimeOffset RenewedAt { get; set; }

    /// <summary>The sliding expiry, capped at <see cref="CreatedAt"/> + <see cref="LoginLifetime.Maximum"/>.</summary>
    public DateTimeOffset ExpiresAt { get; set; }
}

/// <summary>Endpoint metadata: a successful sign-in on this endpoint ends the login the request was sent with and
/// stores a new login under a new session ID; a failed one leaves it in place.</summary>
public sealed class ReplacesCurrentLogin;
