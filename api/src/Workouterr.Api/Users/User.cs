using Microsoft.AspNetCore.Identity;

namespace Workouterr.Api.Users;

/// <summary>An account. The app's own fields (display name, language, theme, …) are added here as tasks need them.</summary>
public class User : IdentityUser<Guid>;
