'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from '@/components/admin/panels/Panel.module.css';
import pStyles from './permissions.module.css';

function resolveRole() {
    const userData = apiClient.getUserData();
    if (!userData) return 'churchAdmin';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    return 'churchAdmin';
}

// Logical groupings for display
const PERMISSION_GROUPS = {
    'People & Access': [
        'CanManageUsers', 'CanAssignRoles', 'CanAssignPermission', 'CanAccessAllData',
        'CanManageMember', 'CanManageDepartments', 'CanManagePastor', 'CanManageMinister',
        'CanManageOccupation',
    ],
    'Groups & Operations': [
        'CanManageSmallGroup', 'CanManageNewsletter', 'CanManageGiving',
        'CanManageAppointment', 'CanManageRequisition', 'CanManageEvent',
    ],
    'Content & Media': [
        'CanViewMediaData', 'CanManageImage', 'CanUploadContent', 'CanManageContent',
        'CanSubmitContent', 'CanManageBooks', 'CanManageAlbum', 'CanWriteMediaFile',
        'CanManageSeries', 'CanManageSermon',
    ],
    'Review & Publishing': [
        'CanReviewContent', 'CanApproveAsAdmin', 'CanApproveAsSuperAdmin',
        'CanPublishContent',
    ],
    'System': [
        'CanManageSystemSettings',
    ],
};

const ROLE_COLORS = {
    superAdmin:  { bg: '#7c3aed22', border: '#7c3aed44', text: '#7c3aed', dot: '#7c3aed' },
    churchAdmin: { bg: '#0d948822', border: '#0d948844', text: '#0d9488', dot: '#0d9488' },
    churchMedia: { bg: '#db277722', border: '#db277744', text: '#db2777', dot: '#db2777' },
};

function colorFor(roleName) {
    const n = (roleName || '').toLowerCase();
    if (n.includes('super')) return ROLE_COLORS.superAdmin;
    if (n.includes('media')) return ROLE_COLORS.churchMedia;
    return ROLE_COLORS.churchAdmin;
}

export default function PermissionsPage() {
    const router = useRouter();
    const [roles, setRoles]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // role name to inspect

    const callerRole = resolveRole();

    useEffect(() => {
        if (callerRole !== 'superAdmin') {
            router.replace('/admin/dashboard');
            return;
        }
        apiClient.getRoles().then(res => {
            const list = Array.isArray(res) ? res : [];
            setRoles(list);
            if (list.length > 0) setSelected(list[0].name || list[0].Name);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [callerRole, router]);

    if (loading) {
        return <div className={styles.loading}><div className={styles.spinner} /><p>Loading permissions…</p></div>;
    }

    const selectedRole = roles.find(r => (r.name || r.Name) === selected);
    const selectedPerms = new Set(selectedRole?.permissions || selectedRole?.Permissions || []);
    const allPerms = [...new Set(roles.flatMap(r => r.permissions || r.Permissions || []))];

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>Permission Management</h2>
                    <p className={styles.cardDescription}>
                        View which permissions belong to each system role. Permissions are managed via the system seeder.
                    </p>
                </div>
            </div>

            {/* Role selector tabs */}
            <div className={pStyles.roleTabs}>
                {roles.map(r => {
                    const name = r.name || r.Name || '';
                    const perms = (r.permissions || r.Permissions || []).length;
                    const c = colorFor(name);
                    const active = selected === name;
                    return (
                        <button
                            key={name}
                            className={`${pStyles.roleTab} ${active ? pStyles.roleTabActive : ''}`}
                            style={active ? { background: c.bg, borderColor: c.border, color: c.text } : {}}
                            onClick={() => setSelected(name)}
                        >
                            <span className={pStyles.roleTabDot} style={active ? { background: c.dot } : {}} />
                            <span className={pStyles.roleTabName}>{name}</span>
                            <span className={pStyles.roleTabCount}>{perms}</span>
                        </button>
                    );
                })}
            </div>

            {/* Permission comparison matrix */}
            <div className={pStyles.matrixHeader}>
                <h3 className={pStyles.matrixTitle}>
                    Permissions for <span style={{ color: colorFor(selected).text }}>{selected}</span>
                </h3>
                <span className={pStyles.matrixSub}>{selectedPerms.size} of {allPerms.length} permissions granted</span>
            </div>

            <div className={pStyles.groupsGrid}>
                {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                    <div key={group} className={pStyles.groupCard}>
                        <h4 className={pStyles.groupTitle}>{group}</h4>
                        <ul className={pStyles.permList}>
                            {perms.map(perm => {
                                const has = selectedPerms.has(perm);
                                return (
                                    <li key={perm} className={`${pStyles.permItem} ${has ? pStyles.permGranted : pStyles.permDenied}`}>
                                        <span className={pStyles.permIcon}>{has ? '✓' : '✗'}</span>
                                        <span className={pStyles.permName}>{perm}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Cross-role comparison table */}
            <div className={pStyles.compareSection}>
                <h3 className={pStyles.matrixTitle}>Cross-Role Comparison</h3>
                <div className={pStyles.tableWrap}>
                    <table className={pStyles.compareTable}>
                        <thead>
                            <tr>
                                <th className={pStyles.permCol}>Permission</th>
                                {roles.map(r => {
                                    const name = r.name || r.Name || '';
                                    const c = colorFor(name);
                                    return (
                                        <th key={name} className={pStyles.roleCol} style={{ color: c.text }}>
                                            {name}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(PERMISSION_GROUPS).flat().map(perm => (
                                <tr key={perm}>
                                    <td className={pStyles.permCell}>{perm}</td>
                                    {roles.map(r => {
                                        const name = r.name || r.Name || '';
                                        const hasIt = (r.permissions || r.Permissions || []).includes(perm);
                                        const c = colorFor(name);
                                        return (
                                            <td key={name} className={pStyles.checkCell}>
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
        </div>
    );
}
