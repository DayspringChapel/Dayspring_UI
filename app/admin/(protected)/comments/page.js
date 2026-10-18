'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './comments.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import AdminConfirm, { useConfirm } from '@/components/admin/AdminConfirm';

const TABS = [
    { key: 'Pending', label: 'Needs review' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Hidden', label: 'Hidden' },
    { key: '', label: 'All' },
];

function formatWhen(iso) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function CommentsModerationPage() {
    const [status, setStatus] = useState('Pending');
    const [source, setSource] = useState('');
    const [comments, setComments] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, hidden: 0 });
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [loadError, setLoadError] = useState(false);

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    const load = useCallback(async () => {
        try {
            const [list, summary] = await Promise.all([
                apiClient.getCommentsForModeration({ status, source }),
                apiClient.getCommentCounts(),
            ]);
            setComments(list);
            setCounts(summary);
            setLoadError(false);
        } catch (error) {
            console.error('Failed to load comments:', error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, [status, source]);

    useEffect(() => {
        setLoading(true);
        load();
    }, [load]);

    async function changeStatus(comment, nextStatus, removeFromYouTube = false) {
        setBusyId(comment.id);
        try {
            const result = await apiClient.setCommentStatus(comment.id, nextStatus, removeFromYouTube);
            notify('success', result?.message || 'Comment updated.');
            await load();
        } catch (error) {
            notify('error', error.message || 'Could not update the comment.');
        } finally {
            setBusyId(null);
        }
    }

    async function hideOnYouTubeToo(comment) {
        const yes = await confirm({
            title: 'Hide and remove on YouTube',
            message: 'This hides the comment on the website and asks YouTube to remove it from the video too. Continue?',
            confirmLabel: 'Hide & remove',
            danger: true,
        });
        if (yes) changeStatus(comment, 'Hidden', true);
    }

    async function remove(comment) {
        const isYouTube = comment.source === 'YouTube';
        const yes = await confirm({
            title: isYouTube ? 'Hide comment' : 'Delete comment',
            message: isYouTube
                ? 'YouTube comments are re-imported if deleted, so this hides it instead. Continue?'
                : 'This permanently deletes the comment. Continue?',
            confirmLabel: isYouTube ? 'Hide' : 'Delete',
            danger: true,
        });
        if (!yes) return;
        setBusyId(comment.id);
        try {
            const result = await apiClient.deleteComment(comment.id);
            notify('success', result?.message || 'Done.');
            await load();
        } catch (error) {
            notify('error', error.message || 'Could not delete the comment.');
        } finally {
            setBusyId(null);
        }
    }

    if (loading && comments.length === 0) return <LoadingSpinner message="Loading comments" />;

    return (
        <div className={styles.container}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.header}>
                <h1>Comments</h1>
                <p>Moderate comments from the website and YouTube. Comments with links wait here for review.</p>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.tabs} role="tablist" aria-label="Comment status">
                    {TABS.map((tab) => (
                        <button key={tab.key || 'all'} type="button" role="tab" aria-selected={status === tab.key}
                            className={`${styles.tab} ${status === tab.key ? styles.tabActive : ''}`}
                            onClick={() => setStatus(tab.key)}>
                            {tab.label}
                            {tab.key === 'Pending' && counts.pending > 0 ? ` (${counts.pending})` : ''}
                        </button>
                    ))}
                </div>
                <select className={styles.select} value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source">
                    <option value="">All sources</option>
                    <option value="Website">Website</option>
                    <option value="YouTube">YouTube</option>
                </select>
            </div>

            {loadError ? (
                <div className={styles.empty}>
                    <p>Could not load comments. <button type="button" className={styles.link} style={{ background: 'none', border: 0, cursor: 'pointer' }} onClick={load}>Try again</button></p>
                </div>
            ) : comments.length === 0 ? (
                <div className={styles.empty}>
                    <p>{status === 'Pending' ? 'Nothing is waiting for review.' : 'No comments found.'}</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {comments.map((c) => {
                        const busy = busyId === c.id;
                        return (
                            <article key={c.id} className={styles.card}>
                                <div className={styles.meta}>
                                    <span className={styles.author}>{c.authorName}</span>
                                    <span className={`${styles.badge} ${c.source === 'YouTube' ? styles.youtube : styles.website}`}>{c.source}</span>
                                    <span className={`${styles.badge} ${styles[c.status.toLowerCase()]}`}>{c.status}</span>
                                    <span>{formatWhen(c.postedAt)}</span>
                                    <a className={styles.link} href={`https://www.youtube.com/watch?v=${c.videoId}`} target="_blank" rel="noopener noreferrer">
                                        View video ↗
                                    </a>
                                </div>
                                <p className={styles.text}>{c.text}</p>
                                {c.moderatedBy && (
                                    <div className={styles.meta}>Last changed by {c.moderatedBy}{c.moderatedAt ? `, ${formatWhen(c.moderatedAt)}` : ''}</div>
                                )}
                                <div className={styles.actions}>
                                    {c.status !== 'Approved' && (
                                        <button type="button" className={`${styles.btn} ${styles.approve}`} disabled={busy}
                                            onClick={() => changeStatus(c, 'Approved')}>Approve</button>
                                    )}
                                    {c.status !== 'Hidden' && (
                                        <button type="button" className={styles.btn} disabled={busy}
                                            onClick={() => changeStatus(c, 'Hidden')}>Hide</button>
                                    )}
                                    {c.source === 'YouTube' && c.status !== 'Hidden' && (
                                        <button type="button" className={`${styles.btn} ${styles.danger}`} disabled={busy}
                                            onClick={() => hideOnYouTubeToo(c)}>Hide &amp; remove on YouTube</button>
                                    )}
                                    <button type="button" className={`${styles.btn} ${styles.danger}`} disabled={busy}
                                        onClick={() => remove(c)}>{c.source === 'YouTube' ? 'Remove' : 'Delete'}</button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
