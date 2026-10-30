'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from '@/components/forms/forms.module.css';
export default function VerifyCertificate() {
    const { token } = useParams(); const [result, setResult] = useState(null); const [error, setError] = useState('');
    useEffect(() => { const c = new AbortController(); apiClient.request(`/api/v1/certificate-management/verify/${encodeURIComponent(token)}`, { signal: c.signal }).then(setResult).catch((e) => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, [token]);
    return <main className={styles.page}><section className={styles.card}><h1>Certificate verification</h1>{error ? <p role="alert">{error}</p> : !result ? <p>Checking certificate…</p> : <><h2>{result.valid ? 'Valid certificate' : 'Certificate revoked'}</h2><dl><dt>Issuing church</dt><dd>{result.issuingChurch}</dd><dt>Programme</dt><dd>{result.programme}</dd><dt>Certificate number</dt><dd>{String(result.number).replaceAll('-', '').toUpperCase()}</dd><dt>Issued on</dt><dd>{new Date(result.issuedAt).toLocaleDateString()}</dd><dt>Status</dt><dd>{result.status}</dd></dl><p>Recipient information and certificate files are kept private.</p></>}</section></main>;
}
