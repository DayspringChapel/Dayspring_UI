'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import DynamicFields from '@/components/forms/DynamicFields';
import styles from '../../forms.module.css';
export default function Preview() {
    const { id } = useParams(); const [form, setForm] = useState(null); const [answers, setAnswers] = useState({}); const [error, setError] = useState('');
    useEffect(() => { const c = new AbortController(); apiClient.request(`/api/v1/forms/${id}/preview`, { signal: c.signal }).then((f) => { setForm(f); setAnswers(Object.fromEntries(f.fields.filter((v) => v.defaultValue != null).map((v) => [v.key, v.defaultValue]))); }).catch((e) => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, [id]);
    return <section className={styles.page}><a href="/admin/forms">Back to forms</a><p className={styles.notice}>Preview only. Answers entered here are not submitted.</p>{error && <p role="alert">{error}</p>}{form ? <article className={styles.editor}><h2>{form.title}</h2><p>{form.description}</p><DynamicFields fields={form.fields} answers={answers} onChange={setAnswers} /></article> : <p>Loading preview…</p>}</section>;
}
