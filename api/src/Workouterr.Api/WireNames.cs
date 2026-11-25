using System.Reflection;
using System.Text.Json.Serialization;

namespace Workouterr.Api;

/// <summary>Reads an enum by the name it has on the wire (<c>ARMS</c>, from its <see cref="JsonStringEnumMemberNameAttribute"/>),
/// for values that come from somewhere other than a JSON body, such as the query string. Only those names: not the C#
/// name, not a number.</summary>
public static class WireNames
{
    public static bool TryParse<TEnum>(string name, out TEnum value) where TEnum : struct, Enum =>
        Lookup<TEnum>.ByName.TryGetValue(name, out value);

    // For a name already limited to the wire names (a CLI option's accepted values): one that isn't is a bug.
    public static TEnum Parse<TEnum>(string name) where TEnum : struct, Enum =>
        TryParse<TEnum>(name, out var value)
            ? value
            : throw new ArgumentException($"'{name}' is not a wire name of {typeof(TEnum).Name}.", nameof(name));

    public static string Of<TEnum>(TEnum value) where TEnum : struct, Enum =>
        Lookup<TEnum>.ByName.First(pair => EqualityComparer<TEnum>.Default.Equals(pair.Value, value)).Key;

    public static string[] All<TEnum>() where TEnum : struct, Enum => Lookup<TEnum>.ByName.Keys.ToArray();

    // Built once per enum type.
    private static class Lookup<TEnum> where TEnum : struct, Enum
    {
        public static readonly Dictionary<string, TEnum> ByName = typeof(TEnum)
            .GetFields(BindingFlags.Public | BindingFlags.Static)
            .ToDictionary(
                field => field.GetCustomAttribute<JsonStringEnumMemberNameAttribute>()?.Name ?? field.Name,
                field => (TEnum)field.GetValue(null)!);
    }
}
