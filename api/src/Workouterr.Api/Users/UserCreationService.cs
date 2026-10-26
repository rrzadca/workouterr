using Microsoft.AspNetCore.Identity;

namespace Workouterr.Api.Users;

/// <summary>
/// The one way to create an account, used by the CLI now and by registration later, so every account gets the same
/// setup (the starter exercises join here in a later task).
/// </summary>
public class UserCreationService(UserManager<User> userManager)
{
    public async Task<(IdentityResult Result, User User)> CreateAsync(string email, string password)
    {
        // The email doubles as the user name, the field Identity looks users up by. Created by the owner, so the
        // address counts as verified, like an invite.
        var user = new User { UserName = email, Email = email, EmailConfirmed = true };

        // Validates the email and the password rules, then stores the user with a hashed password.
        var result = await userManager.CreateAsync(user, password);
        return (result, user);
    }
}
