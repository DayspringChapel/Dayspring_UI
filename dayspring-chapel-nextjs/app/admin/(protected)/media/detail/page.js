'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './detail.module.css';

const STATUS_BADGES = {
    0:  { label: 'Draft',          cls: 'bg-gray-100 text-gray-600' },
    1:  { label: 'Submitted',      cls: 'bg-blue-100 text-blue-700' },
    2:  { label: 'Media Review',   cls: 'bg-yellow-100 text-yellow-700' },
    3:  { label: 'Revision Req.',  cls: 'bg-orange-100 text-orange-700' },
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

    useEffect(() => {
        if (!id) { setLoading(false); return; }
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
        if (!confirm('Submit this content for review?')) return;
        try {
            await apiClient.submitForReview(id, null);
            const updated = await apiClient.getMediaContentById(id);
            setContent(updated);
        } catch (err) { alert(err.message); }
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
            alert(err.message);
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
            <button className={styles.backBtn} onClick={() => router.back()}>
                ← Back to Media
            </button>

            <div className={styles.grid}>
                <div className={styles.mainCol}>
                    {/* Content card */}
                    <div className={styles.card}>
                        {content.thumbnailUrl && (
                            <img src={content.thumbnailUrl} alt={content.title} className={styles.cardThumb} />
                        )}
                        <div className={styles.titleRow}>
                            <h1>{content.title}</h1>
                            <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <p className={styles.description}>{content.description}</p>
                        <ul className={styles.metaList}>
                            <li>Type: {content.contentTypeName} · Category: {content.category}</li>
                            <li>Tags: {content.tags || 'none'}</li>
                            <li>Uploaded by {content.ownerName} on {content.createdDate}</li>
                        </ul>
                        <a
                            href={content.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mediaLink}
                        >
                            Open media file →
                        </a>
                        {content.workflowStatus === 0 && (
                            <>
                                <hr className={styles.divider} />
                                <button className={styles.btnSubmit} onClick={handleSubmitForReview}>
                                    Submit for Review
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
                                            <p className={styles.timelineComment}>"{h.comment}"</p>
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
