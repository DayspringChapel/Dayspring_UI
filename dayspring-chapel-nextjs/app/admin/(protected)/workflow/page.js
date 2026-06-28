'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './workflow.module.css';

const TAB_STATUSES = {
    submitted:        1,
    'media-review':   2,
    'revision':       3,
    'admin-approval': 5,
    'ready':          7,
};

const TABS = [
    { id: 'submitted',        label: 'Submitted' },
    { id: 'media-review',     label: 'In Review' },
    { id: 'revision',         label: 'Revisions' },
    { id: 'admin-approval',   label: 'Admin Approval' },
    { id: 'ready',            label: 'Ready to Publish' },
];

export default function WorkflowPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('submitted');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        setLoading(true);
        apiClient.getMediaContentsByStatus(TAB_STATUSES[activeTab])
            .then((data) => setItems(data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [activeTab]);

    const handleForward = async (contentId) => {
        setActionLoading(contentId);
        try {
            await apiClient.forwardForApproval(contentId, null);
            setItems((prev) => prev.filter((i) => i.id !== contentId));
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendBack = async (contentId) => {
        const comment = prompt('Reason for sending back (optional):');
        setActionLoading(contentId);
        try {
            await apiClient.sendBackToDraft(contentId, comment);
            setItems((prev) => prev.filter((i) => i.id !== contentId));
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const canAct = activeTab === 'submitted' || activeTab === 'media-review';

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Workflow Dashboard</h1>
                <p>Review and route content through the approval pipeline</p>
            </div>

            <div className={styles.tabs}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && <div className={styles.loading}>Loading…</div>}
            {!loading && items.length === 0 && (
                <div className={styles.empty}>No items in this stage</div>
            )}

            {!loading && items.length > 0 && (
                <div className={styles.list}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.row}>
                            <div className={styles.rowInfo}>
                                <h3>{item.title}</h3>
                                <p>{item.contentTypeName} · {item.category} · by {item.ownerName}</p>
                            </div>
                            <div className={styles.rowActions}>
                                <button
                                    className={styles.btnGhost}
                                    onClick={() => router.push(`/admin/media/detail?id=${item.id}`)}
                                >
                                    View
                                </button>
                                {canAct && (
                                    <>
                                        <button
                                            className={styles.btnWarning}
                                            disabled={actionLoading === item.id}
                                            onClick={() => handleSendBack(item.id)}
                                        >
                                            Send Back
                                        </button>
                                        <button
                                            className={styles.btnPrimary}
                                            disabled={actionLoading === item.id}
                                            onClick={() => handleForward(item.id)}
                                        >
                                            Forward
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
