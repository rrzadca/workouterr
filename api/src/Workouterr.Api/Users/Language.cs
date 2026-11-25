using System.Text.Json.Serialization;

namespace Workouterr.Api.Users;

/// <summary>
/// The language of an account: the starter exercises are copied in it, and later the app's text and emails follow it.
/// ISO 639-1 codes on the wire (<c>en</c>, <c>pl</c>), the app's Transloco language names. The converter sits on the
/// type, so every serializer reads and writes these names.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<Language>))]
public enum Language
{
    [JsonStringEnumMemberName("en")] English,
    [JsonStringEnumMemberName("pl")] Polish,
}
