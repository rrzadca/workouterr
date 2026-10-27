using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Workouterr.Api.Persistence;

namespace Workouterr.Api.Auth;

/// <summary>
/// Keeps logins in PostgreSQL, so the cookie carries only a session ID and deleting the row ends the login at once.
/// </summary>
/// <remarks>
/// The cookie handler is a singleton option, so each call opens its own scope: the store's writes never mix with
/// the endpoint's own DbContext changes.
/// </remarks>
public class LoginStore(IServiceScopeFactory scopeFactory, TimeProvider timeProvider) : ITicketStore
{
    public Task<string> StoreAsync(AuthenticationTicket ticket) => StoreAsync(ticket, CancellationToken.None);

    public async Task<string> StoreAsync(AuthenticationTicket ticket, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var login = new Login
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(ticket.Principal.FindFirstValue(ClaimTypes.NameIdentifier)!),
            CreatedAt = now,
            Ticket = [],
        };
        SetTicket(login, ticket);

        await using var scope = scopeFactory.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        database.Logins.Add(login);
        await database.SaveChangesAsync(cancellationToken);
        return login.Id.ToString();
    }

    public Task RenewAsync(string key, AuthenticationTicket ticket) =>
        RenewAsync(key, ticket, CancellationToken.None);

    public async Task RenewAsync(string key, AuthenticationTicket ticket, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(key, out var id))
        {
            return;
        }

        await using var scope = scopeFactory.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var login = await database.Logins.FindAsync([id], cancellationToken);
        if (login is null)
        {
            return;
        }

        SetTicket(login, ticket);
        await database.SaveChangesAsync(cancellationToken);
    }

    public Task<AuthenticationTicket?> RetrieveAsync(string key) => RetrieveAsync(key, CancellationToken.None);

    // The handler calls this overload. Returning null makes the request anonymous, and a sign-in on an anonymous
    // request stores a new login instead of renewing the current one.
    public async Task<AuthenticationTicket?> RetrieveAsync(
        string key, HttpContext httpContext, CancellationToken cancellationToken)
    {
        // A login request replaces the login it came with, so the session ID changes on every login: a session ID
        // planted in the browser before the login is worthless after it.
        if (httpContext.GetEndpoint()?.Metadata.GetMetadata<ReplacesCurrentLogin>() is not null)
        {
            await RemoveAsync(key, cancellationToken);
            return null;
        }

        return await RetrieveAsync(key, cancellationToken);
    }

    public async Task<AuthenticationTicket?> RetrieveAsync(string key, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(key, out var id))
        {
            return null;
        }

        await using var scope = scopeFactory.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = timeProvider.GetUtcNow();
        var ticket = await database.Logins
            .Where(login => login.Id == id && login.ExpiresAt > now)
            .Select(login => login.Ticket)
            .SingleOrDefaultAsync(cancellationToken);
        return ticket is null ? null : TicketSerializer.Default.Deserialize(ticket);
    }

    public Task RemoveAsync(string key) => RemoveAsync(key, CancellationToken.None);

    public async Task RemoveAsync(string key, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(key, out var id))
        {
            return;
        }

        await using var scope = scopeFactory.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await database.Logins.Where(login => login.Id == id).ExecuteDeleteAsync(cancellationToken);
    }

    // The ticket's own expiry is capped too: the cookie handler rejects a ticket past it, whatever the cookie says.
    private void SetTicket(Login login, AuthenticationTicket ticket)
    {
        var slidingExpiry = ticket.Properties.ExpiresUtc ?? timeProvider.GetUtcNow() + LoginLifetime.Sliding;
        var maximumExpiry = login.CreatedAt + LoginLifetime.Maximum;
        ticket.Properties.ExpiresUtc = slidingExpiry < maximumExpiry ? slidingExpiry : maximumExpiry;

        login.ExpiresAt = ticket.Properties.ExpiresUtc.Value;
        login.Ticket = TicketSerializer.Default.Serialize(ticket);
    }
}
