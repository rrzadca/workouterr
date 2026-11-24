using System.ComponentModel.DataAnnotations;

namespace Workouterr.Api.Validation;

/// <summary>A decimal with at most this many digits after the point (1.25 passes, 1.255 doesn't).</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public class DecimalPlacesAttribute(int places) : ValidationAttribute(
    $"The field {{0}} must have at most {places} decimal places.")
{
    public int Places { get; } = places;

    public override bool IsValid(object? value) =>
        value is not decimal number || decimal.Round(number, Places) == number;
}
