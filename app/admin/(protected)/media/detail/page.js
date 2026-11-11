'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';
import VideoEmbed from '@/components/VideoEmbed';
import { humanizeLabel } from '@/lib/format';
import Image from 'next/image';
import styles from './detail.module.css';

const STATUS_BADGES = {
    0:  { label: 'Draft',          cls: 'bg-gray-100 text-gray-600' },
    1:  { label: 'Submitted',      cls: 'bg-blue-100 text-blue-700' },
    2:  { label: 'Media Review',   cls: 'bg-yellow-100 text-yellow-700' },
    3:  { label: 'Revision Req.',  cls: 'bg-orange-100 text-orange-700' },
    4: { label: 'Resubmitted', cls: 'bg-purple-100 text-purple-700' },
    5: { label: 'Admin Approval', cls: 'bg-indigo-100 text-indigo-700' },
    6: { label: 'Superadmin Approval', cls: 'bg-pink-100 text-pink-700' },
    8: { label: 'Scheduled', cls: 'bg-cyan-100 text-cyan-700' },
    9: { label: 'Publishing', cls: 'bg-lime-100 text-lime-700' },
    11: { label: 'Archived', cls: 'bg-slate-100 text-slate-600' },
    7:  { label: 'Ready',          cls: 'bg-teal-100 text-teal-700' },
    10: { label: 'Published',      cls: 'bg-green-100 text-green-700' },
    12: { label: 'Rejected',       cls: 'bg-red-100 text-red-700' },
};

function MediaDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [content, setContent]     = useState(null);
    const [history, setHistory]     = useState([]);
    const [comments, setComments]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [commentText, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [routing, setRouting] = useState(false);

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => {
        if (!id) { Promise.resolve().then(() => setLoading(false)); return; }
        Promise.allSettled([
            apiClient.getMediaContentById(id),
            apiClient.getWorkflowHistory(id),
            apiClient.getReviewComments(id),
        ]).then(([c, h, cm]) => {
            if (c.status  === 'fulfilled') setContent(c.value);
            if (h.status  === 'fulfilled') setHistory(h.value  || []);
            if (cm.status === 'fulfilled') setComments(cm.value || []);
        }).finally(() => setLoading(false));
    }, [id]);

    const handleSubmitForReview = async () => {
        const submissionComment = await confirm({
            title: content.workflowStatus === 3 ? 'Resubmit corrected content' : 'Submit for Review',
            message: 'Submission automatically sends this content to the next reviewer. Corrections return to the review stage that requested them.',
            confirmLabel: 'Submit',
            showInput: true,
            inputLabel: 'Comment for the reviewer (optional)',
            inputPlaceholder: 'Explain what you changed or add a note…',
        });
        if (submissionComment === false) return;
        setRouting(true);
        try {
            await apiClient.submitForReview(id, submissionComment?.trim() || null);
            const updated = await apiClient.getMediaContentById(id);
            setContent(updated);
            const stage = updated?.workflowStatus;
            notify('success', stage === 7 ? 'Ready to publish.' : stage === 6 ? 'Sent to Superadmin for approval.' : stage === 5 ? 'Sent to Church Admin for approval.' : 'Sent to Church Media for review.');
            setHistory(await apiClient.getWorkflowHistory(id) || []);
        } catch (err) {
            notify('error', err.message || 'Failed to submit for review. Please try again.');
        } finally {
            setRouting(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            const newComment = await apiClient.addReviewComment(id, commentText);
            setComments((prev) => [...prev, newComment]);
            setComment('');
        } catch (err) {
            notify('error', err.message || 'Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!id)      return <div className={styles.centered}>No content ID provided</div>;
    if (loading)  return <div className={styles.centered}>Loading…</div>;
    if (!content) return <div className={styles.centered}>Content not found</div>;

    const badge = STATUS_BADGES[content.workflowStatus] || { label: content.workflowStatusName || '—', cls: 'bg-gray-100 text-gray-600' };

    return (
        <div className={styles.page}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />
            <button className={styles.backBtn} onClick={() => router.back()}>
                ← Back to Media
            </button>

            <div className={styles.grid}>
                <div className={styles.mainCol}>
                    {/* Content card */}
                    <div className={styles.card}>
                        {content.thumbnailUrl && (
                            <Image src={content.thumbnailUrl} alt={content.title} width={960} height={540} className={styles.cardThumb} />
                        )}
                        <div className={styles.titleRow}>
                            <h1>{content.title}</h1>
                            <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <p className={styles.description}>{content.description}</p>{content.eventId && <p>This media is linked to its program. Edit details or manage its flyer and optional video in Events & programs. Changes follow the approval workflow.</p>}
                        <ul className={styles.metaList}>
                            <li>Type: {content.contentTypeName} · Category: {humanizeLabel(content.categoryName)}</li>
                            <li>Tags: {content.tags || 'none'}</li>
                            <li>Uploaded by {content.ownerName} on {content.createdDate}</li>
                        </ul>
                        {content.contentTypeName === 'Video' ? (
                            <VideoEmbed
                                youtubeUrl={content.youtubeUrl}
                                videoUrl={content.cloudinaryUrl}
                                title={content.title}
                                className={styles.mediaVideo}
                            />
                        ) : content.contentTypeName === 'Audio' ? (
                            <audio src={content.cloudinaryUrl} controls className={styles.mediaAudio} />
                        ) : (
                            <a
                                href={content.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mediaLink}
                            >
                                Open media file →
                            </a>
                        )}
                        {[0, 3].includes(content.workflowStatus) && apiClient.hasPermission('CanSubmitContent') && content.ownerId === apiClient.getUserData()?.id && (
                            <>
                                <hr className={styles.divider} />
                                <button className={styles.btnSubmit} disabled={routing} onClick={handleSubmitForReview}>
                                    {routing ? 'Submitting…' : content.workflowStatus === 3 ? 'Resubmit to reviewer' : 'Submit for review'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Review comments */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Review Comments</h2>
                        {comments.length === 0 && (
                            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                                No comments yet
                            </p>
                        )}
                        <div className={styles.commentList}>
                            {comments.map((c) => (
                                <div key={c.id} className={styles.comment}>
                                    <p className={styles.commentAuthor}>{c.authorName}</p>
                                    <p className={styles.commentBody}>{c.body}</p>
                                    <span className={styles.commentTime}>
                                        {new Date(c.commentedAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <form className={styles.commentForm} onSubmit={handleComment}>
                            <input
                                className={styles.commentInput}
                                value={commentText}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a review comment…"
                            />
                            <button className={styles.btnPost} type="submit" disabled={submitting}>
                                Post
                            </button>
                        </form>
                    </div>
                </div>

                {/* Workflow timeline */}
                <div className={styles.sideCol}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Workflow Timeline</h2>
                        {history.length === 0 ? (
                            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No transitions yet</p>
                        ) : (
                            <ol className={styles.timeline}>
                                {history.map((h) => (
                                    <li key={h.id} className={styles.timelineItem}>
                                        <p className={styles.timelineTrans}>
                                            {h.fromStatusName} → {h.toStatusName}
                                        </p>
                                        <p className={styles.timelineActor}>{h.actionByName}</p>
                                        {h.comment && (
                                            <p className={styles.timelineComment}>&quot;{h.comment}&quot;</p>
                                        )}
                                        <span className={styles.timelineTime}>
                                            {new Date(h.transitionedAt).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MediaDetailPage() {
    return (
        <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center', color: '#5b667a' }}>Loading…</div>}>
            <MediaDetail />
        </Suspense>
    );
}
