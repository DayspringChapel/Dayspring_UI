'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import BuilderFields from '@/components/forms/BuilderFields';
import PublicationSettings from '@/components/forms/PublicationSettings';
import { formFields, formSettings } from '@/lib/formCertificates';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';
import styles from './forms.module.css';

const NEW_FIELD = () => ({ key: `field_${crypto.randomUUID().slice(0, 8)}`, label: '', type: 'text', required: false, options: [] });
const EMPTY_FORM = () => ({ operationKey: crypto.randomUUID(), title: '', description: '', attachCertificate: false,
    settings: { accessMode: 'Public', timeZone: 'Africa/Lagos' }, fields: [{ key: 'full_name', label: 'Full name', type: 'text', required: true, options: [] }] });

export default function FormsAdminPage() {
    const [forms, setForms] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [responses, setResponses] = useState({ items: [], total: 0 });
    const [responsePage, setResponsePage] = useState(1);
    const [draft, setDraft] = useState(null);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [responsesLoading, setResponsesLoading] = useState(false);
    const [responseError, setResponseError] = useState('');
    const [reload, setReload] = useState(0);
    const pending = useRef(false);
    const { dialog, confirm, closeDialog } = useConfirm();
    const can = (permission) => apiClient.hasPermission(permission);
    const currentUser = apiClient.getUserData()?.id;

    useEffect(() => {
        const controller = new AbortController();
        apiClient.request(`/api/v1/forms?page=${page}`, { signal: controller.signal })
            .then((result) => { setForms(result.items); setTotal(result.total); })
            .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, reload]);

    const loadResponses = useCallback(async (id, signal) => {
        try {
            const result = await apiClient.request(`/api/v1/forms/${id}/submissions?page=${responsePage}`, { signal });
            if (!signal?.aborted) { setResponses(result); setResponseError(''); }
        } catch (err) { if (!signal?.aborted) setResponseError(err.message); }
        finally { if (!signal?.aborted) setResponsesLoading(false); }
    }, [responsePage]);

    useEffect(() => {
        if (!selected) return;
        const controller = new AbortController();
        loadResponses(selected, controller.signal);
        return () => controller.abort();
    }, [selected, loadResponses, reload]);

    async function mutate(work, success) {
        if (pending.current) return;
        pending.current = true; setBusy(true); setError(''); setNotice('');
        try { await work(); setNotice(success); setReload((value) => value + 1); }
        catch (err) { setError(err.message || 'The operation could not be confirmed. Refresh before trying again.'); }
        finally { pending.current = false; setBusy(false); }
    }

    async function save(event) {
        event.preventDefault();
        await mutate(async () => {
            await apiClient.request(`/api/v1/forms${draft.id ? `/${draft.id}` : ''}`, {
                method: draft.id ? 'PUT' : 'POST', idempotencyKey: draft.operationKey,
                body: JSON.stringify({ ...draft, expectedRevision: draft.revision,
                    fields: draft.fields.map((field) => ({ ...field, options: ['select', 'radio', 'multiselect', 'grid', 'checkboxgrid'].includes(field.type) ? field.options : null })) }),
            });
            setDraft(null);
        }, 'Form saved. Certificate settings apply to new submissions; existing codes remain valid.');
    }

    async function publication(form) {
        const yes = await confirm({ title: form.isPublished ? 'Close this form?' : 'Publish this form?',
            message: form.isPublished ? 'New submissions will stop. Existing certificate codes will remain usable.' : 'Anyone with the form link will be able to submit a response.',
            confirmLabel: form.isPublished ? 'Close form' : 'Publish form' });
        if (yes) await mutate(() => apiClient.request(`/api/v1/forms/${form.id}/publication`, {
            method: 'POST', body: JSON.stringify({ published: !form.isPublished, expectedRevision: form.revision }),
        }), form.isPublished ? 'Form closed.' : 'Form published.');
    }

    async function attach(row, file, input) {
        if (!file) return;
        if (file.size > 5242880 || !file.name.toLowerCase().endsWith('.pdf')) { setError('Select a PDF file of up to 5 MB.'); input.value = ''; return; }
        await mutate(async () => {
            const data = new FormData(); data.append('file', file);
            if (row.certificate) data.append('expectedRevision', row.certificate.revision);
            await apiClient.upload(`/api/v1/forms/${selected}/submissions/${row.id}/certificate`, data);
        }, 'Certificate attached as a draft. Another administrator must approve it before issuance.');
        input.value = '';
    }

    async function decision(certificate, action) {
        const yes = await confirm({ title: `${action[0].toUpperCase() + action.slice(1)} certificate?`,
            message: action === 'issue' ? 'The form submitter will be able to download this PDF using their private code.' :
                action === 'approve' ? 'Confirm you reviewed the PDF and matched it to the correct form response.' : 'The private code will stop providing this certificate.',
            confirmLabel: `${action[0].toUpperCase() + action.slice(1)} certificate`, danger: action === 'revoke',
            showInput: action === 'revoke', inputLabel: 'Reason for revocation (required)', inputPlaceholder: 'Explain why this certificate must be revoked' });
        const reason = action === 'revoke' && typeof yes === 'string' ? yes.trim() : undefined;
        if (action === 'revoke' && yes !== false && !reason) { setError('A revocation reason is required.'); return; }
        if (yes) await mutate(() => apiClient.request(`/api/v1/certificates/${certificate.id}/${action}`, {
            method: 'POST', body: JSON.stringify({ expectedRevision: certificate.revision, reason }),
        }), `Certificate action completed: ${action}.`);
    }

    async function copyLink(id) {
        try { await navigator.clipboard.writeText(`${window.location.origin}/forms/${id}`); setNotice('Form link copied.'); }
        catch { setError(`Copy this form link: ${window.location.origin}/forms/${id}`); }
    }

    return <section className={styles.page}>
        <AdminConfirm dialog={dialog} onClose={closeDialog} />
        <header className={styles.header}><div><h2>Forms &amp; certificates</h2><p>Manage forms, responses and individual certificate downloads.</p></div>
            <div className={styles.actions}>
                <button disabled={busy || loading} onClick={() => { setLoading(true); setReload((value) => value + 1); }}>Refresh</button>
                {can('forms.create') && <button disabled={busy} onClick={() => setDraft(EMPTY_FORM())}>Create form</button>}
            </div>
        </header>
        {notice && <p role="status" className={styles.notice}>{notice}</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {draft && <form onSubmit={save} className={styles.editor}>
            <h3>{draft.id ? 'Edit form' : 'Create form'}</h3>
            <label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required maxLength={200} /></label>
            <label>Description<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={2000} /></label>
            <label className={styles.checkbox}><input type="checkbox" checked={draft.attachCertificate} onChange={(e) => setDraft({ ...draft, attachCertificate: e.target.checked })} />Attach certificate to this form</label>
            <p className={styles.muted}>When enabled, a saved response receives a private download code. Attach a personalized PDF to that response, have another administrator approve it, then issue it. The code does not bypass approval.</p>
            <h4>Form fields</h4>
            <PublicationSettings settings={draft.settings || {}} onChange={(settings) => setDraft({ ...draft, settings })} />
            <BuilderFields fields={draft.fields} onChange={(fields) => setDraft({ ...draft, fields })} disabled={busy} />
            <div className={styles.actions}>
                <button type="button" disabled={draft.fields.length >= 40 || busy} onClick={() => setDraft({ ...draft, fields: [...draft.fields, NEW_FIELD()] })}>Add field</button>
                <button disabled={busy} type="submit">{busy ? 'Saving…' : 'Save form'}</button>
                <button disabled={busy} type="button" onClick={() => setDraft(null)}>Cancel</button>
            </div>
        </form>}
        {loading ? <p role="status">Loading forms…</p> : forms.length === 0 ? <p>No forms have been created yet.</p> : <div className={styles.grid}>
            {forms.map((form) => <article key={form.id} className={selected === form.id ? styles.selected : styles.card}>
                <h3>{form.title}</h3><p>{form.description}</p>
                <p><strong>{form.status || (form.isPublished ? 'Published' : 'Draft / closed')}</strong> · Certificate downloads {form.attachCertificate ? 'enabled' : 'disabled'} · Revision {form.revision}</p>
                <div className={styles.actions}>
                    {can('forms.edit') && <button disabled={busy} onClick={() => setDraft({ ...form, operationKey: crypto.randomUUID(), fields: formFields(form), settings: formSettings(form) })}>Edit form</button>}
                    {can('forms.publish') && <button disabled={busy} onClick={() => publication(form)}>{form.isPublished ? 'Close form' : 'Publish form'}</button>}
                    <button onClick={() => copyLink(form.id)}>Copy link</button>
                    <a href={`/admin/forms/${form.id}/preview`}>Preview</a>
                    {can('forms.create') && <button disabled={busy} onClick={() => mutate(() => apiClient.request(`/api/v1/forms/${form.id}/duplicate`, { method: 'POST' }), 'Draft copy created.')}>Duplicate</button>}
                    {can('forms.submit_for_approval') && form.status !== 'Archived' && <button disabled={busy} onClick={() => mutate(() => apiClient.request(`/api/v1/forms/${form.id}/submit-for-approval`, { method: 'POST', body: JSON.stringify({ expectedRevision: form.revision }) }), 'Form submitted for approval.')}>Submit for approval</button>}
                    {can('forms.analytics.view') && <a href={`/admin/forms/${form.id}/analytics`}>Analytics &amp; QR</a>}
                    {can('forms.responses.export') && <button disabled={busy} onClick={() => mutate(() => apiClient.downloadFile(`/api/v1/forms/${form.id}/export`, 'form-responses.xlsx'), 'Excel export downloaded.')}>Export Excel</button>}
                    {can('forms.archive') && form.status !== 'Archived' && <button disabled={busy} onClick={async () => { if (await confirm({ title: 'Archive form?', message: 'This stops publication and submissions while preserving responses.', confirmLabel: 'Archive' })) await mutate(() => apiClient.request(`/api/v1/forms/${form.id}/archive`, { method: 'POST', body: JSON.stringify({ expectedRevision: form.revision }) }), 'Form archived.'); }}>Archive</button>}

                    {form.isPublished && <a target="_blank" rel="noopener noreferrer" href={`/forms/${form.id}`}>Open form</a>}
                    {can('forms.responses.view') && <button disabled={busy} onClick={() => { setResponsesLoading(true); setSelected(form.id); setResponsePage(1); setReload((value) => value + 1); }}>View responses</button>}
                </div>
            </article>)}
        </div>}
        <div className={styles.actions}>
            <button disabled={page === 1 || busy} onClick={() => { setLoading(true); setPage(page - 1); }}>Previous</button>
            <span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>
            <button disabled={page * 25 >= total || busy} onClick={() => { setLoading(true); setPage(page + 1); }}>Next</button>
        </div>
        {selected && <section className={styles.responses}>
            <h3>Form responses</h3><p>Download codes are displayed privately to submitters and are not listed here.</p>
            {responseError ? <p role="alert" className={styles.error}>{responseError}</p> : responsesLoading ? <p role="status">Loading responses…</p> : responses.items.length === 0 ? <p>No responses yet.</p> : responses.items.map((row) => {
                const answers = JSON.parse(row.answersJson);
                const fields = formFields({ fieldsJson: row.formSnapshotJson });
                const certificate = row.certificate;
                return <article key={row.id} className={styles.card}>
                    <h4>Response {row.id}</h4><p>{new Date(row.submittedAt).toLocaleString()} · Form revision {row.formRevision}</p>
                    <dl>{fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{answers[field.key] || '—'}</dd></div>)}</dl>
                    <p>Review status: <strong>{row.reviewStatus || 'Submitted'}</strong></p>
                    {can('forms.responses.review') && <div className={styles.actions}>{['Under Review', 'Approved', 'Rejected', 'Returned'].map((status) => <button key={status} disabled={busy} onClick={async () => {
                        const comment = await confirm({ title: `${status}: response?`, message: 'This decision will be recorded in the audit history.', confirmLabel: status, showInput: true, inputLabel: 'Review comment (required for rejection or return)' });
                        if (comment !== false) await mutate(() => apiClient.request(`/api/v1/forms/${selected}/submissions/${row.id}/review`, { method: 'POST', body: JSON.stringify({ expectedRevision: row.revision, status, comment: typeof comment === 'string' ? comment : '' }) }), 'Review saved.');
                    }}>{status}</button>)}</div>}
                    {!row.hasCertificate ? <p>No certificate attached to this submission.</p> : <>
                        <p>Certificate: <strong>{certificate?.status || 'Awaiting PDF'}</strong></p>
                        <div className={styles.actions}>
                            {can('certificates.generate') && !['Issued', 'Revoked'].includes(certificate?.status) && <label className={styles.fileLabel}>
                                {certificate ? 'Replace draft PDF' : 'Attach certificate PDF'}
                                <input aria-label="Certificate PDF" disabled={busy} type="file" accept="application/pdf,.pdf" onChange={(e) => attach(row, e.target.files?.[0], e.target)} />
                            </label>}
                            {certificate && can('certificates.records.view') && <button disabled={busy} onClick={() => mutate(() => apiClient.downloadFile(`/api/v1/certificates/${certificate.id}/preview`, 'certificate-review.pdf'), 'Certificate downloaded for review.')}>Review PDF</button>}
                            {certificate?.status === 'Draft' && can('certificates.approve') && certificate.uploadedBy !== currentUser && <button disabled={busy} onClick={() => decision(certificate, 'approve')}>Approve</button>}
                            {certificate?.status === 'Draft' && certificate.uploadedBy === currentUser && <p>A different administrator must approve your upload.</p>}
                            {certificate?.status === 'Approved' && can('certificates.issue') && <button disabled={busy} onClick={() => decision(certificate, 'issue')}>Issue certificate</button>}
                            {certificate?.status === 'Issued' && can('certificates.revoke') && <button disabled={busy} onClick={() => decision(certificate, 'revoke')}>Revoke</button>}
                        </div>
                    </>}
                </article>;
            })}
            <div className={styles.actions}>
                <button disabled={responsePage === 1 || busy} onClick={() => { setResponsesLoading(true); setResponsePage(responsePage - 1); }}>Previous responses</button>
                <span>Page {responsePage} of {Math.max(1, Math.ceil(responses.total / 25))}</span>
                <button disabled={responsePage * 25 >= responses.total || busy} onClick={() => { setResponsesLoading(true); setResponsePage(responsePage + 1); }}>Next responses</button>
            </div>
        </section>}
    </section>;
}
