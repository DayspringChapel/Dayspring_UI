'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';
import { humanizeLabel } from '@/lib/format';
import styles from './workflow.module.css';

const STATUS_BADGES = {
    0:  { label: 'Draft',            cls: 'bg-gray-100 text-gray-600' },
    1:  { label: 'Submitted',        cls: 'bg-blue-100 text-blue-700' },
    2:  { label: 'Media Review',     cls: 'bg-yellow-100 text-yellow-700' },
    3:  { label: 'Needs Correction', cls: 'bg-orange-100 text-orange-700' },
    4:  { label: 'Resubmitted',      cls: 'bg-purple-100 text-purple-700' },
    5:  { label: 'Admin Approval',   cls: 'bg-indigo-100 text-indigo-700' },
    6:  { label: 'Super Admin',      cls: 'bg-pink-100 text-pink-700' },
    7:  { label: 'Ready to Publish', cls: 'bg-teal-100 text-teal-700' },
    8:  { label: 'Scheduled',        cls: 'bg-cyan-100 text-cyan-700' },
    9:  { label: 'Publishing',       cls: 'bg-lime-100 text-lime-700' },
    10: { label: 'Published',        cls: 'bg-green-100 text-green-700' },
    11: { label: 'Archived',         cls: 'bg-slate-100 text-slate-600' },
    12: { label: 'Rejected',         cls: 'bg-red-100 text-red-700' },
};

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

function Badge({ status }) {
    const b = STATUS_BADGES[status] || { label: 'Unknown', cls: 'bg-gray-100 text-gray-600' };
    return <span className={`${styles.badge} ${b.cls}`}>{b.label}</span>;
}

function CorrectionNote({ contentId, historyMap }) {
    const h = historyMap[contentId];
    if (!h) return null;
    return (
        <div className={styles.commentBox}>
            <strong>{h.actionByName || 'Reviewer'}:</strong> {h.comment || 'No comment provided.'}
        </div>
    );
}

