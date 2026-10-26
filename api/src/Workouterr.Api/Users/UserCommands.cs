using System.CommandLine;
using System.Text;

namespace Workouterr.Api.Users;

public static class UserCommands
{
    // `user create <email>`; the password is asked for, never passed as an argument, so it stays out of shell history.
    public static Command Create(IServiceProvider services)
    {
        var emailArgument = new Argument<string>("email") { Description = "The new user's email address." };
        var createCommand = new Command("create", "Create a user; the password is read from the terminal.")
        {
            emailArgument,
        };
        createCommand.SetAction(async parseResult =>
        {
            var email = parseResult.GetRequiredValue(emailArgument);
            var password = ReadPassword();
            if (password is null)
            {
                Console.Error.WriteLine("The passwords don't match.");
                return 1;
            }

            using var scope = services.CreateScope();
            var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();
            var (result, user) = await userCreation.CreateAsync(email, password);
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    Console.Error.WriteLine(error.Description);
                }

                return 1;
            }

            Console.WriteLine($"Created user {user.Id}.");
            return 0;
        });

        return new Command("user", "Manage users.") { createCommand };
    }

    // Typed twice with the input hidden; piped in once (`echo … | dotnet run -- user create …`) for scripts.
    // Returns null when the two typed passwords differ.
    private static string? ReadPassword()
    {
        if (Console.IsInputRedirected)
        {
            return Console.ReadLine() ?? "";
        }

        var password = ReadHiddenLine("Password: ");
        var confirmation = ReadHiddenLine("Repeat password: ");
        return password == confirmation ? password : null;
    }

    private static string ReadHiddenLine(string prompt)
    {
        Console.Write(prompt);
        var line = new StringBuilder();
        while (true)
        {
            // intercept: true keeps the key from being echoed.
            var key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter)
            {
                Console.WriteLine();
                return line.ToString();
            }

            if (key.Key == ConsoleKey.Backspace)
            {
                if (line.Length > 0)
                {
                    line.Length--;
                }
            }
            else if (!char.IsControl(key.KeyChar))
            {
                line.Append(key.KeyChar);
            }
        }
    }
}
