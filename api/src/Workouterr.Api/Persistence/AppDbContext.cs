using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Workouterr.Api.Auth;
using Workouterr.Api.Exercises;
using Workouterr.Api.Users;

namespace Workouterr.Api.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Login> Logins => Set<Login>();

    public DbSet<Exercise> Exercises => Set<Exercise>();

    // Enums are stored by name; the longest name today is "WeightReps" (10).
    private const int EnumNameMaxLength = 16;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Identity names its tables explicitly (AspNetUsers, …), which the snake_case convention leaves alone.
        builder.Entity<User>(user =>
        {
            user.ToTable("users");
            user.Property(u => u.DisplayName).HasMaxLength(User.DisplayNameMaxLength);
            // Stored by name, so the column reads "Light" / "Dark" rather than a number.
            user.Property(u => u.Theme).HasConversion<string>().HasMaxLength(EnumNameMaxLength);
            // Existing accounts get the sound on. The sentinel tells EF that `true` is "not set" and leaves it to the
            // database default, while `false` is always written.
            user.Property(u => u.RestTimerSound).HasDefaultValue(true).HasSentinel(true);
        });
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("user_claims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("user_logins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("user_tokens");
        builder.Entity<IdentityRole<Guid>>().ToTable("roles");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("role_claims");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("user_roles");

        // Deleting a user deletes their logins.
        builder.Entity<Login>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(login => login.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Exercise>(exerciseEntity =>
        {
            exerciseEntity.Property(exercise => exercise.Name).HasMaxLength(Exercise.NameMaxLength);
            exerciseEntity.Property(exercise => exercise.Description).HasMaxLength(Exercise.DescriptionMaxLength);
            // Enums stored by name, like the theme, so the columns read "WeightReps" and {Chest,Legs}.
            exerciseEntity.Property(exercise => exercise.Metrics).HasConversion<string>().HasMaxLength(EnumNameMaxLength);
            exerciseEntity.Property(exercise => exercise.WeightStep)
                .HasPrecision(Exercise.WeightStepPrecision, Exercise.WeightStepScale);
            // A PostgreSQL array column: the picker's filter ("has this group") is `= ANY(muscle_groups)`, no join.
            exerciseEntity.PrimitiveCollection(exercise => exercise.MuscleGroups)
                .ElementType(group => group.HasConversion<string>().HasMaxLength(EnumNameMaxLength));
            // Deleting a user deletes their exercises (the foreign key also gets an index, for "this user's exercises").
            exerciseEntity.HasOne<User>()
                .WithMany()
                .HasForeignKey(exercise => exercise.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
