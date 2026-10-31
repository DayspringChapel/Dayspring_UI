'use client';
import { useRef, useState } from 'react';
import DynamicFields from './DynamicFields';
import { formSections } from '@/lib/formStructure';
import { fieldVisible } from '@/lib/formCertificates';
import styles from './SectionedFields.module.css';

export default function SectionedFields({ fields, answers, onChange, onUpload, busy = false, uncertain = false, preview = false }) {
    const sections = formSections(fields); const [step, setStep] = useState(0); const container = useRef(null);
    const index = Math.min(step, sections.length - 1); const section = sections[index];
    function next() {
        if (!preview) for (const input of container.current.querySelectorAll('input,textarea,select')) if (!input.reportValidity()) return;
        setStep(index + 1); container.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return <div className={styles.wizard} ref={container}>
        {sections.length > 1 && <><div className={styles.progress}><span>Section {index + 1} of {sections.length}</span><span>{Math.round((index + 1) / sections.length * 100)}%</span></div><progress aria-label="Form progress" max={sections.length} value={index + 1} /></>}
        {section.marker && <header className={styles.heading}><h2>{section.title}</h2>{section.description && <p>{section.description}</p>}</header>}
        <div className={styles.fields}><DynamicFields fields={section.fields} answers={answers} onChange={(nextAnswers) => { const visible = { ...nextAnswers }; for (const field of fields) if (!fieldVisible(field, visible)) delete visible[field.key]; onChange(visible); }} onUpload={onUpload} preview={preview} /></div>
        <div className={styles.navigation}>{index > 0 && <button type="button" className={styles.back} disabled={busy} onClick={() => setStep(index - 1)}>Back</button>}
            {index < sections.length - 1 ? <button type="button" disabled={busy} onClick={next}>Next section →</button> : <button type={preview ? 'button' : 'submit'} disabled={busy || preview}>{busy ? 'Saving your response…' : uncertain ? 'Check my submission again' : 'Submit form'}</button>}
        </div>
    </div>;
}
