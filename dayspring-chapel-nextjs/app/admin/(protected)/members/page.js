'use client';

import apiClient from '@/lib/apiClient';
import MembersPanel from '@/components/admin/panels/MembersPanel';
import ContentUnitMembersPanel from '@/components/admin/panels/ContentUnitMembersPanel';
import styles from './members.module.css';

function resolveRole() {
    const userData = apiClient.getUserData();
    if (!userData) return 'member';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    if (name.includes('admin')) return 'churchAdmin';
    return 'member';
}

export default function MembersPage() {
    const role = resolveRole();

    if (role === 'churchMedia') {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Content Team</h1>
                    <p>Manage members of the content unit and their content roles</p>
                </div>

                <ContentUnitMembersPanel />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Members Management</h1>
                <p>Manage church members and track birthdays</p>
            </div>

            <MembersPanel />
        </div>
    );
}
