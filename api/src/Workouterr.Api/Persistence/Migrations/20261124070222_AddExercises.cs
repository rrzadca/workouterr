using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workouterr.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "exercises",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    metrics = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    weight_step = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    time_step_seconds = table.Column<int>(type: "integer", nullable: true),
                    per_side = table.Column<bool>(type: "boolean", nullable: false),
                    muscle_groups = table.Column<string[]>(type: "character varying(16)[]", nullable: false),
                    is_archived = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exercises", x => x.id);
                    table.ForeignKey(
                        name: "fk_exercises_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_exercises_user_id",
                table: "exercises",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "exercises");
        }
    }
}
