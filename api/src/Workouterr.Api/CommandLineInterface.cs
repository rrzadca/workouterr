using System.CommandLine;
using Workouterr.Api.Users;

namespace Workouterr.Api;

/// <summary>
/// Command mode: `dotnet run -- user create <email>` runs a command with the API's own configuration and services
/// (so the same database), then exits instead of starting the web server.
/// </summary>
public static class CommandLineInterface
{
    // Only these first arguments switch to command mode; anything else (`--urls …`, the arguments test hosts and the
    // build-time OpenAPI generation pass) still starts the API.
    private static readonly string[] CommandNames = ["user"];

    public static bool IsCommand(string[] args) => args.Length > 0 && CommandNames.Contains(args[0]);

    public static Task<int> InvokeAsync(IServiceProvider services, string[] args)
    {
        var rootCommand = new RootCommand("Workouterr API commands.") { UserCommands.Create(services) };
        return rootCommand.Parse(args).InvokeAsync();
    }
}
