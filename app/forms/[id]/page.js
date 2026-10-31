'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import SectionedFields from '@/components/forms/SectionedFields';
import { formFields, fieldVisible, formSettings } from '@/lib/formCertificates';
import FormSurface from '@/components/forms/FormSurface';
import FormReceipt from '@/components/forms/FormReceipt';
import styles from '@/components/forms/forms.module.css';

function FormFiller({ id }) {
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [uncertain, setUncertain] = useState(false);
    const operation = useRef(null);
    const submitting = useRef(false);
    useEffect(() => {
        const controller = new AbortController();
        apiClient.request(`/api/v1/forms/${encodeURIComponent(id)}`, { signal: controller.signal })
            .then((data) => { data.fields = formFields(data); setForm(data); setAnswers(Object.fromEntries(data.fields.filter((f) => f.defaultValue != null).map((f) => [f.key, f.defaultValue]))); }).catch((err) => { if (!controller.signal.aborted) setError(err.message); });
        return () => controller.abort();
    }, [id]);

    async function submit(event) {
        event.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true); setError('');
        operation.current ||= crypto.randomUUID();
        try {
            const saved = await apiClient.request(`/api/v1/forms/${encodeURIComponent(id)}/submissions`, {
                method: 'POST', idempotencyKey: operation.current,
                body: JSON.stringify({ formRevision: form.revision, answers: Object.fromEntries(Object.entries(answers).filter(([key]) => fieldVisible(form.fields.find((f) => f.key === key), answers))) }),
            });
            setReceipt(saved);
        } catch (err) {
            setError(err.message || 'Unable to submit. Please try again.');
            setUncertain(!!err.ambiguous);
        } finally { submitting.current = false; setBusy(false); }
    }

    async function upload(field, file) {
        if (submitting.current) return;
        if (file.size > (field.maxFileBytes || 5242880)) { setError('The file exceeds this field’s size limit.'); return; }
        submitting.current = true; setBusy(true); setError(''); operation.current ||= crypto.randomUUID();
        try {
            const data = new FormData(); data.append('file', file); data.append('fieldKey', field.key); data.append('operationKey', operation.current); data.append('formRevision', form.revision);
            const saved = await apiClient.upload(`/api/v1/forms/${id}/uploads`, data);
            setAnswers((current) => ({ ...current, [field.key]: saved.id }));
        } catch (e) { setError(e.message); } finally { submitting.current = false; setBusy(false); }
    }

    return <div className={styles.themedPage}><FormSurface settings={form ? formSettings(form) : {}}><div className={styles.stack}>
        {receipt ? <FormReceipt receipt={receipt} /> : !form ? <>
            <h1>{error ? 'Form unavailable' : 'Loading form…'}</h1>
            {error && <p role="alert" className={styles.error}>{error}</p>}
        </> : form.canSubmit === false ? <>
            <h1>{form.title}</h1><p>{form.description}</p><p role="status" className={styles.notice}>{form.settings?.collectionPaused ? 'Response collection is temporarily paused. Please check back later.' : form.settings?.opensAt && Date.parse(form.settings.opensAt) > Date.now() ? `Responses open on ${new Date(form.settings.opensAt).toLocaleString()}.` : 'This form is no longer collecting responses. Thank you for your interest.'}</p>
        </> : <>
            <h1>{form.title}</h1><p>{form.description}</p>
            {form.attachCertificate && <p className={styles.notice}>After submission, you will receive a private code to download your certificate once it has been issued.</p>}
            <form onSubmit={submit} className={styles.stack}>
                <fieldset disabled={busy || uncertain} className={styles.fieldset}>
                    <legend className="sr-only">Your response</legend>
                    <SectionedFields fields={form.fields} answers={answers} onChange={setAnswers} onUpload={upload} busy={busy} uncertain={uncertain} />
                </fieldset>
                {error && <p role="alert" className={styles.error}>{error}</p>}
                {uncertain && <p>Your response may already have been saved. Check again using the same submission; a duplicate response will not be created.</p>}
            </form>
        </>}
    </div></FormSurface></div>;
}

export default function PublicFormPage() {
    const { id } = useParams();
    return <FormFiller key={id} id={id} />;
}
