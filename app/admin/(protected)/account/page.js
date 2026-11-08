'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { roleLabel } from '@/lib/access';
import styles from '@/components/admin/Management.module.css';
export default function AccountPage() {
    const router = useRouter();
    const user = apiClient.getUserData();
    const [form,setForm] = useState({ current:'',password:'',confirm:'' });
    const [busy,setBusy] = useState(false);
    const [error,setError] = useState('');
    async function save(event) {
        event.preventDefault(); if (busy || !user) return;
        if (form.password !== form.confirm) { setError('The new passwords do not match.'); return; }
        setBusy(true); setError('');
        try {
            await apiClient.request(`/api/v1/Users/${user.id}/change-password`,{ method:'PUT',body:JSON.stringify({ currentPassword:form.current,newPassword:form.password }) });
            await fetch('/api/auth/session',{method:'DELETE',credentials:'same-origin',signal:AbortSignal.timeout(5000)}).catch(()=>{});
            apiClient.removeToken();
            router.replace('/admin/login');
        } catch (reason) { setError(reason.message || 'Unable to change your password.');setBusy(false); }
    }
    return <section className={styles.page}><header className={styles.header}><div><h1>Your account</h1><p>Manage the password for your own account.</p></div></header><article className={styles.card}><h2>{user?.userName || 'Your account'}</h2><p>{roleLabel(user?.role?.name || user?.role)} · {user?.email || ''}</p><form className={styles.editor} onSubmit={save}><h2>Change password</h2><p>Use at least 12 characters. You will sign in again after saving, and existing browser sessions will stop working.</p>{error && <p role="alert">{error}</p>}<label>Current password<input type="password" autoComplete="current-password" required maxLength={1024} value={form.current} onChange={event=>setForm({...form,current:event.target.value})} /></label><label>New password<input type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={form.password} onChange={event=>setForm({...form,password:event.target.value})} /></label><label>Confirm new password<input type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={form.confirm} onChange={event=>setForm({...form,confirm:event.target.value})} /></label><div className={styles.actions}><button className={styles.primary} disabled={busy}>{busy?'Saving…':'Change password and sign out'}</button></div></form></article></section>;
}