export default function WorkflowPage() {
    const router = useRouter();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyMap, setHistoryMap] = useState({});
    const [actionLoading, setActionLoading] = useState(null);

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    const role = resolveRole();
    const canReview = role === 'churchMedia' || role === 'superAdmin';

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const data = await apiClient.getMediaContents();
            const items = data || [];
            setContents(items);

            const revisionItems = items.filter((c) => c.workflowStatus === 3);
            if (revisionItems.length > 0) {
                const histories = await Promise.allSettled(
                    revisionItems.map((c) => apiClient.getWorkflowHistory(c.id))
                );
                const map = {};
                revisionItems.forEach((c, i) => {
                    const res = histories[i];
                    const history = res.status === 'fulfilled' ? res.value : [];
                    if (Array.isArray(history) && history.length > 0) {
                        map[c.id] = history[history.length - 1];
                    }
                });
                setHistoryMap(map);
            } else {
                setHistoryMap({});
            }
        } catch {
            setContents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleForward = async (contentId) => {
        setActionLoading(contentId);
        try {
            await apiClient.forwardForApproval(contentId, null);
            setContents((prev) => prev.map((c) => c.id === contentId ? { ...c, workflowStatus: 5, workflowStatusName: 'AdminApproval' } : c));
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
            await load();
            notify('success', 'Content sent back to draft.');
        } catch (err) {
            notify('error', err.message || 'Failed to send content back. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    // Admin-stage (5) approval forwards to Super Admin; Super-Admin-stage (6) approval
    // opens the content up for churchMedia to publish.
    const handleApprove = async (contentId, atStage) => {
        const comment = await confirm({
            title: atStage === 6 ? 'Approve for Publishing' : 'Approve & Forward to Super Admin',
            message: atStage === 6
                ? 'This opens the content up for churchMedia to publish.'
                : 'This forwards the content to Super Admin for final approval.',
            confirmLabel: 'Approve',
            showInput: true,
            inputLabel: 'Comment (optional)',
            inputPlaceholder: 'Add an approval comment…',
        });
        setActionLoading(contentId);
        try {
            await apiClient.approveContent(contentId, comment || null);
            await load();
            notify('success', atStage === 6 ? 'Approved — ready for churchMedia to publish.' : 'Approved and forwarded to Super Admin.');
        } catch (err) {
            notify('error', err.message || 'Failed to approve content. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (contentId) => {
        const comment = await confirm({
            title: 'Send Back for Correction',
            message: 'This sends the content back to the uploader with your comment.',
            confirmLabel: 'Send Back',
            danger: true,
            showInput: true,
            inputLabel: 'What needs to change? (required)',
            inputPlaceholder: 'Describe the changes the uploader needs to make…',
        });
        if (!comment || !comment.trim()) {
            notify('warning', 'A comment is required to send content back.');
            return;
        }
        setActionLoading(contentId);
        try {
            await apiClient.rejectContent(contentId, comment.trim());
            await load();
            notify('success', 'Sent back to the uploader for correction.');
        } catch (err) {
            notify('error', err.message || 'Failed to send content back. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    // Which approval stage (if any) the current role can act on for this item.
    const approvableStage = (item) => {
        if (item.workflowStatus === 5 && (role === 'churchAdmin' || role === 'superAdmin')) return 5;
        if (item.workflowStatus === 6 && role === 'superAdmin') return 6;
        return null;
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading…</div>
            </div>
        );
    }

    const published = contents.filter((c) => c.workflowStatus === 10);
    const inPipeline = contents.filter((c) => c.workflowStatus !== 0 && c.workflowStatus !== 10);

    const Row = ({ item, showReviewActions }) => {
        const stage = approvableStage(item);
        return (
            <div className={styles.row}>
                <div className={styles.rowInfo}>
                    <h3>{item.title}</h3>
                    <p>{humanizeLabel(item.categoryName)} · {item.contentTypeName} · by {item.ownerName}</p>
                    <div style={{ marginTop: '0.4rem' }}><Badge status={item.workflowStatus} /></div>
                    {item.workflowStatus === 3 && <CorrectionNote contentId={item.id} historyMap={historyMap} />}
                </div>
                <div className={styles.rowActions}>
                    <button className={styles.btnGhost} onClick={() => router.push(`/admin/media/detail?id=${item.id}`)}>
                        View
                    </button>
                    {showReviewActions && (item.workflowStatus === 1 || item.workflowStatus === 4) && (
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
                    {stage && (
                        <>
                            <button
                                className={styles.btnWarning}
                                disabled={actionLoading === item.id}
                                onClick={() => handleReject(item.id)}
                            >
                                Reject
                            </button>
                            <button
                                className={styles.btnPrimary}
                                disabled={actionLoading === item.id}
                                onClick={() => handleApprove(item.id, stage)}
                            >
                                {role === 'superAdmin' || stage === 6 ? 'Approve' : 'Approve → Super Admin'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // ── Content Personnel: only their own content and its current stage ──────
    if (!canReview && role !== 'churchAdmin') {
        return (
            <div className={styles.page}>
                <AdminToast toast={toast} onClose={clearToast} />
                <AdminConfirm dialog={dialog} onClose={closeDialog} />
                <div className={styles.header}>
                    <h1>My Content</h1>
                    <p>Track the stage of everything you've uploaded</p>
                </div>
                {contents.length === 0 ? (
                    <div className={styles.empty}>You haven't uploaded anything yet.</div>
                ) : (
                    <div className={styles.list}>
                        {contents.map((item) => <Row key={item.id} item={item} showReviewActions={false} />)}
                    </div>
                )}
            </div>
        );
    }

    // ── Church Admin: what Super Admin sent back, everything forwarded to admin, and published ──
    if (role === 'churchAdmin') {
        const fromSuperAdmin = inPipeline.filter((c) => c.workflowStatus === 3 && historyMap[c.id]?.fromStatus === 6);
        // Only content that has actually reached the Admin stage or beyond — anything still
        // sitting in churchMedia's internal review queue hasn't been forwarded to admin yet.
        const submitted = inPipeline.filter((c) => c.workflowStatus >= 5 && c.workflowStatus !== 10);

        return (
            <div className={styles.page}>
                <AdminToast toast={toast} onClose={clearToast} />
                <AdminConfirm dialog={dialog} onClose={closeDialog} />
                <div className={styles.header}>
                    <h1>Media Workflow</h1>
                    <p>Content forwarded to you for approval, and what Super Admin sent back</p>
                </div>

                {fromSuperAdmin.length > 0 && (
                    <>
                        <h2 className={styles.sectionTitle}>Sent Back by Super Admin</h2>
                        <div className={styles.list} style={{ marginBottom: '2rem' }}>
                            {fromSuperAdmin.map((item) => <Row key={item.id} item={item} showReviewActions={false} />)}
                        </div>
                    </>
                )}

                <h2 className={styles.sectionTitle}>Forwarded For Approval</h2>
                {submitted.length === 0 ? (
                    <div className={styles.empty}>Nothing has been forwarded to you yet.</div>
                ) : (
                    <div className={styles.list} style={{ marginBottom: '2rem' }}>
                        {submitted.map((item) => <Row key={item.id} item={item} showReviewActions={false} />)}
                    </div>
                )}

                <h2 className={styles.sectionTitle}>Published</h2>
                {published.length === 0 ? (
                    <div className={styles.empty}>Nothing has been published yet.</div>
                ) : (
                    <div className={styles.list}>
                        {published.map((item) => <Row key={item.id} item={item} showReviewActions={false} />)}
                    </div>
                )}
            </div>
        );
    }

    // ── Church Media: full pipeline visibility. Super Admin: only content already
    // forwarded to Super Admin (or beyond) — earlier-stage items aren't theirs to see yet. ──
    const visibleForCategorizedView = role === 'superAdmin'
        ? inPipeline.filter((c) => c.workflowStatus >= 6)
        : inPipeline;
    const categories = [...new Set(visibleForCategorizedView.map((c) => c.categoryName))].sort();

    return (
        <div className={styles.page}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />
            <div className={styles.header}>
                <h1>Media Workflow</h1>
                <p>{role === 'superAdmin'
                    ? 'Content forwarded to you for final approval, and published content'
                    : 'All content, grouped by category and current stage'}</p>
            </div>

            {categories.length === 0 && (
                <div className={styles.empty}>
                    {role === 'superAdmin' ? 'Nothing has been forwarded to you yet.' : 'No content is in the pipeline right now.'}
                </div>
            )}

            {categories.map((cat) => {
                const items = visibleForCategorizedView.filter((c) => c.categoryName === cat);
                return (
                    <div key={cat} style={{ marginBottom: '2rem' }}>
                        <h2 className={styles.sectionTitle}>{humanizeLabel(cat)}</h2>
                        <div className={styles.list}>
                            {items.map((item) => <Row key={item.id} item={item} showReviewActions />)}
                        </div>
                    </div>
                );
            })}

            <h2 className={styles.sectionTitle}>Published</h2>
            {published.length === 0 ? (
                <div className={styles.empty}>Nothing has been published yet.</div>
            ) : (
                <div className={styles.list}>
                    {published.map((item) => <Row key={item.id} item={item} showReviewActions={false} />)}
                </div>
            )}
        </div>
    );
}
