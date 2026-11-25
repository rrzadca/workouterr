using Microsoft.AspNetCore.Identity;
using Workouterr.Api.Exercises;
using Workouterr.Api.Persistence;

namespace Workouterr.Api.Users;

/// <summary>
/// The one way to create an account, used by the CLI now and by registration later, so every account gets the same
/// setup: the user and their copy of the starter exercises, saved together or not at all.
/// </summary>
public class UserCreationService(
    UserManager<User> userManager, AppDbContext database, StarterExercises starterExercises)
{
    public async Task<(IdentityResult Result, User User)> CreateAsync(
        string email, string password, Language language = Language.English)
    {
        // The email doubles as the user name, the field Identity looks users up by. Created by the owner, so the
        // address counts as verified, like an invite.
        var user = new User { UserName = email, Email = email, EmailConfirmed = true, Language = language };

        // UserManager saves through this same scoped AppDbContext, so its insert joins the transaction: if copying the
        // exercises fails, the user is rolled back too. Disposing the transaction without a commit rolls it back.
        await using var transaction = await database.Database.BeginTransactionAsync();

        // Validates the email and the password rules, then stores the user with a hashed password.
        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            return (result, user);
        }

        foreach (var starterExercise in starterExercises.All)
        {
            var exercise = new Exercise { UserId = user.Id, Name = "" };
            starterExercise.ToRequest(language).ApplyTo(exercise);
            database.Exercises.Add(exercise);
        }
        await database.SaveChangesAsync();
        await transaction.CommitAsync();
        return (result, user);
    }
}
