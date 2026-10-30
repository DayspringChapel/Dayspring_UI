'use client';
import { changeAnswer, fieldVisible } from '@/lib/formCertificates';
import styles from './forms.module.css';

export default function DynamicFields({ fields, answers, onChange, onUpload, preview = false }) {
    function update(field, value) { onChange(changeAnswer(fields, answers, field.key, value)); }
    return fields.filter((f) => fieldVisible(f, answers)).map((field) => {
        if (field.type === 'hidden') return null;
        if (field.type === 'section') return <h2 key={field.key}>{field.label}</h2>;
        if (field.type === 'description') return <p key={field.key}>{field.label}{field.description ? ` — ${field.description}` : ''}</p>;
        if (field.type === 'pagebreak') return <hr key={field.key} />;
        const value = answers[field.key] ?? field.defaultValue ?? '';
        const props = { id: field.key, required: !preview && field.required, value, placeholder: field.placeholder || '',
            minLength: field.minLength ?? undefined, maxLength: field.maxLength ?? 2000, min: field.minimum ?? (field.type === 'rating' ? 1 : undefined), max: field.maximum ?? (field.type === 'rating' ? 5 : undefined),
            onChange: (e) => update(field, e.target.value), 'aria-describedby': field.description ? `${field.key}-help` : undefined };
        const choices = field.type === 'yesno' ? ['Yes', 'No'] : field.options || [];
        if (['grid', 'checkboxgrid'].includes(field.type)) {
            const selected = value ? JSON.parse(value) : {};
            return <fieldset key={field.key}><legend>{field.label}{field.required ? ' *' : ''}</legend><div style={{ overflowX: 'auto' }}><table><thead><tr><th>Question</th>{choices.map((option) => <th key={option}>{option}</th>)}</tr></thead><tbody>{(field.rows || []).map((row) => <tr key={row}><th scope="row">{row}</th>{choices.map((option) => <td key={option}><input aria-label={`${row}: ${option}`} type={field.type === 'grid' ? 'radio' : 'checkbox'} name={`${field.key}-${row}`} checked={(selected[row] || []).includes(option)} required={!preview && field.type === 'grid' && field.required} onChange={(e) => {
                const next = field.type === 'grid' ? [option] : e.target.checked ? [...(selected[row] || []), option] : (selected[row] || []).filter((v) => v !== option);
                update(field, JSON.stringify({ ...selected, [row]: next }));
            }} /></td>)}</tr>)}</tbody></table></div></fieldset>;
        }
        return <div key={field.key} className={styles.label}>
            <label htmlFor={field.key}>{field.label}{field.required ? ' *' : ''}</label>
            {field.description && <small id={`${field.key}-help`}>{field.description}</small>}
            {['file', 'image'].includes(field.type) ? <><input id={field.key} type="file" required={!preview && field.required && !value} disabled={!onUpload} accept={(field.acceptedTypes?.length ? field.acceptedTypes : field.type === 'image' ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg']).join(',')} onChange={async (e) => { const file = e.target.files?.[0]; if (file && onUpload) await onUpload(field, file); }} />{value && <small>File uploaded and ready to submit.</small>}</> :
            ['textarea', 'address'].includes(field.type) ? <textarea {...props} /> :
                ['select', 'yesno'].includes(field.type) ? <select {...props}><option value="">Choose an option</option>{choices.map((option) => <option key={option}>{option}</option>)}</select> :
                    field.type === 'radio' ? <fieldset><legend>{field.label}</legend>{choices.map((option) => <label key={option} className={styles.checkbox}><input type="radio" name={field.key} value={option} checked={value === option} required={!preview && field.required} onChange={() => update(field, option)} />{option}</label>)}</fieldset> :
                        field.type === 'multiselect' ? <select {...props} multiple value={value ? JSON.parse(value) : []} onChange={(e) => update(field, JSON.stringify([...e.target.selectedOptions].map((o) => o.value)))}>{choices.map((option) => <option key={option}>{option}</option>)}</select> :
                            ['checkbox', 'consent'].includes(field.type) ? <label className={styles.checkbox}><input id={field.key} type="checkbox" required={!preview && field.required} checked={value === 'true'} onChange={(e) => update(field, String(e.target.checked))} />{field.type === 'consent' ? 'I consent' : 'Yes'}</label> :
                                <input {...props} type={['rating', 'scale'].includes(field.type) ? 'number' : field.type} step={['number', 'rating', 'scale'].includes(field.type) ? 'any' : undefined} />}
        </div>;
    });
}
