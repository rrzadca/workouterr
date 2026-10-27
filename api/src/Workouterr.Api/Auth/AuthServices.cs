using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
        // AddIdentityCookies).
        services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                // Out of reach of scripts, sent over HTTPS only, and never on requests started by another site.
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Strict;

                // LoginCookieEvents renews once a day; the built-in sliding renews only past half the lifetime.
                options.ExpireTimeSpan = LoginLifetime.Sliding;
                options.SlidingExpiration = false;

                // Resolved from DI on each request, so the events can use scoped services (SignInManager).
                options.EventsType = typeof(LoginCookieEvents);
            });
        services.AddScoped<LoginCookieEvents>();
        services.AddSingleton<LoginStore>();
        services.AddOptions<CookieAuthenticationOptions>(IdentityConstants.ApplicationScheme)
            .Configure<LoginStore>((options, loginStore) => options.SessionStore = loginStore);
        services.TryAddSingleton(TimeProvider.System);
        services.AddAuthorization();

        return services;
    }
}
