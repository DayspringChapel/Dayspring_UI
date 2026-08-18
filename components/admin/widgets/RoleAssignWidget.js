'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './RoleAssignWidget.module.css';

const ADMIN_ROLE_PATTERNS = ['super', 'admin', 'churchadmin'];

export default function RoleAssignWidget({ isSuperAdmin = false }) {
    const [roles, setRoles] = useState([]);
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiClient.getRoles()
            .then(data => {
                const arr = Array.isArray(data) ? data : (data?.data || data?.Data || []);
                const filtered = isSuperAdmin
                    ? arr
                    : arr.filter(r => {
                        const n = (r.name || r.Name || '').toLowerCase();
                        return !ADMIN_ROLE_PATTERNS.some(p => n.includes(p));
                    });
                setRoles(filtered);
            })
            .catch(() => setRoles([]));
    }, [isSuperAdmin]);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!email.trim() || !selectedRole) {
            setStatus({ type: 'error', msg: 'Please enter an email and select a role.' });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            await apiClient.assignRole(email.trim(), selectedRole);
            setStatus({ type: 'success', msg: `Role "${selectedRole}" assigned successfully.` });
            setEmail('');
            setSelectedRole('');
        } catch (err) {
            setStatus({ type: 'error', msg: err?.message || 'Failed to assign role.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.widget}>
            <h4 className={styles.title}>Assign Role</h4>
            <p className={styles.sub}>
                {isSuperAdmin
                    ? 'Assign any role to a user by their email address.'
                    : 'Assign non-admin roles to users by their email address.'}
            </p>
            <form onSubmit={handleAssign} className={styles.form}>
                <label className={styles.label}>
                    User Email
                    <input
                        type="email"
                        className={styles.input}
                        placeholder="user@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label className={styles.label}>
                    Role
                    <select
                        className={styles.select}
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value)}
                        required
                    >
                        <option value="">Select a role…</option>
                        {roles.map(r => {
                            const name = r.name || r.Name || '';
                            const id = r.id || r.Id || name;
                            return <option key={id} value={name}>{name}</option>;
                        })}
                    </select>
                </label>

                {status && (
                    <p className={status.type === 'success' ? styles.success : styles.error}>
                        {status.msg}
                    </p>
                )}

                <button type="submit" className={styles.btn} disabled={loading}>
                    {loading ? 'Assigning…' : 'Assign Role'}
                </button>
            </form>
        </div>
    );
}
