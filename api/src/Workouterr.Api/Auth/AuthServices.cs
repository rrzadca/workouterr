using Microsoft.AspNetCore.Identity;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;

namespace Workouterr.Api.Auth;

public static class AuthServices
{
    public static IServiceCollection AddAuth(this IServiceCollection services)
    {
        // Identity's user store, UserManager (password hashing, validation) and SignInManager (password check, cookie
        // sign-in).
        services.AddIdentityCore<User>(options =>
            {
                options.User.RequireUniqueEmail = true;

                // An unverified email can't log in; the login answers with the same generic error as a wrong password.
                options.SignIn.RequireConfirmedEmail = true;

                // No account lockout: it locks per account, which would show the email is registered. Rate limiting
                // covers it.
                options.Lockout.AllowedForNewUsers = false;

                // Length over composition: at least 12 characters, letters and digits enough, no character classes
                // required.
                options.Password.RequiredLength = 12;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();

        // The Identity application cookie is the only way in (no external or two-factor logins, so not
        // AddIdentityCookies). Cookie defaults redirect to a login page; an API answers 401 / 403 instead.
        services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                // What AddIdentityCookies would set: the security stamp is checked, so a stamp change ends the login.
                options.Events.OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync;
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            });
        services.AddAuthorization();

        return services;
    }
}
