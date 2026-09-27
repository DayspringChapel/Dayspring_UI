'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from '@/components/admin/panels/Panel.module.css';
import pStyles from './permissions.module.css';
import Portal from '@/components/ui/Portal';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';

const ROLE_COLORS = {
    superadmin:  { bg: '#7c3aed22', border: '#7c3aed44', text: '#7c3aed', dot: '#7c3aed' },
    churchadmin: { bg: '#0d948822', border: '#0d948844', text: '#0d9488', dot: '#0d9488' },
    churchmedia: { bg: '#db277722', border: '#db277744', text: '#db2777', dot: '#db2777' },
};

function colorFor(roleName) {
    const n = (roleName || '').toLowerCase();
    if (n.includes('super')) return ROLE_COLORS.superadmin;
    if (n.includes('media')) return ROLE_COLORS.churchmedia;
    if (n.includes('admin')) return ROLE_COLORS.churchadmin;
    return { bg: '#0f766e22', border: '#0f766e44', text: '#0f766e', dot: '#0f766e' };
}

const EMPTY_DRAFT = { id: null, name: '', permissions: new Set() };

export default function PermissionsPage() {
    const router = useRouter();
    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);

    const [groups, setGroups] = useState([]); // [{ group, permissions: [{ name, description }] }]
    const [roles, setRoles] = useState([]);   // [{ id, name, permissions, isSystem, userCount }]
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // role name being inspected in the matrix

    const [draft, setDraft] = useState(null); // null = modal closed; EMPTY_DRAFT-shaped object otherwise
    const [saving, setSaving] = useState(false);

    // Role management is restricted to whoever holds CanAssignPermission (superAdmin by
    // default) — re-checked from the server so a permission change takes effect without
    // requiring a fresh login, and so a direct link can't bypass the sidebar's own gating.
    useEffect(() => {
        apiClient.refreshCurrentUserPermissions()
            .then(() => {
                if (!apiClient.hasPermission('CanAssignPermission')) {
                    router.replace('/admin/dashboard');
                    return;
                }
                setAllowed(true);
            })
            .catch(() => router.replace('/admin/dashboard'))
            .finally(() => setChecking(false));
    }, [router]);

    async function loadData() {
        setLoading(true);
        try {
            const [catalog, roleList] = await Promise.all([
                apiClient.getPermissionCatalog().catch(() => []),
                apiClient.getRolesForManagement().catch(() => []),
            ]);
            setGroups(Array.isArray(catalog) ? catalog : []);
            const list = Array.isArray(roleList) ? roleList : [];
            setRoles(list);
            setSelected((prev) => (list.some((r) => r.name === prev) ? prev : list[0]?.name || null));
        } catch {
            notify('error', 'Failed to load roles and permissions.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (allowed) loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowed]);

    const allPermissionNames = useMemo(() => groups.flatMap((g) => g.permissions.map((p) => p.name)), [groups]);

    const openCreate = () => setDraft({ ...EMPTY_DRAFT, permissions: new Set() });
    const openEdit = (role) => setDraft({ id: role.id, name: role.name, permissions: new Set(role.permissions) });
    const closeDraft = () => setDraft(null);

    const togglePermission = (name) => {
        setDraft((d) => {
            const next = new Set(d.permissions);
            if (next.has(name)) next.delete(name); else next.add(name);
            return { ...d, permissions: next };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!draft.name.trim()) {
            notify('warning', 'Enter a role name.');
            return;
        }
        setSaving(true);
        try {
            const permissions = [...draft.permissions];
            if (draft.id) {
                await apiClient.updateRole(draft.id, draft.name.trim(), permissions);
                notify('success', `"${draft.name.trim()}" updated.`);
            } else {
                await apiClient.createRole(draft.name.trim(), permissions);
                notify('success', `Role "${draft.name.trim()}" created.`);
            }
            closeDraft();
            await loadData();
        } catch (err) {
            notify('error', err.message || 'Failed to save the role. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (role) => {
        const yes = await confirm({
            title: 'Delete Role',
            message: `Delete the "${role.name}" role? This can't be undone.`,
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;
        try {
            await apiClient.deleteRole(role.id);
            notify('success', `"${role.name}" deleted.`);
            await loadData();
        } catch (err) {
            notify('error', err.message || 'Failed to delete the role.');
        }
    };

    if (checking || !allowed) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading…</p></div>;
    }

    if (loading) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading permissions…</p></div>;
    }

    const selectedRole = roles.find((r) => r.name === selected);
    const selectedPerms = new Set(selectedRole?.permissions || []);

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            {dialog && <AdminConfirm dialog={dialog} onClose={closeDialog} />}

            <div className={styles.panelHeader}>
                <div>
                    <h2>Roles &amp; Permissions</h2>
                    <p className={styles.cardDescription}>
                        Create roles and choose exactly what each one can do. You can only grant permissions you hold yourself.
                    </p>
                </div>
                <button className={styles.addBtn} onClick={openCreate}>+ Create Role</button>
            </div>

            <div className={pStyles.manageSection}>
                <div className={pStyles.roleCards}>
                    {roles.map((r) => {
                        const c = colorFor(r.name);
                        return (
                            <div key={r.id} className={pStyles.roleCard} style={{ borderColor: c.border }}>
                                <div className={pStyles.roleCardHeader}>
                                    <span className={pStyles.roleCardName} style={{ color: c.text }}>{r.name}</span>
                                    {r.isSystem && <span className={pStyles.systemBadge}>Built-in</span>}
                                </div>
                                <div className={pStyles.roleCardMeta}>
                                    {r.permissions.length} permission{r.permissions.length === 1 ? '' : 's'} · {r.userCount} user{r.userCount === 1 ? '' : 's'}
                                </div>
                                {!r.isSystem && (
                                    <div className={pStyles.roleCardActions}>
                                        <button className={styles.editBtn} onClick={() => openEdit(r)}>Edit</button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(r)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {roles.length === 0 && <div className={styles.empty}>No roles yet.</div>}
                </div>
            </div>

            {/* Role selector tabs */}
            <div className={pStyles.roleTabs}>
                {roles.map((r) => {
                    const c = colorFor(r.name);
                    const active = selected === r.name;
                    return (
                        <button
                            key={r.id}
                            className={`${pStyles.roleTab} ${active ? pStyles.roleTabActive : ''}`}
                            style={active ? { background: c.bg, borderColor: c.border, color: c.text } : {}}
                            onClick={() => setSelected(r.name)}
                        >
                            <span className={pStyles.roleTabDot} style={active ? { background: c.dot } : {}} />
                            <span className={pStyles.roleTabName}>{r.name}</span>
                            <span className={pStyles.roleTabCount}>{r.permissions.length}</span>
                        </button>
                    );
                })}
            </div>

            {selectedRole && (
                <>
                    <div className={pStyles.matrixHeader}>
                        <h3 className={pStyles.matrixTitle}>
                            Permissions for <span style={{ color: colorFor(selected).text }}>{selected}</span>
                        </h3>
                        <span className={pStyles.matrixSub}>{selectedPerms.size} of {allPermissionNames.length} permissions granted</span>
                    </div>

                    <div className={pStyles.groupsGrid}>
                        {groups.map((g) => (
                            <div key={g.group} className={pStyles.groupCard}>
                                <h4 className={pStyles.groupTitle}>{g.group}</h4>
                                <ul className={pStyles.permList}>
                                    {g.permissions.map((perm) => {
                                        const has = selectedPerms.has(perm.name);
                                        return (
                                            <li key={perm.name} className={`${pStyles.permItem} ${has ? pStyles.permGranted : pStyles.permDenied}`}>
                                                <span className={pStyles.permIcon}>{has ? '✓' : '✗'}</span>
                                                <span className={pStyles.permName}>{perm.name}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className={pStyles.compareSection}>
                <h3 className={pStyles.matrixTitle}>Cross-Role Comparison</h3>
                <div className={pStyles.tableWrap}>
                    <table className={pStyles.compareTable}>
                        <thead>
                            <tr>
                                <th className={pStyles.permCol}>Permission</th>
                                {roles.map((r) => (
                                    <th key={r.id} className={pStyles.roleCol} style={{ color: colorFor(r.name).text }}>
                                        {r.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allPermissionNames.map((perm) => (
                                <tr key={perm}>
                                    <td className={pStyles.permCell}>{perm}</td>
                                    {roles.map((r) => {
                                        const hasIt = r.permissions.includes(perm);
                                        const c = colorFor(r.name);
                                        return (
                                            <td key={r.id} className={pStyles.checkCell}>
                                                {hasIt
                                                    ? <span className={pStyles.checkYes} style={{ color: c.text }}>✓</span>
                                                    : <span className={pStyles.checkNo}>—</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {draft && (
                <Portal>
                    <div className={pStyles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeDraft()}>
                        <div className={pStyles.modal}>
                            <h2>{draft.id ? `Edit "${draft.name}"` : 'Create Role'}</h2>
                            <form onSubmit={handleSave}>
                                <div className={pStyles.field}>
                                    <label htmlFor="roleName">Role name</label>
                                    <input
                                        id="roleName"
                                        type="text"
                                        value={draft.name}
                                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                        placeholder="e.g. Ushers Coordinator"
                                        maxLength={50}
                                        autoFocus
                                    />
                                </div>

                                <div className={pStyles.field}>
                                    <label>Permissions</label>
                                    <div className={pStyles.permGroups}>
                                        {groups.map((g) => (
                                            <div key={g.group}>
                                                <div className={pStyles.permGroupTitle}>{g.group}</div>
                                                {g.permissions.map((perm) => (
                                                    <label key={perm.name} className={pStyles.permCheck}>
                                                        <input
                                                            type="checkbox"
                                                            checked={draft.permissions.has(perm.name)}
                                                            onChange={() => togglePermission(perm.name)}
                                                        />
                                                        <span>
                                                            {perm.description}
                                                            <span className={pStyles.permCheckDesc}>{perm.name}</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <p className={pStyles.hint}>You can only grant permissions you hold yourself.</p>
                                </div>

                                <div className={pStyles.modalActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={closeDraft}>Cancel</button>
                                    <button type="submit" className={styles.submitBtn} disabled={saving}>
                                        {saving ? 'Saving…' : draft.id ? 'Save Changes' : 'Create Role'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}
