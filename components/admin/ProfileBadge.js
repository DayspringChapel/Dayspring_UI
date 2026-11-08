'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { roleLabel } from '@/lib/access';
import styles from './ProfileBadge.module.css';
export default function ProfileBadge() {
    const [user, setUser] = useState(() => apiClient.getUserData());
    useEffect(() => { const sync = () => setUser(apiClient.getUserData()); window.addEventListener('dayspring:permissions', sync); return () => window.removeEventListener('dayspring:permissions', sync); }, []);
    if (!user) return null;
    const name = user.userName || user.UserName || 'User'; const role = user.role?.name || user.role?.Name || user.role || '';
    return <Link href="/admin/account" aria-label="Your account and password" className={styles.profileBadge} title={`${name} · ${roleLabel(role)}`}><span className={styles.avatar} style={{ background: '#b95b1d' }}>{name.slice(0, 1).toUpperCase()}</span><span className={styles.info}><span className={styles.name}>{name}</span><span className={styles.role} style={{ color: '#f7a66d' }}>{roleLabel(role)}</span></span></Link>;
}
