using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Workouterr.Api.Users;

namespace Workouterr.Api.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var auth = endpoints.MapGroup("/api/auth").WithTags("Auth");

        // Every login gets a new session ID, even one sent while already logged in (see LoginStore).
        auth.MapPost("/login", Login)
            .WithName("Login")
            .WithMetadata(new ReplacesCurrentLogin())
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        // Anonymous, so logging out twice (or with an expired login) still succeeds.
        auth.MapPost("/logout", Logout)
            .WithName("Logout");

        // The cookie handler answers 401 before the handler runs; status code pages turn it into Problem Details.
        auth.MapGet("/me", GetCurrentUser)
            .WithName("GetCurrentUser")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static async Task<Results<Ok<CurrentUserResponse>, ProblemHttpResult>> Login(
        LoginRequest request, UserManager<User> userManager, SignInManager<User> signInManager,
        IPasswordHasher<User> passwordHasher)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            // Hash anyway, so an unknown email takes as long as a wrong password and the timing doesn't tell them apart.
            passwordHasher.HashPassword(new User(), request.Password);
            return InvalidLogin();
        }

        // Password first, so every login hashes once: PasswordSignInAsync checks the sign-in rules (RequireConfirmedEmail)
        // before the password, and an unverified email would answer faster. No lockout: it locks per account, which
        // would show the email is registered.
        if (!await userManager.CheckPasswordAsync(user, request.Password) || !await signInManager.CanSignInAsync(user))
        {
            return InvalidLogin();
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        return TypedResults.Ok(CurrentUserResponse.From(user));
    }

    private static async Task<NoContent> Logout(SignInManager<User> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<CurrentUserResponse>, ProblemHttpResult>> GetCurrentUser(
        ClaimsPrincipal principal, UserManager<User> userManager)
    {
        // The cookie can outlive the user (deleted account); treat that like no login.
        var user = await userManager.GetUserAsync(principal);
        return user is null
            ? TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized)
            : TypedResults.Ok(CurrentUserResponse.From(user));
    }

    // One response for every failure, so it never reveals whether the email is registered.
    private static ProblemHttpResult InvalidLogin() =>
        TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Invalid email or password");
}

// MinLength(1) on top of Required puts the non-empty rule into the OpenAPI document, so the browser's zod schema has it.
public record LoginRequest(
    [property: Required, MinLength(1), MaxLength(256)] string Email,
    [property: Required, MinLength(1)] string Password);

public record CurrentUserResponse(Guid Id, string Email)
{
    public static CurrentUserResponse From(User user) => new(user.Id, user.Email!);
}
