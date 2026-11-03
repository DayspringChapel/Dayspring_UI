'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import Portal from '@/components/ui/Portal';
import styles from './approvals.module.css';

export default function ApprovalsPage() {
    const router = useRouter();
    const panel = useRef(null);
    const pending = useRef(false);
    const [activeTab, setActiveTab] = useState(() => apiClient.hasPermission('CanApproveAsAdmin') ? 'admin' : 'superadmin');
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [modal, setModal] = useState(null); // { type: 'approve'|'reject', contentId }
    const [comment, setComment] = useState('');

    const { toast, notify, clearToast } = useToast();

    useEffect(() => {
        let active = true;
        const fetch = activeTab === 'admin'
            ? apiClient.getAdminApprovalQueue()
            : apiClient.getSuperAdminApprovalQueue();
        fetch
            .then((data) => { if (active) { setItems(data || []); setError(''); } })
            .catch((e) => { if (active) setError(e.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [activeTab, reload]);

    const openModal = (type, contentId) => {
        setComment('');
        setModal({ type, contentId });
    };

    const closeModal = () => { if (!pending.current) setModal(null); };
    useEffect(() => {
        if (!modal) return;
        const previous = document.activeElement; const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden'; panel.current?.querySelector('textarea')?.focus();
        return () => { document.body.style.overflow = overflow; previous?.focus(); };
    }, [modal]);
    function modalKey(event) {
        if (event.key === 'Escape') closeModal();
        if (event.key !== 'Tab') return;
        const controls = [...panel.current.querySelectorAll('button:not(:disabled),textarea')];
        const first = controls[0]; const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }

    const handleModalSubmit = async () => {
        if (!modal || pending.current) return;
        if (modal.type === 'reject' && !comment.trim()) return;
        pending.current = true;
        setActionLoading(modal.contentId);
        try {
            if (modal.type === 'approve') {
                await apiClient.approveContent(modal.contentId, comment.trim() || null);
            } else {
                await apiClient.rejectContent(modal.contentId, comment.trim());
            }
            setItems((prev) => prev.filter((i) => i.contentId !== modal.contentId));
            setModal(null);
            notify('success', modal.type === 'approve' ? 'Content approved.' : 'Sent back to the uploader for correction.');
        } catch (err) {
            notify('error', err.message || 'Something went wrong. Please try again.');
        } finally {
            pending.current = false;
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
                <p>Review pending content — approve to move it forward, or reject to send it back for correction</p>
            </div>

            <div className={styles.tabs}>
                {TABS.filter((tab) => apiClient.hasPermission(tab.id === 'admin' ? 'CanApproveAsAdmin' : 'CanApproveAsSuperAdmin')).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setLoading(true); setActiveTab(tab.id); }}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && <p role="alert">{error} <button onClick={() => { setLoading(true); setReload((v) => v + 1); }}>Try again</button></p>}
            {loading && <div className={styles.loading}>Loading…</div>}
            {!loading && !error && items.length === 0 && (
                <div className={styles.empty}>No pending approvals in this queue</div>
            )}

            {!loading && !error && items.length > 0 && (
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
                <Portal>
                <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div ref={panel} role="dialog" aria-modal="true" aria-label={modal.type === 'approve' ? 'Approve content' : 'Return content for correction'} onKeyDown={modalKey} className={styles.modal}>
                        <h2>{modal.type === 'approve' ? 'Approve Content' : 'Send Back for Correction'}</h2>
                        <div className={styles.formGroup}>
                            <label>
                                {modal.type === 'approve' ? 'Comment (optional)' : 'What needs to change? (required)'}
                            </label>
                            <textarea
                                aria-label={modal.type === 'approve' ? 'Approval comment' : 'Correction reason'}
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={
                                    modal.type === 'approve'
                                        ? 'Add an approval comment…'
                                        : 'Describe the changes the uploader needs to make…'
                                }
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnModalCancel} disabled={actionLoading !== null} onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className={styles.btnModalSubmit}
                                disabled={actionLoading !== null || (modal.type === 'reject' && !comment.trim())}
                                onClick={handleModalSubmit}
                            >
                                {actionLoading !== null
                                    ? 'Processing…'
                                    : modal.type === 'approve'
                                    ? 'Confirm Approval'
                                    : 'Send Back'}
                            </button>
                        </div>
                    </div>
                </div>
                </Portal>
            )}
        </div>
    );
}
