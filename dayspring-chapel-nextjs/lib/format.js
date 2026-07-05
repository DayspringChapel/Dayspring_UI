// Turns a PascalCase enum name (e.g. from a C# enum's ToString()) into a
// human-readable label: "EventHighlightVideo" -> "Event Highlight Video".
export function humanizeLabel(value) {
    if (!value || typeof value !== 'string') return value;
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();
}
