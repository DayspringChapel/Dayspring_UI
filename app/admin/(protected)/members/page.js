'use client';

import apiClient from '@/lib/apiClient';
import MembersPanel from '@/components/admin/panels/MembersPanel';
import ContentUnitMembersPanel from '@/components/admin/panels/ContentUnitMembersPanel';
import styles from './members.module.css';

export default function MembersPage() {
    // Church-wide member management needs CanManageMember. A role that can only see the content
    // unit (CanViewUnitMembers) gets the smaller Content Team view.
    const canManageMembers = apiClient.hasPermission('CanManageMember');

    if (!canManageMembers && apiClient.hasPermission('CanViewUnitMembers')) {
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
