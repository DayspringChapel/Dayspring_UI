'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

const CONTENT_ROLE_OPTIONS = [
    { value: 1, label: 'Media' },
    { value: 2, label: 'Graphics' },
    { value: 3, label: 'Social Media' },
];

const roleLabel = (role) => CONTENT_ROLE_OPTIONS.find((r) => r.value === role)?.label || null;

export default function ContentUnitMembersPanel() {
    const [contentUnit, setContentUnit] = useState(null);
    const [members, setMembers] = useState([]);
    const [bioData, setBioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleDraft, setRoleDraft] = useState({});
    const [busyId, setBusyId] = useState(null);

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const units = await apiClient.getUnits().catch(() => []);
            const unit = (Array.isArray(units) ? units : []).find((u) => u.isContentUnit) || null;
            setContentUnit(unit);

            const [membersRes, bioRes] = await Promise.all([
                unit ? apiClient.getMembersByUnit(unit.id).catch(() => []) : Promise.resolve([]),
                apiClient.getBioData().catch(() => []),
            ]);
            setMembers(Array.isArray(membersRes) ? membersRes : []);
            setBioData(Array.isArray(bioRes) ? bioRes : []);
        } catch (error) {
            console.error('Failed to load content unit members:', error);
        } finally {
            setLoading(false);
        }
    };

    const enrichedMembers = useMemo(() => {
        const bioByUserId = new Map(bioData.map((bio) => [bio.userId, bio]));
        return members.map((member) => {
            const bio = bioByUserId.get(member.userId);
            const name = [bio?.firstName, bio?.lastName].filter(Boolean).join(' ').trim();
            return {
                ...member,
                label: name || member.userId || member.memberId,
                email: bio?.email || '',
            };
        });
    }, [members, bioData]);

    const handleGrant = async (member) => {
        const role = Number(roleDraft[member.memberId]);
        if (!role) return;
        setBusyId(member.memberId);
        try {
            await apiClient.assignContentRole(member.memberId, role);
            setRoleDraft((p) => { const n = { ...p }; delete n[member.memberId]; return n; });
            await loadData();
            notify('success', `${roleLabel(role)} role granted to ${member.label}.`);
        } catch (error) {
            notify('error', error.message || 'Failed to grant content role. Please try again.');
        } finally {
            setBusyId(null);
        }
    };

    const handleRevoke = async (member) => {
        const yes = await confirm({
            title: 'Revoke Content Role',
            message: `Remove ${member.label}'s content role? They will lose access to upload content unless they hold another system role.`,
            confirmLabel: 'Revoke',
            danger: true,
        });
        if (!yes) return;

        setBusyId(member.memberId);
        try {
            await apiClient.revokeContentRole(member.memberId);
            await loadData();
            notify('success', `Content role revoked from ${member.label}.`);
        } catch (error) {
            notify('error', error.message || 'Failed to revoke content role. Please try again.');
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading content team…</p></div>;
    }

    if (!contentUnit) {
        return (
            <div className={styles.empty}>
                <p>No content unit has been designated yet. Ask an admin to mark a unit as the Content/Media unit under Units.</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <div>
                    <h2>{contentUnit.unitName}</h2>
                    <p className={styles.cardDescription}>
                        Grant or revoke content roles for members of this unit. Granting a role lets a member log in and upload content for vetting.
                    </p>
                </div>
            </div>

            {enrichedMembers.length === 0 ? (
                <div className={styles.empty}><p>No members are assigned to this unit yet.</p></div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Content Role</th>
                                <th>Assign / Change</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrichedMembers.map((member) => {
                                const busy = busyId === member.memberId;
                                const currentLabel = roleLabel(member.contentRole);
                                return (
                                    <tr key={member.memberId}>
                                        <td><div style={{ fontWeight: 600 }}>{member.label}</div></td>
                                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{member.email || '—'}</td>
                                        <td>
                                            {currentLabel
                                                ? <span className={styles.badge}>{currentLabel}</span>
                                                : <span style={{ color: '#cbd5e1' }}>— none —</span>}
                                        </td>
                                        <td>
                                            <div className={styles.quickAssignRow}>
                                                <select
                                                    value={roleDraft[member.memberId] ?? ''}
                                                    onChange={(e) => setRoleDraft((p) => ({ ...p, [member.memberId]: e.target.value }))}
                                                    className={styles.inlineSelect}
                                                    disabled={busy}
                                                >
                                                    <option value="">— Select role —</option>
                                                    {CONTENT_ROLE_OPTIONS.map((r) => (
                                                        <option key={r.value} value={r.value}>{r.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleGrant(member)}
                                                    disabled={busy || !roleDraft[member.memberId]}
                                                    className={styles.assignInlineBtn}
                                                >
                                                    {busy ? '…' : currentLabel ? 'Change' : 'Grant'}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            {currentLabel && (
                                                <button
                                                    onClick={() => handleRevoke(member)}
                                                    disabled={busy}
                                                    className={styles.assignInlineBtn}
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
