using System.Globalization;
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
    // HttpContext.Items key: the session ID a login request came with, ended once its sign-in succeeds.
    private static readonly object ReplacedLoginIdKey = new();

    // AuthenticationProperties item: the login's latest possible expiry, kept in the ticket so the cookie events can
    // cap the renewed cookie without reading the store.
    private const string MaximumExpiryItem = "MaximumExpiry";

    /// <summary>The latest the login can expire (its start + <see cref="LoginLifetime.Maximum"/>); null for a ticket
    /// that wasn't stored by this store.</summary>
    public static DateTimeOffset? GetMaximumExpiry(AuthenticationProperties properties) =>
        properties.Items.TryGetValue(MaximumExpiryItem, out var value) && value is not null
            ? DateTimeOffset.Parse(value, CultureInfo.InvariantCulture)
            : null;

    public Task<string> StoreAsync(AuthenticationTicket ticket) => StoreAsync(ticket, CancellationToken.None);

    public Task<string> StoreAsync(AuthenticationTicket ticket, CancellationToken cancellationToken) =>
        AddLoginAsync(ticket, replacedLoginId: null, cancellationToken);

    // The handler calls this overload, and only on a successful sign-in, so a wrong password leaves the current
    // login in place.
    public Task<string> StoreAsync(
        AuthenticationTicket ticket, HttpContext httpContext, CancellationToken cancellationToken) =>
        AddLoginAsync(ticket, httpContext.Items[ReplacedLoginIdKey] as Guid?, cancellationToken);

    private async Task<string> AddLoginAsync(
        AuthenticationTicket ticket, Guid? replacedLoginId, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var login = new Login
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(ticket.Principal.FindFirstValue(ClaimTypes.NameIdentifier)!),
            CreatedAt = now,
            Ticket = [],
        };
        ticket.Properties.Items[MaximumExpiryItem] =
            (now + LoginLifetime.Maximum).ToString("O", CultureInfo.InvariantCulture);
        SetTicket(login, ticket);

        await using var scope = scopeFactory.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Deleted before the new login is added: if adding fails, the old session ID is still gone.
        if (replacedLoginId is { } replacedId)
        {
            await database.Logins.Where(replaced => replaced.Id == replacedId).ExecuteDeleteAsync(cancellationToken);
        }

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
        try
        {
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Deleted since it was read (a logout or a stamp change on another request): the deletion wins, and the
            // next request with this cookie is anonymous.
        }
    }

    public Task<AuthenticationTicket?> RetrieveAsync(string key) => RetrieveAsync(key, CancellationToken.None);

    // The handler calls this overload. Returning null makes the request anonymous, and a sign-in on an anonymous
    // request stores a new login instead of renewing the current one.
    public async Task<AuthenticationTicket?> RetrieveAsync(
        string key, HttpContext httpContext, CancellationToken cancellationToken)
    {
        // A successful login replaces the login it came with (see StoreAsync), so the session ID changes on every
        // login: a session ID planted in the browser before the login is worthless after it.
        if (httpContext.GetEndpoint()?.Metadata.GetMetadata<ReplacesCurrentLogin>() is not null)
        {
            if (Guid.TryParse(key, out var replacedLoginId))
            {
                httpContext.Items[ReplacedLoginIdKey] = replacedLoginId;
            }

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
