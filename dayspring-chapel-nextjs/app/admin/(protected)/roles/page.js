'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';
import styles from '@/components/admin/panels/Panel.module.css';
import pageStyles from './roles.module.css';

function resolveCallerRole() {
    const userData = apiClient.getUserData();
    if (!userData) return 'churchAdmin';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    return 'churchAdmin';
}

export default function RolesPage() {
    const [users, setUsers]       = useState([]);
    const [roles, setRoles]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [roleDraft, setRoleDraft] = useState({});
    const [saving, setSaving]     = useState(null);
    const [filterText, setFilterText] = useState('');

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    const callerRole = resolveCallerRole();
    const isSuperAdmin = callerRole === 'superAdmin';

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                apiClient.getUsers().catch(() => []),
                apiClient.getRoles().catch(() => []),
            ]);
            setUsers(Array.isArray(usersRes) ? usersRes : []);
            setRoles(Array.isArray(rolesRes) ? rolesRes : []);
        } finally {
            setLoading(false);
        }
    };

    // ChurchAdmin may only assign churchMedia — backend enforces this too
    const assignableRoles = isSuperAdmin
        ? roles
        : roles.filter(r => {
            const n = (r.name || r.Name || '').toLowerCase();
            return n.includes('media');
        });

    const handleAssignRole = async (user) => {
        const newRole = roleDraft[user.id];
        if (!newRole || !user.email) return;
        const yes = await confirm({
            title: 'Change Role',
            message: `Assign "${newRole}" to ${user.userName || user.email}? They will need to log out and back in for the change to take effect.`,
            confirmLabel: 'Assign Role',
            danger: false,
        });
        if (!yes) return;
        setSaving(user.id);
        try {
            await apiClient.assignRole(user.email, newRole);
            setRoleDraft(p => { const n = { ...p }; delete n[user.id]; return n; });
            await loadData();
            notify('success', `Role "${newRole}" assigned to ${user.userName || user.email}.`);
        } catch (err) {
            notify('error', err.message || 'Failed to assign role. Try again.');
        } finally {
            setSaving(null);
        }
    };

    const filteredUsers = users.filter(u => {
        if (!filterText) return true;
        const q = filterText.toLowerCase();
        return (u.userName || '').toLowerCase().includes(q) ||
               (u.email || '').toLowerCase().includes(q) ||
               (u.roleName || u.role || '').toLowerCase().includes(q);
    });

    if (loading) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading users…</p></div>;
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <div>
                    <h2>User Role Management</h2>
                    <p className={styles.cardDescription}>
                        {isSuperAdmin
                            ? 'Assign any system role to any user. Users must re-login after a role change.'
                            : 'Assign the Church Media role to users. Admins cannot self-escalate.'}
                    </p>
                </div>
            </div>

            {/* Role summary chips */}
            <div className={pageStyles.roleSummary}>
                {roles.map(r => {
                    const name = r.name || r.Name || '';
                    const count = users.filter(u => (u.roleName || u.role || '') === name).length;
                    const color = name.toLowerCase().includes('super') ? '#7c3aed'
                                : name.toLowerCase().includes('media') ? '#db2777'
                                : '#0d9488';
                    return (
                        <div key={name} className={pageStyles.roleChip} style={{ '--chip': color }}>
                            <span className={pageStyles.chipDot} />
                            <span className={pageStyles.chipName}>{name}</span>
                            <span className={pageStyles.chipCount}>{count}</span>
                        </div>
                    );
                })}
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Search by name, email or role…"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    className={styles.filterInput}
                />
                {filterText && (
                    <button onClick={() => setFilterText('')} className={styles.clearFilterBtn}>Clear</button>
                )}
                <span className={styles.filterCount}>{filteredUsers.length} of {users.length} users</span>
            </div>

            {filteredUsers.length === 0 ? (
                <div className={styles.empty}><p>No users match the search.</p></div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Current Role</th>
                                <th>Assign Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => {
                                const currentRole = user.roleName || user.role || '—';
                                const busy = saving === user.id;
                                const hasDraft = user.id in roleDraft;
                                const roleColor = currentRole.toLowerCase().includes('super') ? '#7c3aed'
                                               : currentRole.toLowerCase().includes('media') ? '#db2777'
                                               : currentRole === '—' ? '#94a3b8'
                                               : '#0d9488';
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{user.userName || '—'}</div>
                                        </td>
                                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                            {user.email || '—'}
                                        </td>
                                        <td>
                                            <span
                                                className={styles.badge}
                                                style={{ background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}44` }}
                                            >
                                                {currentRole}
                                            </span>
                                        </td>
                                        <td>
                                            {assignableRoles.length > 0 ? (
                                                <div className={styles.quickAssignRow}>
                                                    <select
                                                        value={roleDraft[user.id] ?? ''}
                                                        onChange={e => setRoleDraft(p => ({ ...p, [user.id]: e.target.value }))}
                                                        className={styles.inlineSelect}
                                                        disabled={busy}
                                                    >
                                                        <option value="">— Select role —</option>
                                                        {assignableRoles.map(r => {
                                                            const name = r.name || r.Name || '';
                                                            return <option key={name} value={name}>{name}</option>;
                                                        })}
                                                    </select>
                                                    <button
                                                        onClick={() => handleAssignRole(user)}
                                                        disabled={busy || !hasDraft || !roleDraft[user.id]}
                                                        className={styles.assignInlineBtn}
                                                    >
                                                        {busy ? '…' : 'Set'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No assignable roles</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={pageStyles.infoBox}>
                <strong>Note:</strong> Role changes take effect on the user&apos;s next login. Existing sessions keep their current permissions until the JWT expires or the user logs out.
            </div>
        </div>
    );
}
