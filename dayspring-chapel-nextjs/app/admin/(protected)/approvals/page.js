'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import styles from './approvals.module.css';

export default function ApprovalsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('admin');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [modal, setModal] = useState(null); // { type: 'approve'|'reject', contentId }
    const [comment, setComment] = useState('');

    const { toast, notify, clearToast } = useToast();

    useEffect(() => {
        setLoading(true);
        const fetch = activeTab === 'admin'
            ? apiClient.getAdminApprovalQueue()
            : apiClient.getSuperAdminApprovalQueue();
        fetch
            .then((data) => setItems(data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [activeTab]);

    const openModal = (type, contentId) => {
        setComment('');
        setModal({ type, contentId });
    };

    const closeModal = () => setModal(null);

    const handleModalSubmit = async () => {
        if ((modal.type === 'reject' || modal.type === 'amend') && !comment.trim()) return;
        setActionLoading(modal.contentId);
        try {
            if (modal.type === 'approve') {
                await apiClient.approveContent(modal.contentId, comment.trim() || null);
            } else if (modal.type === 'amend') {
                await apiClient.requestAmendment(modal.contentId, comment.trim());
            } else {
                await apiClient.rejectContent(modal.contentId, comment.trim());
            }
            setItems((prev) => prev.filter((i) => i.contentId !== modal.contentId));
            closeModal();
            notify('success', 'Action completed successfully.');
        } catch (err) {
            notify('error', err.message || 'Something went wrong. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const TABS = [
        { id: 'admin',      label: 'Admin Queue' },
        { id: 'superadmin', label: 'Super Admin Queue' },
    ];

    return (
        <div className={styles.page}>
            <AdminToast toast={toast} onClose={clearToast} />
            <div className={styles.header}>
                <h1>Approval Queue</h1>
                <p>Review and approve or reject pending content submissions</p>
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
                <div className={styles.empty}>No pending approvals in this queue</div>
            )}

            {!loading && items.length > 0 && (
                <div className={styles.list}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.row}>
                            <div className={styles.rowInfo}>
                                <h3>{item.contentTitle}</h3>
                                <p>{item.levelName} approval · Submitted {item.createdDate}</p>
                            </div>
                            <div className={styles.rowActions}>
                                <button
                                    className={styles.btnGhost}
                                    onClick={() => router.push(`/admin/media/detail?id=${item.contentId}`)}
                                >
                                    View
                                </button>
                                <button
                                    className={styles.btnDanger}
                                    disabled={actionLoading === item.contentId}
                                    onClick={() => openModal('reject', item.contentId)}
                                >
                                    Reject
                                </button>
                                <button
                                    className={styles.btnGhost}
                                    disabled={actionLoading === item.contentId}
                                    onClick={() => openModal('amend', item.contentId)}
                                >
                                    Request Amendment
                                </button>
                                <button
                                    className={styles.btnSuccess}
                                    disabled={actionLoading === item.contentId}
                                    onClick={() => openModal('approve', item.contentId)}
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className={styles.modal}>
                        <h2>
                            {modal.type === 'approve' ? 'Approve Content' : modal.type === 'amend' ? 'Request Amendment' : 'Reject Content'}
                        </h2>
                        <div className={styles.formGroup}>
                            <label>
                                {modal.type === 'approve' ? 'Comment (optional)' : modal.type === 'amend' ? 'What needs to change? (required)' : 'Rejection reason (required)'}
                            </label>
                            <textarea
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={
                                    modal.type === 'approve'
                                        ? 'Add an approval comment…'
                                        : modal.type === 'amend'
                                        ? 'Describe the changes the submitter needs to make…'
                                        : 'Describe why this content is being rejected…'
                                }
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnModalCancel} onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className={styles.btnModalSubmit}
                                disabled={actionLoading !== null || ((modal.type === 'reject' || modal.type === 'amend') && !comment.trim())}
                                onClick={handleModalSubmit}
                            >
                                {actionLoading !== null
                                    ? 'Processing…'
                                    : modal.type === 'approve'
                                    ? 'Confirm Approval'
                                    : modal.type === 'amend'
                                    ? 'Send Back for Amendment'
                                    : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
