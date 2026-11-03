'use client';

import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
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
    if (settings.collectionPaused && form.isPublished) return 'Suspended';
    if (form.status === 'Archived') return 'Archived';
    if (form.isPublished && settings.opensAt && Date.parse(settings.opensAt) > Date.now()) return 'Scheduled';
    if (form.isPublished && settings.closesAt && Date.parse(settings.closesAt) <= Date.now()) return 'Closed';
    return form.status || (form.isPublished ? 'Published' : 'Draft');
}

export default function FormsAdminPage() {
    const router = useRouter();
    const [forms, setForms] = useState([]); const [total, setTotal] = useState(0); const [summary, setSummary] = useState(null);
    const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
    const [draft, setDraft] = useState(null); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [listError, setListError] = useState('');
    const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(0);
    const pending = useRef(false); const { dialog, confirm, closeDialog } = useConfirm();
    const can = (permission) => apiClient.hasPermission(permission);

    useEffect(() => {
        const controller = new AbortController();
        apiClient.request(`/api/v1/forms?${new URLSearchParams({ page, search, status })}`, { signal: controller.signal })
            .then((result) => { if (!controller.signal.aborted) { setForms(result.items); setTotal(result.total); setSummary(result.summary); setListError(''); } })
            .catch((err) => { if (!controller.signal.aborted) setListError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, search, status, reload]);

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
            const saved = await apiClient.request(`/api/v1/forms${draft.id ? `/${draft.id}` : ''}`, {
                method: draft.id ? 'PUT' : 'POST', idempotencyKey: draft.operationKey,
                body: JSON.stringify(formSavePayload(draft)),
            }); setDraft(null); router.push(`/admin/forms/${saved.id}`);
        }, 'Form saved.');
    }
    async function edit(form) { await mutate(async () => { const current = await apiClient.request(`/api/v1/forms/${form.id}/preview`); setDraft({ ...current, operationKey: crypto.randomUUID(), fields: formFields(current), settings: formSettings(current) }); }); }
    function openResponses(id) { router.push(`/admin/forms/${id}?view=Responses`); }
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
    if (draft) return <FormComposer draft={draft} onChange={setDraft} onSave={save} onClose={() => { setDraft(null); setError(''); }} busy={busy} error={error} />;
    const tabs = [['', 'All forms', summary?.total], ['Published', 'Published', summary?.published], ['Unpublished', 'Unpublished', summary?.unpublished], ['Archived', 'Archived', summary?.archived]];
    return <section className={`${styles.page} ${styles.workspace}`}>
        <AdminConfirm dialog={dialog} onClose={closeDialog} />
        <header className={styles.workspaceHeader}><div><p className={styles.eyebrow}>CHURCH WORKSPACE</p><h2>Every response starts<br />with a <span>good question.</span></h2><p className={styles.headerDescription}>Create forms, bring people together, and turn responses into your next step.</p></div><div className={styles.headerActions}>
            <button className={styles.refreshButton} disabled={busy || loading} onClick={() => { setLoading(true); setReload((v) => v + 1); }} aria-label="Refresh forms"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-2L20 8M4 16l2.4 3A7 7 0 0 0 18 17" /></svg></button>
            {can('forms.create') && <button className={styles.createButton} disabled={busy} onClick={() => { setError(''); setDraft(emptyForm()); }}><span>＋</span>Create a form</button>}
        </div></header>
        {summary && <div className={styles.summaryGrid}>{[['Total forms', summary.total, 'Built for your community', 'all'], ['Published', summary.published, 'Published respondent links', 'live'], ['Unpublished', summary.unpublished, 'A little work in progress', 'draft'], ['Archived', summary.archived, 'Safely kept for reference', 'archive']].map(([label, value, note, type]) => <article key={label} className={styles.summaryCard}><div className={styles.summaryLabel}><span>{label}</span><span className={`${styles.summarySymbol} ${styles[type]}`} aria-hidden="true">{type === 'live' ? '↗' : type === 'draft' ? '✎' : type === 'archive' ? '▤' : '▥'}</span></div><strong>{value}</strong><small>{note}</small></article>)}</div>}
        {notice && <p role="status" className={styles.notice}>{notice}</p>}{error && <p role="alert" className={styles.error}>{error}</p>}
        <section className={styles.library} aria-label="Form library">
            <div className={styles.libraryTop}><div><h3>Your form library</h3><p>A home for every registration, request, and new connection.</p></div><label className={styles.searchBox}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input aria-label="Search forms" placeholder="Find a form…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setLoading(true); }} /></label></div>
            <div className={styles.tabs} role="group" aria-label="Filter forms">{tabs.map(([value, label, count]) => <button key={value} aria-pressed={status === value} className={status === value ? styles.activeTab : styles.tab} onClick={() => { setStatus(value); setPage(1); setLoading(true); }}>{label}{count !== undefined && <span>{count}</span>}</button>)}</div>
            {listError && !loading ? <div className={styles.emptyState}><h4>We couldn’t load your forms</h4><p role="alert">{listError}</p><button className={styles.editButton} onClick={() => { setLoading(true); setReload((v) => v + 1); }}>Try again</button></div> : loading ? <div className={styles.emptyState} role="status"><div className={styles.loadingDots}><i /><i /><i /></div><p>Getting your forms ready…</p></div> : forms.length === 0 ? <div className={styles.emptyState}><div className={styles.emptyIcon}><svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="11" y="5" width="27" height="37" rx="4" /><path d="M18 16h13M18 23h13M18 30h7M7 12v24a7 7 0 0 0 7 7" /></svg></div><h4>{search || status ? 'No forms match this view' : 'A fresh start for your next idea'}</h4><p>{search || status ? 'Try another search or switch to all forms.' : 'A welcome form. An event registration. A simple way to listen. Start building your first form.'}</p>{can('forms.create') && !search && !status && <button className={styles.createButton} onClick={() => setDraft(emptyForm())}>Create your first form <span>↗</span></button>}</div> : <div className={styles.tableScroll}><table className={styles.formsTable}><thead><tr><th>FORM</th><th>STATUS</th><th>RESPONSES</th><th>ACCESS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{forms.map((form) => {
                const settings = formSettings(form); const archived = form.status === 'Archived'; const state = effectiveStatus(form);
                return <tr key={form.id}>
                    <td><div className={styles.formIdentity}><span className={styles.formIcon}><FormIcon /></span><div><h4>{form.title}</h4><p>{formFields(form).length} questions <span>·</span> {dateLabel(form.createdAt)}{form.attachCertificate && <span className={styles.certificateHint}> · Certificate enabled</span>}</p></div></div></td>
                    <td><span className={`${styles.statusPill} ${state === 'Published' ? styles.publishedPill : state === 'Pending Approval' ? styles.pendingPill : styles.neutralPill}`}><i />{state}</span></td>
                    <td>{form.submissionCount == null ? <span className={styles.muted}>—</span> : <button className={styles.responseCount} onClick={() => openResponses(form.id)}>{form.submissionCount}<span>responses</span></button>}</td>
                    <td><span className={styles.accessLabel}>{settings.accessMode === 'Restricted' ? 'Invited only' : settings.accessMode === 'Authenticated' ? 'Members' : 'Public link'}</span><small className={styles.listingLabel}>{settings.showOnWebsite ? 'Listed on website' : 'Direct link'}</small></td>
                    <td><div className={styles.rowActions}><a className={styles.editButton} href={`/admin/forms/${form.id}`}>Manage</a>{can('forms.edit') && !archived && <button className={styles.editButton} disabled={busy} onClick={() => edit(form)} aria-label={`Edit ${form.title}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m16 3 5 5L8 21H3v-5zM14 5l5 5" /></svg>Edit</button>}
                        <FormActionsMenu label={`More actions for ${form.title}`}>
                            {['forms.create', 'forms.edit', 'forms.approve', 'forms.responses.view', 'approvals.act'].some(can) && <a href={`/admin/forms/${form.id}/preview`}>Preview form <span>↗</span></a>}<button onClick={() => copyLink(form.id)}>Copy form link</button>
                            {form.isPublished && <a href={`/forms/${form.id}`} target="_blank" rel="noopener noreferrer">Open live form <span>↗</span></a>}
                            {can('forms.responses.view') && <button disabled={busy} onClick={() => openResponses(form.id)}>View responses{form.submissionCount != null && <span className={styles.responseBadge} aria-label={`${form.submissionCount} responses`}>{form.submissionCount}</span>}</button>}
                            {can('forms.publish') && !archived && <button disabled={busy} onClick={() => publication(form)}>{form.isPublished ? 'Stop collecting' : 'Publish form'}</button>}
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
    </section>;
}
