'use client';
import { useId, useState } from 'react';
import { changeAnswer, fieldVisible } from '@/lib/formCertificates';
import styles from './RespondentFields.module.css';
const list = (value) => { try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; } };
const grid = (value) => { try { const parsed = JSON.parse(value || '{}'); return parsed && !Array.isArray(parsed) && typeof parsed === 'object' ? parsed : {}; } catch { return {}; } };
export default function DynamicFields({ fields, answers, onChange, onUpload, preview = false }) {
    const prefix = useId(); const [errors, setErrors] = useState({});
    function update(field, value) { setErrors((current) => ({ ...current, [field.key]: '' })); onChange(changeAnswer(fields, answers, field.key, value)); }
    return fields.filter((field) => fieldVisible(field, answers)).map((field) => {
        if (field.type === 'hidden') return null;
        if (field.type === 'section') return <h2 key={field.key}>{field.label}</h2>;
        if (field.type === 'description') return <p key={field.key}>{field.label}{field.description ? ` — ${field.description}` : ''}</p>;
        if (field.type === 'pagebreak') return <hr key={field.key} />;
        const id = `${prefix}-${field.key}`; const help = `${id}-help`; const errorId = `${id}-error`; const value = answers[field.key] ?? field.defaultValue ?? '';
        const title = <>{field.label}{field.required && <span className={styles.required} aria-label="required"> *</span>}</>;
        const description = field.description && <p className={styles.description} id={help}>{field.description}</p>;
        const error = errors[field.key] && <p className={styles.error} id={errorId} role="alert">{errors[field.key]}</p>;
        const props = { id, required: !preview && field.required, value, placeholder: field.placeholder || '', minLength: field.minLength ?? undefined, maxLength: field.maxLength ?? 2000,
            min: field.minimum ?? (field.type === 'rating' ? 1 : undefined), max: field.maximum ?? (field.type === 'rating' ? 5 : undefined),
            onChange: (event) => update(field, event.target.value), 'aria-describedby': [field.description && help, errors[field.key] && errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': errors[field.key] ? true : undefined, onInvalid: (event) => setErrors((current) => ({ ...current, [field.key]: field.errorMessage || event.target.validationMessage })) };
        if (['radio', 'yesno', 'multiselect', 'checkbox', 'consent'].includes(field.type)) {
            const multiple = field.type === 'multiselect'; const singleCheck = ['checkbox', 'consent'].includes(field.type); const selected = multiple ? list(value) : [];
            const choices = field.type === 'yesno' ? ['Yes', 'No'] : singleCheck ? [field.type === 'consent' ? 'I agree' : 'Yes'] : field.options || [];
            return <fieldset key={field.key} className={styles.question}><legend>{title}</legend>{description}<div className={`${styles.choices} ${choices.length === 2 ? styles.pair : ''}`}>{choices.map((option, index) => <label className={styles.choice} key={option}>
                <input id={`${id}-${index}`} type={multiple || singleCheck ? 'checkbox' : 'radio'} name={id} value={option} checked={multiple ? selected.includes(option) : singleCheck ? value === 'true' : value === option}
                    required={!preview && field.required && (multiple ? selected.length === 0 && index === 0 : true)} aria-describedby={field.description ? help : undefined}
                    onChange={(event) => update(field, multiple ? JSON.stringify(event.target.checked ? [...selected, option] : selected.filter((item) => item !== option)) : singleCheck ? String(event.target.checked) : option)} />
                <span>{option}</span><span className={styles.checkmark} aria-hidden="true">✓</span></label>)}</div>{error}</fieldset>;
        }
        if (['grid', 'checkboxgrid'].includes(field.type)) {
            const selected = grid(value); const choices = field.options || [];
            return <fieldset className={styles.question} key={field.key}><legend>{title}</legend>{description}<div className={styles.gridScroll}><table><thead><tr><th>Question</th>{choices.map((option) => <th key={option}>{option}</th>)}</tr></thead><tbody>{(field.rows || []).map((row) => <tr key={row}><th scope="row">{row}</th>{choices.map((option, index) => <td key={option}><input aria-label={`${row}: ${option}`} type={field.type === 'grid' ? 'radio' : 'checkbox'} name={`${id}-${row}`} checked={list(JSON.stringify(selected[row])).includes(option)} required={!preview && field.required && (field.type === 'grid' || !(selected[row]?.length) && index === 0)} onChange={(event) => { const previous = Array.isArray(selected[row]) ? selected[row] : []; update(field, JSON.stringify({ ...selected, [row]: field.type === 'grid' ? [option] : event.target.checked ? [...previous, option] : previous.filter((item) => item !== option) })); }} /></td>)}</tr>)}</tbody></table></div>{error}</fieldset>;
        }
        return <div key={field.key} className={styles.question}><label className={styles.title} htmlFor={id}>{title}</label>{description}
            {['file', 'image'].includes(field.type) ? <div className={styles.upload}><input id={id} type="file" required={!preview && field.required && !value} disabled={!onUpload} accept={(field.acceptedTypes?.length ? field.acceptedTypes : field.type === 'image' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg']).join(',')} onChange={async (event) => { const file = event.target.files?.[0]; if (file && onUpload) await onUpload(field, file); }} /><small>{value ? 'File uploaded and ready to submit.' : `Choose a file up to ${Math.round((field.maxFileBytes || 5242880) / 1048576 * 10) / 10} MB.`}</small></div> :
                ['textarea', 'address'].includes(field.type) ? <textarea className={styles.control} {...props} /> : field.type === 'select' ? <select className={styles.control} {...props}><option value="">Choose an option</option>{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select> : <input className={styles.control} {...props} type={['rating', 'scale'].includes(field.type) ? 'number' : field.type} step={['number', 'rating', 'scale'].includes(field.type) ? 'any' : undefined} />}
            {error}</div>;
    });
}