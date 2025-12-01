'use client';

import MembersPanel from '@/components/admin/panels/MembersPanel';
import styles from './members.module.css';

export default function MembersPage() {
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
