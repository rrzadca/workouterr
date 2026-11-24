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
