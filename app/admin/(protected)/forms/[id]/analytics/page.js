'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from '../../forms.module.css';

function Bars({ rows, label = 'value' }) {
    const max = Math.max(1, ...rows.map((r) => r.count));
    return <div>{rows.map((r) => <div key={r[label]} style={{ marginBlock: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{r[label]}</span><strong>{r.count}</strong></div><div style={{ background: '#edf1f5', height: 12, borderRadius: 8 }}><div style={{ width: `${r.count / max * 100}%`, height: 12, background: '#d9752c', borderRadius: 8 }} /></div></div>)}</div>;
}
export default function AnalyticsPage() {
    const { id } = useParams(); const [data, setData] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
    useEffect(() => { const c = new AbortController(); apiClient.request(`/api/v1/forms/${id}/analytics`, { signal: c.signal }).then(setData).catch((e) => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, [id]);
    async function download(format) {
        setError(''); setBusy(true);
        try {
            if (format === 'svg') await apiClient.downloadFile(`/api/v1/forms/${id}/qr`, 'dayspring-form-qr.svg');
            else {
                const response = await fetch(`/api/backend/api/v1/forms/${id}/qr`, { cache: 'no-store' });
                if (!response.ok) throw new Error('QR download failed. Check your permission and the public origin configuration.');
                const url = URL.createObjectURL(await response.blob());
                try {
                    const image = new Image(); image.src = url; await image.decode();
                    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1600;
                    canvas.getContext('2d').drawImage(image, 0, 0, 1600, 1600);
                    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'dayspring-form-qr.png'; a.click();
                } finally { URL.revokeObjectURL(url); }
            }
        } catch (e) { setError(e.message); } finally { setBusy(false); }
    }
    const max = data ? Math.max(1, ...data.daily.map((r) => r.count)) : 1;
    return <section className={styles.page}><header className={styles.header}><div><h2>Form analytics</h2><p>Completed responses · UTC</p></div><a href="/admin/forms">Back to forms</a></header>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {!data ? <p role="status">{error ? 'Analytics could not be loaded.' : 'Loading analytics…'}</p> : <>
            <div className={styles.grid}><article className={styles.card}><h3>Total submissions</h3><strong style={{ fontSize: 36 }}>{data.total}</strong></article><article className={styles.card}><h3>Response review</h3><Bars rows={data.statuses} label="status" /></article></div>
            <article className={styles.card}><h3>Daily submissions</h3><p>Last 366 days. Days without completed responses have zero submissions.</p>
                {data.total === 0 ? <p>No submissions yet.</p> : <><svg viewBox="0 0 800 200" role="img" aria-label="Daily completed submissions" style={{ width: '100%', maxHeight: 240 }}><polyline fill="none" stroke="#d9752c" strokeWidth="3" points={data.daily.map((r) => `${(Date.parse(r.date) - Date.parse(new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10))) / 86400000 / 365 * 780 + 10},${190 - r.count / max * 175}`).join(' ')} /></svg><details><summary>Daily counts</summary><table><thead><tr><th>Date (UTC)</th><th>Submissions</th></tr></thead><tbody>{data.daily.map((r) => <tr key={r.date}><td>{r.date.slice(0, 10)}</td><td>{r.count}</td></tr>)}</tbody></table></details></>}
            </article>
            <article className={styles.card}><h3>Weekly submissions</h3><p>Most recent 12 weeks, starting Monday (UTC).</p><Bars rows={(data.weekly || []).slice(-12).map((r) => ({ value: r.date.slice(0, 10), count: r.count }))} /></article>
            <article className={styles.card}><h3>Monthly submissions</h3><Bars rows={[...data.monthly].reverse().map((r) => ({ value: `${r.year}-${String(r.month).padStart(2, '0')}`, count: r.count }))} /></article>
            <div className={styles.grid}>{data.fields.map((field) => <article key={field.key} className={styles.card}><h3>{field.label}</h3>
                {field.numbers && <p>Count {field.numbers.count} · Min {field.numbers.minimum} · Max {field.numbers.maximum} · Average {Number(field.numbers.average).toFixed(2)}</p>}
                <Bars rows={field.distribution} />{field.distribution.length === 0 && <p>No answers yet.</p>}</article>)}</div>
            <article className={styles.card}><h3>Share this form</h3><p>The QR opens the form link. Publication, access and submission dates still apply.</p><div className={styles.actions}><button disabled={busy} onClick={() => download('svg')}>Download SVG</button><button disabled={busy} onClick={() => download('png')}>Download PNG</button></div></article>
            <p>Generated {new Date(data.generatedAt).toLocaleString()}. This report counts saved responses; it does not estimate abandoned forms. Field charts show the 50 most frequent values.</p>
        </>}
    </section>;
}
