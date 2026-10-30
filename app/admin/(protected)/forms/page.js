'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import FormComposer from '@/components/forms/FormComposer';
import FormActionsMenu from '@/components/forms/FormActionsMenu';
import { formFields, formSettings, formSavePayload } from '@/lib/formCertificates';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';
import styles from './forms.module.css';

const emptyForm = () => ({ operationKey: crypto.randomUUID(), title: '', description: '', attachCertificate: false,
    settings: { accessMode: 'Public', timeZone: 'Africa/Lagos' }, fields: [{ key: 'full_name', label: 'Full name', type: 'text', required: true, options: [] }] });
const dateLabel = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
function FormIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 3h8l4 4v14H7zM14 3v5h5M10 12h6M10 16h4" /></svg>; }
function effectiveStatus(form) {
    const settings = formSettings(form);
    if (form.status === 'Archived') return 'Archived';
    if (form.isPublished && settings.opensAt && Date.parse(settings.opensAt) > Date.now()) return 'Scheduled';
    if (form.isPublished && settings.closesAt && Date.parse(settings.closesAt) <= Date.now()) return 'Closed';
    return form.status || (form.isPublished ? 'Published' : 'Draft');
}

export default function FormsAdminPage() {
    const [forms, setForms] = useState([]); const [total, setTotal] = useState(0); const [summary, setSummary] = useState(null);
    const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
    const [selected, setSelected] = useState(null); const [responses, setResponses] = useState({ items: [], total: 0 });
    const [responsePage, setResponsePage] = useState(1); const [responseSearch, setResponseSearch] = useState(''); const [reviewFilter, setReviewFilter] = useState('');
    const [draft, setDraft] = useState(null); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [listError, setListError] = useState('');
    const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [responsesLoading, setResponsesLoading] = useState(false);
    const [responseError, setResponseError] = useState(''); const [reload, setReload] = useState(0);
    const pending = useRef(false); const inbox = useRef(null); const { dialog, confirm, closeDialog } = useConfirm();
    const can = (permission) => apiClient.hasPermission(permission); const currentUser = apiClient.getUserData()?.id;

    useEffect(() => {
        const controller = new AbortController();
        apiClient.request(`/api/v1/forms?${new URLSearchParams({ page, search, status })}`, { signal: controller.signal })
            .then((result) => { if (!controller.signal.aborted) { setForms(result.items); setTotal(result.total); setSummary(result.summary); setListError(''); } })
            .catch((err) => { if (!controller.signal.aborted) setListError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, search, status, reload]);

    const loadResponses = useCallback(async (id, signal) => {
        try {
            const result = await apiClient.request(`/api/v1/forms/${id}/submissions?${new URLSearchParams({ page: responsePage, search: responseSearch, status: reviewFilter })}`, { signal });
            if (!signal?.aborted) { setResponses(result); setResponseError(''); }
        } catch (err) { if (!signal?.aborted) setResponseError(err.message); }
        finally { if (!signal?.aborted) setResponsesLoading(false); }
    }, [responsePage, responseSearch, reviewFilter]);
    useEffect(() => {
        if (!selected) return;
        const controller = new AbortController(); loadResponses(selected, controller.signal);
        return () => controller.abort();
    }, [selected, loadResponses, reload]);
    useEffect(() => { if (selected) inbox.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [selected]);

    async function mutate(work, success) {
        if (pending.current) return;
        pending.current = true; setBusy(true); setError(''); setNotice('');
        try { await work(); if (success) setNotice(success); setReload((value) => value + 1); }
        catch (err) { setError(err.message || 'The result could not be confirmed. Refresh before trying again.'); }
        finally { pending.current = false; setBusy(false); }
    }
    async function save(event) {
        event.preventDefault();
        await mutate(async () => {
            await apiClient.request(`/api/v1/forms${draft.id ? `/${draft.id}` : ''}`, {
                method: draft.id ? 'PUT' : 'POST', idempotencyKey: draft.operationKey,
                body: JSON.stringify(formSavePayload(draft)),
            }); setDraft(null);
        }, 'Form saved. Review it, then publish when you are ready.');
    }
    function edit(form) { setError(''); setDraft({ ...form, operationKey: crypto.randomUUID(), fields: formFields(form), settings: formSettings(form) }); }
    function openResponses(id) { setResponsesLoading(true); setSelected(id); setResponsePage(1); setResponseSearch(''); setReviewFilter(''); setReload((v) => v + 1); }
    async function publication(form) {
        const yes = await confirm({ title: form.isPublished ? 'Close this form?' : 'Publish this form?',
            message: form.isPublished ? 'New submissions will stop. Saved responses and certificate codes are preserved.' : 'The configured access rules and submission dates will apply to the published form.',
            confirmLabel: form.isPublished ? 'Close form' : 'Publish form' });
        if (yes) await mutate(() => apiClient.request(`/api/v1/forms/${form.id}/publication`, { method: 'POST', body: JSON.stringify({ published: !form.isPublished, expectedRevision: form.revision }) }), form.isPublished ? 'Form closed.' : 'Form published.');
    }
    async function archive(form) {
        if (await confirm({ title: 'Archive form?', message: 'This stops submissions while preserving existing responses and certificates.', confirmLabel: 'Archive form' }))
            await mutate(() => apiClient.request(`/api/v1/forms/${form.id}/archive`, { method: 'POST', body: JSON.stringify({ expectedRevision: form.revision }) }), 'Form archived.');
    }
    async function copyLink(id) {
        try { await navigator.clipboard.writeText(`${window.location.origin}/forms/${id}`); setNotice('Form link copied.'); }
        catch { setError(`Copy this form link: ${window.location.origin}/forms/${id}`); }
    }
    async function attach(row, file, input) {
        if (!file) return;
        if (file.size > 5242880 || !file.name.toLowerCase().endsWith('.pdf')) { setError('Select a PDF file of up to 5 MB.'); input.value = ''; return; }
        await mutate(async () => {
            const data = new FormData(); data.append('file', file); if (row.certificate) data.append('expectedRevision', row.certificate.revision);
            await apiClient.upload(`/api/v1/forms/${selected}/submissions/${row.id}/certificate`, data);
        }, 'Draft certificate attached. Another administrator must approve it before issuance.'); input.value = '';
    }
    async function certificateDecision(certificate, action) {
        const yes = await confirm({ title: `${action[0].toUpperCase() + action.slice(1)} certificate?`,
            message: action === 'issue' ? 'The respondent can download this PDF using their private code.' : action === 'approve' ? 'Confirm that you reviewed the PDF and matched it to this response.' : 'This certificate will no longer be available through its private code.',
            confirmLabel: `${action[0].toUpperCase() + action.slice(1)} certificate`, danger: action === 'revoke', showInput: action === 'revoke', inputLabel: 'Reason for revocation (required)' });
        const reason = action === 'revoke' && typeof yes === 'string' ? yes.trim() : undefined;
        if (action === 'revoke' && yes !== false && !reason) { setError('A revocation reason is required.'); return; }
        if (yes) await mutate(() => apiClient.request(`/api/v1/certificates/${certificate.id}/${action}`, { method: 'POST', body: JSON.stringify({ expectedRevision: certificate.revision, reason }) }), 'Certificate updated.');
    }
    async function review(row, nextStatus) {
        const comment = await confirm({ title: `${nextStatus}: response?`, message: 'This decision will be recorded in the audit history.', confirmLabel: nextStatus, showInput: true, inputLabel: 'Comment (required for rejection or return)' });
        if (comment !== false) await mutate(() => apiClient.request(`/api/v1/forms/${selected}/submissions/${row.id}/review`, { method: 'POST', body: JSON.stringify({ expectedRevision: row.revision, status: nextStatus, comment: typeof comment === 'string' ? comment : '' }) }), 'Review saved.');
    }

    if (draft) return <FormComposer draft={draft} onChange={setDraft} onSave={save} onClose={() => { setDraft(null); setError(''); }} busy={busy} error={error} />;
    const tabs = [['', 'All forms', summary?.total], ['Published', 'Published', summary?.published], ['Unpublished', 'Unpublished', summary?.unpublished], ['Archived', 'Archived', summary?.archived]];
    return <section className={`${styles.page} ${styles.workspace}`}>
        <AdminConfirm dialog={dialog} onClose={closeDialog} />
        <header className={styles.workspaceHeader}><div><p className={styles.eyebrow}>CHURCH WORKSPACE</p><h2>Every response starts<br />with a <span>good question.</span></h2><p className={styles.headerDescription}>Create forms, bring people together, and turn responses into your next step.</p></div><div className={styles.headerActions}>
            <button className={styles.refreshButton} disabled={busy || loading} onClick={() => { setLoading(true); setReload((v) => v + 1); }} aria-label="Refresh forms"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-2L20 8M4 16l2.4 3A7 7 0 0 0 18 17" /></svg></button>
            {can('forms.create') && <button className={styles.createButton} disabled={busy} onClick={() => { setError(''); setDraft(emptyForm()); }}><span>＋</span>Create a form</button>}
        </div></header>
        {summary && <div className={styles.summaryGrid}>{[['Total forms', summary.total, 'Built for your community', 'all'], ['Published', summary.published, 'Ready to collect responses', 'live'], ['Unpublished', summary.unpublished, 'A little work in progress', 'draft'], ['Archived', summary.archived, 'Safely kept for reference', 'archive']].map(([label, value, note, type]) => <article key={label} className={styles.summaryCard}><div className={styles.summaryLabel}><span>{label}</span><span className={`${styles.summarySymbol} ${styles[type]}`} aria-hidden="true">{type === 'live' ? '↗' : type === 'draft' ? '✎' : type === 'archive' ? '▤' : '▥'}</span></div><strong>{value}</strong><small>{note}</small></article>)}</div>}
        {notice && <p role="status" className={styles.notice}>{notice}</p>}{error && <p role="alert" className={styles.error}>{error}</p>}
        <section className={styles.library} aria-label="Form library">
            <div className={styles.libraryTop}><div><h3>Your form library</h3><p>A home for every registration, request, and new connection.</p></div><label className={styles.searchBox}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input aria-label="Search forms" placeholder="Find a form…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setLoading(true); }} /></label></div>
            <div className={styles.tabs} role="group" aria-label="Filter forms">{tabs.map(([value, label, count]) => <button key={value} aria-pressed={status === value} className={status === value ? styles.activeTab : styles.tab} onClick={() => { setStatus(value); setPage(1); setLoading(true); }}>{label}{count !== undefined && <span>{count}</span>}</button>)}</div>
            {listError && !loading ? <div className={styles.emptyState}><h4>We couldn’t load your forms</h4><p role="alert">{listError}</p><button className={styles.editButton} onClick={() => { setLoading(true); setReload((v) => v + 1); }}>Try again</button></div> : loading ? <div className={styles.emptyState} role="status"><div className={styles.loadingDots}><i /><i /><i /></div><p>Getting your forms ready…</p></div> : forms.length === 0 ? <div className={styles.emptyState}><div className={styles.emptyIcon}><svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="11" y="5" width="27" height="37" rx="4" /><path d="M18 16h13M18 23h13M18 30h7M7 12v24a7 7 0 0 0 7 7" /></svg></div><h4>{search || status ? 'No forms match this view' : 'A fresh start for your next idea'}</h4><p>{search || status ? 'Try another search or switch to all forms.' : 'A welcome form. An event registration. A simple way to listen. Start building your first form.'}</p>{can('forms.create') && !search && !status && <button className={styles.createButton} onClick={() => setDraft(emptyForm())}>Create your first form <span>↗</span></button>}</div> : <div className={styles.tableScroll}><table className={styles.formsTable}><thead><tr><th>FORM</th><th>STATUS</th><th>RESPONSES</th><th>ACCESS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{forms.map((form) => {
                const settings = formSettings(form); const archived = form.status === 'Archived'; const state = effectiveStatus(form);
                return <tr key={form.id} className={selected === form.id ? styles.selectedRow : undefined}>
                    <td><div className={styles.formIdentity}><span className={styles.formIcon}><FormIcon /></span><div><h4>{form.title}</h4><p>{formFields(form).length} questions <span>·</span> {dateLabel(form.createdAt)}{form.attachCertificate && <span className={styles.certificateHint}> · Certificate enabled</span>}</p></div></div></td>
                    <td><span className={`${styles.statusPill} ${state === 'Published' ? styles.publishedPill : state === 'Pending Approval' ? styles.pendingPill : styles.neutralPill}`}><i />{state}</span></td>
                    <td>{form.submissionCount == null ? <span className={styles.muted}>—</span> : <button className={styles.responseCount} onClick={() => openResponses(form.id)}>{form.submissionCount}<span>responses</span></button>}</td>
                    <td><span className={styles.accessLabel}>{settings.accessMode === 'Restricted' ? 'Invited only' : settings.accessMode === 'Authenticated' ? 'Members' : 'Public link'}</span><small className={styles.listingLabel}>{settings.showOnWebsite ? 'Listed on website' : 'Direct link'}</small></td>
                    <td><div className={styles.rowActions}>{can('forms.edit') && !archived && <button className={styles.editButton} disabled={busy} onClick={() => edit(form)} aria-label={`Edit ${form.title}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m16 3 5 5L8 21H3v-5zM14 5l5 5" /></svg>Edit</button>}
                        <FormActionsMenu label={`More actions for ${form.title}`}>
                            {['forms.create', 'forms.edit', 'forms.approve', 'forms.responses.view', 'approvals.act'].some(can) && <a href={`/admin/forms/${form.id}/preview`}>Preview form <span>↗</span></a>}<button onClick={() => copyLink(form.id)}>Copy form link</button>
                            {form.isPublished && <a href={`/forms/${form.id}`} target="_blank" rel="noopener noreferrer">Open live form <span>↗</span></a>}
                            {can('forms.responses.view') && <button disabled={busy} onClick={() => openResponses(form.id)}>View responses</button>}
                            {can('forms.publish') && !archived && <button disabled={busy} onClick={() => publication(form)}>{form.isPublished ? 'Close submissions' : 'Publish form'}</button>}
                            {can('forms.submit_for_approval') && !archived && <button disabled={busy} onClick={() => mutate(() => apiClient.request(`/api/v1/forms/${form.id}/submit-for-approval`, { method: 'POST', body: JSON.stringify({ expectedRevision: form.revision }) }), 'Form submitted for approval.')}>Request approval</button>}
                            {can('forms.analytics.view') && <a href={`/admin/forms/${form.id}/analytics`}>Analytics &amp; QR code</a>}
                            {can('forms.responses.export') && <button disabled={busy} onClick={() => mutate(() => apiClient.downloadFile(`/api/v1/forms/${form.id}/export`, 'form-responses.xlsx'), 'Excel export downloaded.')}>Export to Excel</button>}
                            {can('forms.create') && <button disabled={busy} onClick={() => mutate(() => apiClient.request(`/api/v1/forms/${form.id}/duplicate`, { method: 'POST', idempotencyKey: crypto.randomUUID() }), 'Draft copy created.')}>Duplicate form</button>}
                            {can('forms.archive') && !archived && <button className={styles.dangerAction} disabled={busy} onClick={() => archive(form)}>Archive form</button>}
                        </FormActionsMenu></div></td>
                </tr>;
            })}</tbody></table></div>}
            <footer className={styles.libraryFooter}><p>{total === 0 ? 'No forms to show' : `Showing ${(page - 1) * 25 + 1}–${Math.min(page * 25, total)} of ${total} forms`}</p><div><button disabled={page === 1 || busy} onClick={() => { setLoading(true); setPage(page - 1); }} aria-label="Previous page">←</button><span>{page}</span><button disabled={page * 25 >= total || busy} onClick={() => { setLoading(true); setPage(page + 1); }} aria-label="Next page">→</button></div></footer>
        </section>
        <div className={styles.libraryNote}><span>✦</span><p>Thoughtfully made forms. Stronger community connections.</p><span>DAYSPRING OS</span></div>
        {selected && <section className={styles.responses} ref={inbox}>
            <div className={styles.responseHeader}><div><p className={styles.eyebrow}>RESPONSE INBOX</p><h3>{forms.find((form) => form.id === selected)?.title || 'Form responses'}</h3></div><button className={styles.editButton} onClick={() => setSelected(null)}>Close inbox ×</button></div>
            <p className={styles.muted}>Private download codes are shown only to respondents. Select a response to review its answers.</p>
            <div className={styles.responseFilters}><label className={styles.searchBox}><input aria-label="Search responses" placeholder="Search responses…" value={responseSearch} onChange={(e) => { setResponseSearch(e.target.value); setResponsePage(1); setResponsesLoading(true); }} /></label><select aria-label="Filter response status" value={reviewFilter} onChange={(e) => { setReviewFilter(e.target.value); setResponsePage(1); setResponsesLoading(true); }}><option value="">All review statuses</option>{['Submitted', 'Under Review', 'Approved', 'Rejected', 'Returned'].map((value) => <option key={value}>{value}</option>)}</select></div>
            {responseError ? <p role="alert" className={styles.error}>{responseError}</p> : responsesLoading ? <p role="status">Loading responses…</p> : responses.items.length === 0 ? <div className={styles.emptyState}><h4>No responses here yet</h4><p>New responses will appear here as people complete your form.</p></div> : responses.items.map((row) => {
                const answers = JSON.parse(row.answersJson); const fields = formFields({ fieldsJson: row.formSnapshotJson }); const certificate = row.certificate;
                const name = answers.full_name || answers.name || answers.email || `Response ${row.id.slice(0, 8)}`;
                return <details key={row.id} className={styles.responseCard}><summary><span className={styles.responseAvatar}>{name.slice(0, 1).toUpperCase()}</span><span><strong>{name}</strong><small>{new Date(row.submittedAt).toLocaleString()}</small></span><span className={styles.reviewBadge}>{row.reviewStatus || 'Submitted'}</span><span className={styles.expandMark}>＋</span></summary><div className={styles.responseBody}>
                    <p className={styles.muted}>Reference {row.id} · Form revision {row.formRevision}</p>
                    <dl>{fields.filter((f) => !['section', 'description', 'pagebreak'].includes(f.type)).map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{['file', 'image'].includes(field.type) && answers[field.key] ? <button className={styles.editButton} disabled={busy} onClick={() => mutate(() => apiClient.downloadFile(`/api/v1/forms/${selected}/submissions/${row.id}/uploads/${answers[field.key]}`, 'response-attachment'), 'Response file downloaded.')}>Download attachment</button> : answers[field.key] || '—'}</dd></div>)}</dl>
                    {can('forms.responses.review') && <div className={styles.actions}>{['Under Review', 'Approved', 'Rejected', 'Returned'].map((next) => <button key={next} disabled={busy} onClick={() => review(row, next)}>{next}</button>)}</div>}
                    {!row.hasCertificate ? <p className={styles.muted}>No certificate download was enabled for this response.</p> : row.certificateSource === 'Batch' ? <p>Certificate prepared through a batch. <a href="/admin/certificates">Manage certificates</a></p> : <div className={styles.certificateSection}><h4>Certificate</h4><p>{certificate?.status || 'Awaiting a personalized PDF'}</p><div className={styles.actions}>
                        {can('certificates.generate') && !['Issued', 'Revoked'].includes(certificate?.status) && <label className={styles.fileLabel}>{certificate ? 'Replace draft PDF' : 'Attach certificate PDF'}<input aria-label="Certificate PDF" disabled={busy} type="file" accept="application/pdf,.pdf" onChange={(e) => attach(row, e.target.files?.[0], e.target)} /></label>}
                        {certificate && can('certificates.records.view') && <button disabled={busy} onClick={() => mutate(() => apiClient.downloadFile(`/api/v1/certificates/${certificate.id}/preview`, 'certificate-review.pdf'), 'Certificate downloaded for review.')}>Review PDF</button>}
                        {certificate?.status === 'Draft' && can('certificates.approve') && certificate.uploadedBy !== currentUser && <button disabled={busy} onClick={() => certificateDecision(certificate, 'approve')}>Approve</button>}
                        {certificate?.status === 'Draft' && certificate.uploadedBy === currentUser && <p>A different administrator must approve your upload.</p>}
                        {certificate?.status === 'Approved' && can('certificates.issue') && <button disabled={busy} onClick={() => certificateDecision(certificate, 'issue')}>Issue certificate</button>}
                        {certificate?.status === 'Issued' && can('certificates.revoke') && <button disabled={busy} onClick={() => certificateDecision(certificate, 'revoke')}>Revoke</button>}
                        {certificate?.verificationToken && ['Issued', 'Revoked'].includes(certificate.status) && <a href={`/certificates/verify/${certificate.verificationToken}`} target="_blank" rel="noopener noreferrer">Verify certificate ↗</a>}
                    </div></div>}
                </div></details>;
            })}
            <footer className={styles.libraryFooter}><p>{responses.total} responses</p><div><button disabled={responsePage === 1 || busy} onClick={() => { setResponsesLoading(true); setResponsePage(responsePage - 1); }}>←</button><span>{responsePage}</span><button disabled={responsePage * 25 >= responses.total || busy} onClick={() => { setResponsesLoading(true); setResponsePage(responsePage + 1); }}>→</button></div></footer>
        </section>}
    </section>;
}
