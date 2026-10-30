'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './audit.module.css';

export default function AuditPage() {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        apiClient.request(`/api/v1/audit?page=${page}&pageSize=25`, { signal: controller.signal })
            .then((data) => { setResult(data); setError(''); })
            .catch((err) => { if (!controller.signal.aborted) setError(err.message || 'Unable to load audit records.'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, refresh]);

    const changePage = (next) => { setLoading(true); setPage(next); };
    return <section className={styles.page}>
        <div className={styles.heading}>
            <div><h2>Administrative audit log</h2><p>Recorded access, form and certificate actions. Times use your local timezone.</p></div>
            <button disabled={loading} onClick={() => { setLoading(true); setRefresh((value) => value + 1); }}>Refresh</button>
        </div>
        {error ? <p role="alert">{error}</p> : loading ? <p role="status">Loading audit records…</p> : <>
            <p>{result.total} recorded actions</p>
            {result.items.length === 0 ? <p>No administrative changes have been recorded yet.</p> : <div className={styles.tableWrap}>
                <table><thead><tr><th scope="col">Time</th><th scope="col">Action</th><th scope="col">Actor</th><th scope="col">Subject</th><th scope="col">Changes</th></tr></thead>
                    <tbody>{result.items.map((item) => <tr key={item.id}>
                        <td>{new Date(item.occurredAt).toLocaleString()}</td><td>{item.action}</td>
                        <td>{item.actorId}</td><td>{item.subjectId}</td>
                        <td><details><summary>View details</summary><pre>{item.details}</pre></details></td>
                    </tr>)}</tbody>
                </table>
            </div>}
            <div className={styles.pagination}>
                <button disabled={page === 1 || loading} onClick={() => changePage(page - 1)}>Previous</button>
                <span>Page {page} of {Math.max(1, Math.ceil(result.total / 25))}</span>
                <button disabled={page * 25 >= result.total || loading} onClick={() => changePage(page + 1)}>Next</button>
            </div>
        </>}
    </section>;
}
