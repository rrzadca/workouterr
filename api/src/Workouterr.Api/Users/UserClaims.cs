using System.Security.Claims;

namespace Workouterr.Api.Users;

public static class UserClaims
{
    /// <summary>The logged-in user's ID, from the NameIdentifier claim Identity puts in the login cookie. Only for
    /// endpoints behind RequireAuthorization, which guarantees the claim is there. The user's row isn't loaded: if the
    /// account was deleted, its records went with it and every query simply finds nothing.</summary>
    public static Guid UserId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
