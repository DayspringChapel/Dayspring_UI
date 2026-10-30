/** @typedef {import('./api-contracts').ApiSchemas['Dayspring_Backend.Forms.SaveFormRequest']} SaveFormRequest */

export function formFields(form) {
    const fields = form.fields || JSON.parse(form.fieldsJson || '[]');
    return fields.map((field) => ({
        ...Object.fromEntries(Object.entries(field).map(([key, value]) => [key[0].toLowerCase() + key.slice(1), value])),
        key: field.key ?? field.Key, label: field.label ?? field.Label,
        type: field.type ?? field.Type, required: field.required ?? field.Required ?? false,
        options: field.options ?? field.Options ?? [],
        ...((field.condition || field.Condition) ? { condition: Object.fromEntries(Object.entries(field.condition || field.Condition).map(([key, value]) => [key[0].toLowerCase() + key.slice(1), value])) } : {}),
    }));
}

/** Build the request shape defined by the backend OpenAPI contract. @returns {SaveFormRequest} */
export function formSavePayload(draft) {
    return { title: draft.title, description: draft.description, attachCertificate: draft.attachCertificate,
        expectedRevision: draft.revision, settings: draft.settings,
        fields: draft.fields.map((field) => ({ ...field, options: ['select', 'radio', 'multiselect', 'grid', 'checkboxgrid'].includes(field.type) ? field.options : null })) };
}

export function formSettings(form) {
    return form.settings || JSON.parse(form.settingsJson || '{}');
}

export const FIELD_TYPES = ['text', 'textarea', 'email', 'tel', 'number', 'date', 'time', 'datetime-local', 'select', 'radio', 'checkbox', 'multiselect', 'yesno', 'url', 'address', 'consent', 'rating', 'scale', 'section', 'description', 'pagebreak', 'hidden', 'file', 'image', 'grid', 'checkboxgrid'];

export function fieldVisible(field, answers) {
    return !field.condition || (answers[field.condition.field] || '') === field.condition.value;
}

export function changeAnswer(fields, current, key, value) {
    const next = { ...current, [key]: value };
    for (const field of fields) if (!fieldVisible(field, next)) delete next[field.key];
    return next;
}

export async function retrieveCertificate(code, signal) {
    // The private code stays in the request body, never a URL, analytics event or storage.
    const response = await fetch('/api/backend/api/v1/certificates/retrieve', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
        signal: signal || AbortSignal.timeout(30000),
    });
    if (response.status === 202) return { status: 'Pending', ...(await response.json()) };
    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const error = new Error(result.message || (response.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : 'Unable to retrieve this certificate.'));
        error.status = response.status;
        throw error;
    }
    if (!response.headers.get('content-type')?.includes('application/pdf')) throw new Error('The service returned an unexpected file.');
    return { status: 'Issued', file: await response.blob() };
}

export function saveCertificate(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certificate.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}
