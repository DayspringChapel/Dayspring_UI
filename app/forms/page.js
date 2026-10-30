'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from '@/components/forms/forms.module.css';
export default function FormsListing() {
    const [forms, setForms] = useState(null); const [error, setError] = useState('');
    useEffect(() => { const c = new AbortController(); apiClient.request('/api/v1/forms/listed', { signal: c.signal }).then(setForms).catch((e) => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, []);
    return <main className={styles.page}><section className={styles.card}><h1>Church forms</h1>{error ? <p role="alert">{error}</p> : forms === null ? <p>Loading forms…</p> : forms.length === 0 ? <p>No public forms are open at this time.</p> : forms.map((form) => <article key={form.id}><h2><a href={`/forms/${form.id}`}>{form.title}</a></h2><p>{form.description}</p></article>)}</section></main>;
}
