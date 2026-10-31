'use client';
import { useRef, useState } from 'react';
import { moveField, reorderField } from '@/lib/formStructure';
import { FIELD_TYPES } from '@/lib/formCertificates';
import styles from './BuilderFields.module.css';

const LABELS = { text: 'Short answer', textarea: 'Paragraph', select: 'Dropdown', radio: 'Multiple choice', multiselect: 'Multiple selections', checkbox: 'Checkbox', yesno: 'Yes / No', tel: 'Phone number', 'datetime-local': 'Date & time', checkboxgrid: 'Checkbox grid', pagebreak: 'Page break' };

export default function BuilderFields({ fields, onChange, disabled }) {
    const [dragged, setDragged] = useState(null); const [over, setOver] = useState(null); const [announcement, setAnnouncement] = useState('');
    const touchKey = useRef(null);
    function relocate(key, target) {
        if (disabled || !key || !target) return;
        const next = reorderField(fields, key, target);
        if (next) { onChange(next); setAnnouncement('Order updated.'); }
        else setAnnouncement('This move would place a conditional question before the question it depends on.');
        setDragged(null); setOver(null);
    }
    function move(key, direction) { const next = moveField(fields, key, direction); if (next) { onChange(next); setAnnouncement('Order updated.'); } }
    function update(index, patch) { onChange(fields.map((field, i) => i === index ? { ...field, ...patch } : field)); }

    return <div className={styles.fields}><p role="status" aria-live="polite" className={styles.orderNotice}>{announcement}</p>{fields.map((field, index) => <details className={`${styles.field} ${field.type === 'section' ? styles.sectionCard : ''} ${over === field.key ? styles.dropTarget : ''} ${dragged === field.key ? styles.dragging : ''}`} data-field-key={field.key} key={field.key} open={index === fields.length - 1}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(field.key); }}
        onDrop={(event) => { event.preventDefault(); relocate(event.dataTransfer.getData('text/plain'), field.key); }}>

        <summary className={styles.summary}><button type="button" className={styles.handle} draggable={!disabled} disabled={disabled} aria-label={`Drag ${field.label || 'question'} to reorder`} title="Drag to move. Move up/down buttons are also available."
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
        onDragStart={(event) => { event.dataTransfer.setData('text/plain', field.key); event.dataTransfer.effectAllowed = 'move'; setDragged(field.key); }}
        onDragEnd={() => { setDragged(null); setOver(null); }}
        onPointerDown={(event) => { if (event.pointerType === 'mouse') return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); touchKey.current = field.key; setDragged(field.key); }}
        onPointerMove={(event) => { if (!touchKey.current) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-field-key]'); if (target) setOver(target.dataset.fieldKey); }}
        onPointerUp={(event) => { if (!touchKey.current) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-field-key]'); relocate(touchKey.current, target?.dataset.fieldKey); touchKey.current = null; }}
        onPointerCancel={() => { touchKey.current = null; setDragged(null); setOver(null); }}>⠿</button><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span className={styles.name}>{field.label || 'Untitled question'}</span>{field.required && <span className={styles.required} aria-label="Required">*</span>}<span className={styles.type}>{field.type}</span></summary>
        <fieldset className={styles.body} disabled={disabled}>
        <legend>Field {index + 1}: {field.label || 'Untitled'}</legend>
        <div className={styles.questionHeader}><label>Label<input placeholder="Untitled question" required maxLength={100} value={field.label} onChange={(e) => update(index, { label: e.target.value })} /></label>
        {field.type !== 'section' && <label>Question type<select value={field.type} onChange={(e) => update(index, { type: e.target.value, ...(['select', 'radio', 'multiselect', 'grid', 'checkboxgrid'].includes(e.target.value) && !field.options?.length ? { options: ['Option 1'] } : {}) })}>{FIELD_TYPES.map((type) => <option key={type} value={type}>{LABELS[type] || type[0].toUpperCase() + type.slice(1)}</option>)}</select></label>}</div>
        {['select', 'radio', 'multiselect', 'grid', 'checkboxgrid'].includes(field.type) && <label>Options, one per line<textarea required value={(field.options || []).join('\n')} onChange={(e) => update(index, { options: e.target.value.split('\n') })} /></label>}
        {['grid', 'checkboxgrid'].includes(field.type) && <label>Grid rows, one per line<textarea required value={(field.rows || []).join('\n')} onChange={(e) => update(index, { rows: e.target.value.split('\n') })} /></label>}
        {field.type !== 'section' && <label><input type="checkbox" checked={field.required} onChange={(e) => update(index, { required: e.target.checked })} />Required</label>}
        {field.type === 'section' ? <label>Section description<textarea maxLength={2000} value={field.description || ''} onChange={(event) => update(index, { description: event.target.value })} /></label> : <details><summary>Validation, defaults and visibility</summary>
            {['file', 'image'].includes(field.type) && <><label>Maximum file size (bytes, up to 5242880)<input type="number" min="1" max="5242880" value={field.maxFileBytes ?? 5242880} onChange={(e) => update(index, { maxFileBytes: Number(e.target.value) })} /></label><label>Allowed formats<select multiple value={field.acceptedTypes || (field.type === 'image' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg'])} onChange={(e) => update(index, { acceptedTypes: [...e.target.selectedOptions].map((o) => o.value) })}>{(field.type === 'image' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg']).map((t) => <option key={t}>{t}</option>)}</select></label></>}
            <label>Description<textarea maxLength={2000} value={field.description || ''} onChange={(e) => update(index, { description: e.target.value })} /></label>
            <label>Placeholder<input maxLength={200} value={field.placeholder || ''} onChange={(e) => update(index, { placeholder: e.target.value })} /></label>
            <label>Default value<input maxLength={2000} value={field.defaultValue || ''} onChange={(e) => update(index, { defaultValue: e.target.value })} /></label>
            {['minimum', 'maximum', 'minLength', 'maxLength'].map((key) => <label key={key}>{({ minimum: 'Minimum number', maximum: 'Maximum number', minLength: 'Minimum characters', maxLength: 'Maximum characters' })[key]}<input type="number" value={field[key] ?? ''} onChange={(e) => update(index, { [key]: e.target.value === '' ? null : Number(e.target.value) })} /></label>)}
            <label>Custom validation message<input maxLength={200} value={field.errorMessage || ''} onChange={(e) => update(index, { errorMessage: e.target.value })} /></label>
            <label>Show only when<select value={field.condition?.field || ''} onChange={(e) => update(index, { condition: e.target.value ? { field: e.target.value, value: '' } : null })}><option value="">Always visible</option>{fields.slice(0, index).map((f) => <option value={f.key} key={f.key}>{f.label}</option>)}</select></label>
            {field.condition && <label>Equals<input value={field.condition.value} onChange={(e) => update(index, { condition: { ...field.condition, value: e.target.value } })} /></label>}
        </details>}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {field.type !== 'section' && <button type="button" disabled={fields.length >= 40} onClick={() => { const copy = { ...field, key: `field_${crypto.randomUUID().slice(0, 8)}`, label: `${field.label || 'Question'} (copy)`.slice(0, 100) }; onChange([...fields.slice(0, index + 1), copy, ...fields.slice(index + 1)]); }}>Duplicate</button>}
            <button type="button" disabled={!moveField(fields, field.key, -1)} onClick={() => move(field.key, -1)}>Move up</button>
            <button type="button" disabled={!moveField(fields, field.key, 1)} onClick={() => move(field.key, 1)}>Move down</button>
            <button type="button" disabled={fields.length === 1 || fields.some((f) => f.condition?.field === field.key)} onClick={() => onChange(fields.filter((_, i) => i !== index))}>{field.type === 'section' ? 'Remove section, keep questions' : 'Remove'}</button>
        </div>
        </fieldset>
    </details>)}</div>;
}
