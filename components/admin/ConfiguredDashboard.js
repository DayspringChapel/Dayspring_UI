'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { roleLabel } from '@/lib/access';
import styles from './Management.module.css';
export default function ConfiguredDashboard() {
    const [data, setData] = useState(null); const [error, setError] = useState(''); const user = apiClient.getUserData();
    useEffect(() => { const controller = new AbortController(); apiClient.request('/api/v1/access/dashboard', { signal: controller.signal }).then(setData).catch((e) => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); }, []);
    return <section className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>YOUR WORKSPACE</p><h1>Welcome, {user?.userName || 'there'}</h1><p>{roleLabel(user?.role?.name)}{user?.access?.unitName ? ` · ${user.access.unitName}` : ''}</p></div></header>{error && <p role="alert" className={styles.error}>{error}</p>}{!data ? <p>Loading your dashboard…</p> : <><div className={styles.grid}>{data.cards.map((card) => <Link href={card.path} key={card.key} className={styles.card}><h3>{card.label}</h3><strong className={styles.value}>{card.value}</strong><p>Open {card.label.toLowerCase()} →</p></Link>)}</div>{data.cards.length === 0 && <article className={styles.card}><h2>Your dashboard is ready</h2><p>{user?.access?.scopeValid === false ? 'Your role requires membership of its assigned department or unit. Ask Superadmin to review your assignment.' : 'Superadmin can choose the information and resources shown for your role.'}</p></article>}<article className={styles.card} style={{ marginTop: 24 }}><h2>Your resources</h2><p>Open a resource enabled for your role.</p><div className={styles.actions}>{data.resources.filter((resource) => resource.key !== 'dashboard').map((resource) => <Link className={styles.button} key={resource.key} href={resource.path}>{resource.label} →</Link>)}</div></article></>}</section>;
}
