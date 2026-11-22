using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Workouterr.Api.Users;

namespace Workouterr.Api.Settings;

public static class SettingsEndpoints
{
    public static void MapSettingsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var settings = endpoints.MapGroup("/api/settings")
            .WithTags("Settings")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        settings.MapGet("", GetSettings)
            .WithName("GetSettings");

        // PATCH, not PUT: the theme button sends only the theme, the settings page only what it shows, and a field
        // added later never gets reset by a client that doesn't know it yet.
        settings.MapPatch("", UpdateSettings)
            .WithName("UpdateSettings")
            .ProducesValidationProblem();
    }

    private static async Task<Results<Ok<SettingsResponse>, ProblemHttpResult>> GetSettings(
        ClaimsPrincipal principal, UserManager<User> userManager)
    {
        var user = await userManager.GetUserAsync(principal);
        return user is null
            ? TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized)
            : TypedResults.Ok(SettingsResponse.From(user));
    }

    private static async Task<Results<Ok<SettingsResponse>, ProblemHttpResult>> UpdateSettings(
        UpdateSettingsRequest request, ClaimsPrincipal principal, UserManager<User> userManager)
    {
        // The cookie can outlive the user (deleted account); treat that like no login.
        var user = await userManager.GetUserAsync(principal);
        if (user is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized);
        }

        if (request.DisplayName is not null)
        {
            // An empty (or blank) name removes it, so the app goes back to showing the email.
            var displayName = request.DisplayName.Trim();
            user.DisplayName = displayName.Length == 0 ? null : displayName;
        }
        if (request.Theme is { } theme)
        {
            user.Theme = theme;
        }
        if (request.RestTimerSound is { } restTimerSound)
        {
            user.RestTimerSound = restTimerSound;
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Updating the settings failed: {string.Join(", ", result.Errors.Select(error => error.Code))}");
        }
        return TypedResults.Ok(SettingsResponse.From(user));
    }
}

/// <summary>Every field is optional: a missing (or null) one stays as it is.</summary>
public record UpdateSettingsRequest(
    // An empty string removes the display name.
    [property: MaxLength(User.DisplayNameMaxLength)] string? DisplayName = null,
    Theme? Theme = null,
    bool? RestTimerSound = null);

public record SettingsResponse(string? DisplayName, Theme? Theme, bool RestTimerSound)
{
    public static SettingsResponse From(User user) => new(user.DisplayName, user.Theme, user.RestTimerSound);
}
