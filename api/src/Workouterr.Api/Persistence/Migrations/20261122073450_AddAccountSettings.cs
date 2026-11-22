using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workouterr.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "display_name",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "rest_timer_sound",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "theme",
                table: "users",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "display_name",
                table: "users");

            migrationBuilder.DropColumn(
                name: "rest_timer_sound",
                table: "users");

            migrationBuilder.DropColumn(
                name: "theme",
                table: "users");
        }
    }
}
