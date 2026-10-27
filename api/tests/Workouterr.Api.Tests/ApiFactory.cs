using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Workouterr.Api.Persistence;

[assembly: AssemblyFixture(typeof(Workouterr.Api.Tests.ApiFactory))]

namespace Workouterr.Api.Tests;

/// <summary>
/// The API running in memory against a throwaway PostgreSQL container, shared by every test in the assembly.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    // Same major version as deploy/compose.dev.yaml.
    private readonly PostgreSqlContainer database = new PostgreSqlBuilder("postgres:18").Build();

    // The login cookie is Secure, and the test client's cookie container sends a Secure cookie over HTTPS only.
    public ApiFactory() => ClientOptions.BaseAddress = new Uri("https://localhost");

    public async ValueTask InitializeAsync()
    {
        await database.StartAsync();

        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Workouterr", database.GetConnectionString());
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await database.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}
