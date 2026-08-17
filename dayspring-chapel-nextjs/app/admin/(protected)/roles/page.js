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
    const [members, setMembers] = useState([]);
    const [users, setUsers]       = useState([]);
    const [roles, setRoles]       = useState([]);
    const [units, setUnits]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [roleDraft, setRoleDraft] = useState({});
    const [saving, setSaving]     = useState(null);
    const [filterText, setFilterText] = useState('');

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    const callerRole = resolveCallerRole();
    const isSuperAdmin = callerRole === 'superAdmin';

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [membersRes, usersRes, rolesRes, unitsRes] = await Promise.all([
                apiClient.getMembers().catch(() => []),
                apiClient.getUsers().catch(() => []),
                apiClient.getRoles().catch(() => []),
                apiClient.getUnits().catch(() => []),
            ]);
            setMembers(Array.isArray(membersRes) ? membersRes : []);
            setUsers(Array.isArray(usersRes) ? usersRes : []);
            setRoles(Array.isArray(rolesRes) ? rolesRes : []);
            setUnits(Array.isArray(unitsRes) ? unitsRes : []);
        } finally {
            setLoading(false);
        }
    };

    const contentUnit = units.find((u) => u.isContentUnit);

    // Join every Member with their linked User to get name/email/current role
    const roster = members.map((m) => {
        const user = users.find((u) => u.id === m.userId) || null;
        return {
            memberId: m.id,
            userId: m.userId,
            userName: user?.userName || '—',
            email: user?.email || '—',
            roleName: user?.role?.name || user?.role?.Name || user?.role || '',
            unitId: m.unitId || null,
            isContentUnitMember: contentUnit ? m.unitId === contentUnit.id : false,
        };
    });

    const filteredRoster = roster.filter((m) => {
        if (!filterText) return true;
        const q = filterText.toLowerCase();
        return m.userName.toLowerCase().includes(q) ||
               m.email.toLowerCase().includes(q) ||
               (m.roleName || '').toLowerCase().includes(q);
    });

    const roleOptionsFor = (member) => roles.filter((r) => {
        const n = (r.name || r.Name || '').toLowerCase();
        if (n.includes('media')) return member.isContentUnitMember;
        return true;
    });

    const handleAssignRole = async (member) => {
        const newRole = roleDraft[member.userId];
        if (!newRole || member.email === '—') return;

        const alreadyHolder = roster.find((m) => m.roleName === newRole && m.userId !== member.userId);
        const message = alreadyHolder
            ? `"${newRole}" is currently held by ${alreadyHolder.userName} (${alreadyHolder.email}). Assign it to ${member.userName} as well?`
            : `Assign "${newRole}" to ${member.userName || member.email}? They will need to log out and back in for the change to take effect.`;

        const yes = await confirm({
            title: 'Assign Role',
            message,
            confirmLabel: 'Assign Role',
            danger: false,
        });
        if (!yes) return;

        setSaving(member.userId);
        try {
            await apiClient.assignRole(member.email, newRole);
            setRoleDraft((p) => { const n = { ...p }; delete n[member.userId]; return n; });
            await loadData();
            notify('success', `Role "${newRole}" assigned to ${member.userName || member.email}.`);
        } catch (err) {
            notify('error', err.message || 'Failed to assign role. Try again.');
        } finally {
            setSaving(null);
        }
    };

    const handleRevokeRole = async (member) => {
        const role = roles.find((r) => (r.name || r.Name) === member.roleName);
        if (!role) return;
        const yes = await confirm({
            title: 'Revoke Role',
            message: `Revoke "${member.roleName}" from ${member.userName || member.email}?`,
            confirmLabel: 'Revoke',
            danger: true,
        });
        if (!yes) return;

        setSaving(member.userId);
        try {
            await apiClient.removeRole(member.userId, role.id || role.Id);
            await loadData();
            notify('success', `Role revoked from ${member.userName || member.email}.`);
        } catch (err) {
            notify('error', err.message || 'Failed to revoke role. Try again.');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading members…</p></div>;
    }

    if (!isSuperAdmin) {
        return (
            <div className={styles.panel}>
                <div className={styles.empty}>
                    <p>Role assignment is reserved to the Super Admin.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <div>
                    <h2>Member Role Management</h2>
                    <p className={styles.cardDescription}>
                        Assign any system role to any member. The churchMedia role can only go to members of the content unit.
                        Members must re-login after a role change.
                    </p>
                </div>
            </div>

            {/* Role summary chips */}
            <div className={pageStyles.roleSummary}>
                {roles.map((r) => {
                    const name = r.name || r.Name || '';
                    const count = roster.filter((m) => m.roleName === name).length;
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
                    onChange={(e) => setFilterText(e.target.value)}
                    className={styles.filterInput}
                />
                {filterText && (
                    <button onClick={() => setFilterText('')} className={styles.clearFilterBtn}>Clear</button>
                )}
                <span className={styles.filterCount}>{filteredRoster.length} of {roster.length} members</span>
            </div>

            {filteredRoster.length === 0 ? (
                <div className={styles.empty}><p>No members match the search.</p></div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Email</th>
                                <th>Current Role</th>
                                <th>Assign Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoster.map((member) => {
                                const currentRole = member.roleName || '—';
                                const busy = saving === member.userId;
                                const hasDraft = member.userId in roleDraft;
                                const roleColor = currentRole.toLowerCase().includes('super') ? '#7c3aed'
                                               : currentRole.toLowerCase().includes('media') ? '#db2777'
                                               : currentRole === '—' ? '#94a3b8'
                                               : '#0d9488';
                                const options = roleOptionsFor(member);
                                return (
                                    <tr key={member.memberId}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{member.userName}</div>
                                        </td>
                                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                            {member.email}
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
                                            <div className={styles.quickAssignRow}>
                                                <select
                                                    value={roleDraft[member.userId] ?? ''}
                                                    onChange={(e) => setRoleDraft((p) => ({ ...p, [member.userId]: e.target.value }))}
                                                    className={styles.inlineSelect}
                                                    disabled={busy}
                                                >
                                                    <option value="">— Select role —</option>
                                                    {options.map((r) => {
                                                        const name = r.name || r.Name || '';
                                                        return <option key={name} value={name}>{name}</option>;
                                                    })}
                                                </select>
                                                <button
                                                    onClick={() => handleAssignRole(member)}
                                                    disabled={busy || !hasDraft || !roleDraft[member.userId]}
                                                    className={styles.assignInlineBtn}
                                                >
                                                    {busy ? '…' : 'Set'}
                                                </button>
                                                {currentRole !== '—' && (
                                                    <button
                                                        onClick={() => handleRevokeRole(member)}
                                                        disabled={busy}
                                                        className={styles.assignInlineBtn}
                                                        style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={pageStyles.infoBox}>
                <strong>Note:</strong> Role changes take effect on the member&apos;s next login. Existing sessions keep their current permissions until the JWT expires or the member logs out.
            </div>
        </div>
    );
}
