'use client';
import { FIELD_TYPES } from '@/lib/formCertificates';
import styles from './BuilderFields.module.css';

export default function BuilderFields({ fields, onChange, disabled }) {
    function update(index, patch) { onChange(fields.map((field, i) => i === index ? { ...field, ...patch } : field)); }
    function move(index, direction) { const next = [...fields]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; onChange(next); }
    return <div className={styles.fields}>{fields.map((field, index) => <details className={styles.field} key={field.key} open={index === fields.length - 1}>
        <summary className={styles.summary}><span className={styles.handle} aria-hidden="true">⠿</span><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span className={styles.name}>{field.label || 'Untitled question'}</span>{field.required && <span className={styles.required} aria-label="Required">*</span>}<span className={styles.type}>{field.type}</span></summary>
        <fieldset className={styles.body} disabled={disabled}>
        <legend>Field {index + 1}: {field.label || 'Untitled'}</legend>
        <label>Label<input required maxLength={100} value={field.label} onChange={(e) => update(index, { label: e.target.value })} /></label>
        <label>Type<select value={field.type} onChange={(e) => update(index, { type: e.target.value })}>{FIELD_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        {['select', 'radio', 'multiselect', 'grid', 'checkboxgrid'].includes(field.type) && <label>Options, one per line<textarea required value={(field.options || []).join('\n')} onChange={(e) => update(index, { options: e.target.value.split('\n') })} /></label>}
        {['grid', 'checkboxgrid'].includes(field.type) && <label>Grid rows, one per line<textarea required value={(field.rows || []).join('\n')} onChange={(e) => update(index, { rows: e.target.value.split('\n') })} /></label>}
        <label><input type="checkbox" checked={field.required} onChange={(e) => update(index, { required: e.target.checked })} />Required</label>
        <details><summary>Validation, defaults and visibility</summary>
            {['file', 'image'].includes(field.type) && <><label>Maximum file size (bytes, up to 5242880)<input type="number" min="1" max="5242880" value={field.maxFileBytes ?? 5242880} onChange={(e) => update(index, { maxFileBytes: Number(e.target.value) })} /></label><label>Allowed formats<select multiple value={field.acceptedTypes || (field.type === 'image' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg'])} onChange={(e) => update(index, { acceptedTypes: [...e.target.selectedOptions].map((o) => o.value) })}>{(field.type === 'image' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg']).map((t) => <option key={t}>{t}</option>)}</select></label></>}
            <label>Description<textarea maxLength={2000} value={field.description || ''} onChange={(e) => update(index, { description: e.target.value })} /></label>
            <label>Placeholder<input maxLength={200} value={field.placeholder || ''} onChange={(e) => update(index, { placeholder: e.target.value })} /></label>
            <label>Default value<input maxLength={2000} value={field.defaultValue || ''} onChange={(e) => update(index, { defaultValue: e.target.value })} /></label>
            {['minimum', 'maximum', 'minLength', 'maxLength'].map((key) => <label key={key}>{({ minimum: 'Minimum number', maximum: 'Maximum number', minLength: 'Minimum characters', maxLength: 'Maximum characters' })[key]}<input type="number" value={field[key] ?? ''} onChange={(e) => update(index, { [key]: e.target.value === '' ? null : Number(e.target.value) })} /></label>)}
            <label>Custom validation message<input maxLength={200} value={field.errorMessage || ''} onChange={(e) => update(index, { errorMessage: e.target.value })} /></label>
            <label>Show only when<select value={field.condition?.field || ''} onChange={(e) => update(index, { condition: e.target.value ? { field: e.target.value, value: '' } : null })}><option value="">Always visible</option>{fields.slice(0, index).map((f) => <option value={f.key} key={f.key}>{f.label}</option>)}</select></label>
            {field.condition && <label>Equals<input value={field.condition.value} onChange={(e) => update(index, { condition: { ...field.condition, value: e.target.value } })} /></label>}
        </details>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="button" disabled={index === 0 || fields.some((f) => f.condition)} onClick={() => move(index, -1)}>Move up</button>
            <button type="button" disabled={index === fields.length - 1 || fields.some((f) => f.condition)} onClick={() => move(index, 1)}>Move down</button>
            <button type="button" disabled={fields.length === 1 || fields.some((f) => f.condition?.field === field.key)} onClick={() => onChange(fields.filter((_, i) => i !== index))}>Remove</button>
        </div>
        </fieldset>
    </details>)}</div>;
}
