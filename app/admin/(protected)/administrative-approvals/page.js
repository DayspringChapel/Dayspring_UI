'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from '../forms/forms.module.css';
export default function AdministrativeApprovals() {
    const [data, setData] = useState(null); const [status, setStatus] = useState('Pending'); const [mine, setMine] = useState(false); const [search, setSearch] = useState(''); const [page, setPage] = useState(1);
    const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [reload, setReload] = useState(0); const [selected, setSelected] = useState(null); const [history, setHistory] = useState([]); const [comment, setComment] = useState('');
    useEffect(() => { const c = new AbortController(); apiClient.request(`/api/v1/administrative-workflows/requests?${new URLSearchParams({ status, mine, search, page })}`, { signal: c.signal }).then(setData).catch((e) => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, [status, mine, search, page, reload]);
    async function select(row) { setSelected(row); setComment(''); setError(''); try { setHistory(await apiClient.request(`/api/v1/administrative-workflows/requests/${row.request.id}/history`)); } catch (e) { setError(e.message); } }
    async function decide(decision) {
        if (busy) return; setBusy(true); setError('');
        try { await apiClient.request(`/api/v1/administrative-workflows/requests/${selected.request.id}/decision`, { method: 'POST', body: JSON.stringify({ expectedRevision: selected.request.revision, decision, comment }) }); setSelected(null); setReload((v) => v + 1); }
        catch (e) { setError(e.message); } finally { setBusy(false); }
    }
    return <section className={styles.page}><header className={styles.header}><div><h2>Administrative approvals</h2><p>Publication and certificate workflows, with recorded stage decisions.</p></div>{apiClient.hasPermission('workflows.manage') && <a href="/admin/workflow-configuration">Configure workflows</a>}</header>
        <div className={styles.actions}><label>Status<select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>{['', 'Pending', 'Approved', 'Rejected', 'Returned'].map((s) => <option value={s} key={s}>{s || 'All statuses'}</option>)}</select></label><label>Search<input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label><label><input type="checkbox" checked={mine} onChange={(e) => { setMine(e.target.checked); setPage(1); }} />My requests</label></div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {!data ? <p>Loading requests…</p> : data.items.length === 0 ? <p>No matching approval requests.</p> : <div className={styles.grid}>{data.items.map((row) => <article key={row.request.id} className={styles.card}><h3>{row.request.title}</h3><p>{row.request.subjectType} · {row.request.status} · Stage {row.request.stage + 1}</p>{row.canAct && <p>Your action is required.</p>}<button onClick={() => select(row)}>Review request</button></article>)}</div>}
        <div className={styles.actions}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span><button disabled={!data || page * 25 >= data.total} onClick={() => setPage(page + 1)}>Next</button></div>
        {selected && <article className={styles.editor}><h3>{selected.request.title}</h3>{selected.request.subjectType === 'Form' && <a href={`/admin/forms/${selected.request.subjectId}/preview`}>Review form content</a>}<p>Content revision {selected.request.subjectRevision}</p><h4>Approval history</h4>{history.length === 0 ? <p>No decisions yet.</p> : history.map((h) => <p key={h.id}>{h.decision} · {new Date(h.decidedAt).toLocaleString()} · {h.comment}</p>)}
            {selected.canAct && <><label>Comment<textarea maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} /></label><div className={styles.actions}>{['Approve', 'Reject', 'Return'].map((d) => <button key={d} disabled={busy || (d !== 'Approve' && !comment.trim())} onClick={() => decide(d)}>{d}</button>)}</div></>}<button onClick={() => setSelected(null)}>Close review</button></article>}
    </section>;
}
