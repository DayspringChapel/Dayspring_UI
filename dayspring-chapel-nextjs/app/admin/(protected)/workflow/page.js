'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';
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

export default function WorkflowPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('submitted');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

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
            notify('success', 'Content forwarded for approval.');
        } catch (err) {
            notify('error', err.message || 'Failed to forward content. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendBack = async (contentId) => {
        const comment = await confirm({
            title: 'Send Back to Draft',
            message: 'This will return the content to Draft status.',
            confirmLabel: 'Send Back',
            showInput: true,
            inputLabel: 'Reason (optional)',
            inputPlaceholder: 'Describe what needs to change…',
        });
        setActionLoading(contentId);
        try {
            await apiClient.sendBackToDraft(contentId, comment || null);
            setItems((prev) => prev.filter((i) => i.id !== contentId));
            notify('success', 'Content sent back to draft.');
        } catch (err) {
            notify('error', err.message || 'Failed to send content back. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const role = resolveRole();
    const canReview = role === 'churchMedia' || role === 'superAdmin';
    const canAct = canReview && (activeTab === 'submitted' || activeTab === 'media-review');
    const isAdminApproval = activeTab === 'admin-approval';

    return (
        <div className={styles.page}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />
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
                                {isAdminApproval && (
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => router.push('/admin/approvals')}
                                    >
                                        Review &amp; Approve →
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
