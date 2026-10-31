export function formSections(fields) {
    const sections = []; let current = { key: 'intro', title: 'Questions', description: '', marker: null, fields: [] };
    for (const field of fields) {
        if (field.type === 'section' || field.type === 'pagebreak') {
            if (current.marker || current.fields.length) sections.push(current);
            current = { key: field.key, title: field.label || 'Section', description: field.description || '', marker: field, fields: [] };
        } else current.fields.push(field);
    }
    if (current.marker || current.fields.length) sections.push(current);
    return sections.length ? sections : [current];
}
export function validFieldOrder(fields) {
    const earlier = new Set();
    for (const field of fields) { if (field.condition && !earlier.has(field.condition.field)) return false; earlier.add(field.key); }
    return true;
}
export function reorderField(fields, sourceKey, targetKey) {
    const from = fields.findIndex((field) => field.key === sourceKey); const target = fields.findIndex((field) => field.key === targetKey);
    if (from < 0 || target < 0 || from === target) return fields;
    let count = 1; let insertion = target;
    if (['section', 'pagebreak'].includes(fields[from].type)) {
        const end = fields.findIndex((field, index) => index > from && ['section', 'pagebreak'].includes(field.type));
        count = (end < 0 ? fields.length : end) - from;
        const section = formSections(fields).find((group) => group.marker?.key === targetKey || group.fields.some((field) => field.key === targetKey));
        if (!section?.marker) return null;
        const start = fields.findIndex((field) => field.key === section.marker.key);
        if (start >= from && start < from + count) return fields;
        insertion = from < start ? start + section.fields.length + 1 : start;
    } else {
        insertion = target + (from < target || ['section', 'pagebreak'].includes(fields[target].type) ? 1 : 0);
    }
    const next = [...fields]; const block = next.splice(from, count);
    if (insertion > from) insertion -= count;
    next.splice(Math.max(0, insertion), 0, ...block);
    return validFieldOrder(next) ? next : null;
}
export function addSection(fields) {
    const key = () => `section_${crypto.randomUUID().slice(0, 8)}`;
    const initial = fields.some((field) => field.type === 'section' || field.type === 'pagebreak') ? fields : [{ key: key(), label: 'Your details', type: 'section', required: false }, ...fields];
    return [...initial, { key: key(), label: 'Untitled section', type: 'section', description: '', required: false }];
}
export function moveField(fields, key, direction) {
    const at = fields.findIndex((field) => field.key === key);
    if (at < 0) return null;
    if (['section', 'pagebreak'].includes(fields[at].type)) {
        const sections = formSections(fields); const index = sections.findIndex((section) => section.key === key);
        return sections[index + direction]?.marker ? reorderField(fields, key, sections[index + direction].key) : null;
    }
    if (at + direction < 0 || at + direction >= fields.length) return null;
    const next = [...fields]; [next[at], next[at + direction]] = [next[at + direction], next[at]];
    return validFieldOrder(next) ? next : null;
}
export function localDateTime(value) {
    if (!value) return '';
    const date = new Date(value); if (!Number.isFinite(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function utcDateTime(value) { return value ? new Date(value).toISOString() : null; }
