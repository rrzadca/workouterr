using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Workouterr.Api.Users;

namespace Workouterr.Api.Auth;

/// <summary>
/// The login cookie's events: the security stamp checked on every request, renewal at most once a day, and 401 / 403
/// instead of the redirects to a login page that suit server-rendered apps.
/// </summary>
public class LoginCookieEvents(SignInManager<User> signInManager, LoginStore loginStore, TimeProvider timeProvider)
    : CookieAuthenticationEvents
{
    // Identity's SecurityStampValidator renews the cookie whenever it checks the stamp, which would write to the
    // store on every request when it checks every time; this checks every time and renews once a day.
    public override async Task ValidatePrincipal(CookieValidatePrincipalContext context)
    {
        // Null when the user is gone or their stamp changed (password change or reset, account deletion).
        if (await signInManager.ValidateSecurityStampAsync(context.Principal) is null)
        {
            context.RejectPrincipal();
            // Also deletes the login from the store and the cookie from the browser.
            await signInManager.SignOutAsync();
            return;
        }

        // A day-old ticket asks the store to renew; overlapping requests may all ask, and only the one the store lets
        // renew refreshes the cookie. The handler gives the refreshed cookie the ticket's new lifetime
        // (ExpiresUtc - IssuedUtc) from now, so it never outlives the login's 90-day maximum.
        var issuedAt = context.Properties.IssuedUtc;
        if (issuedAt is null || timeProvider.GetUtcNow() - issuedAt >= LoginLifetime.RenewAfter)
        {
            context.ShouldRenew = await loginStore.TryRenewAsync(
                new AuthenticationTicket(context.Principal!, context.Properties, context.Scheme.Name),
                context.HttpContext,
                context.HttpContext.RequestAborted);
        }
    }

    public override Task RedirectToLogin(RedirectContext<CookieAuthenticationOptions> context)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    }

    public override Task RedirectToAccessDenied(RedirectContext<CookieAuthenticationOptions> context)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    }
}
