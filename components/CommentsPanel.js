'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';

const MAX_NAME = 50;
const MAX_TEXT = 500;
const PAGE_SIZE = 30;
const POLL_MS = 20000;
const NAME_KEY = 'dayspring_comment_name';

function timeAgo(iso) {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 45) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Avatar({ comment }) {
    if (comment.authorAvatarUrl) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={comment.authorAvatarUrl} alt="" width={36} height={36} referrerPolicy="no-referrer"
            className="rounded-full flex-shrink-0 bg-gray-200" style={{ width: 36, height: 36 }} />;
    }
    return (
        <div className="rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
            style={{ width: 36, height: 36, background: '#f58634', fontSize: '0.85rem' }}>
            {(comment.authorName || '?').trim().charAt(0).toUpperCase()}
        </div>
    );
}

/**
 * One comment feed for a YouTube video: comments written here and comments made on YouTube,
 * newest first. Website comments can be posted without an account; the team moderates them.
 */
export default function CommentsPanel({ videoId, live = false }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [notice, setNotice] = useState('');
    const [posting, setPosting] = useState(false);
    const mounted = useRef(true);
    const textInput = useRef(null);

    const load = useCallback(async () => {
        try {
            let data;
            if (live) { const response = await fetch(`/api/live-engagement/${videoId}/comments`, { cache: 'no-store', signal: AbortSignal.timeout(15000) }); if (!response.ok) throw new Error('Comments are unavailable.'); data = await response.json(); }
            else data = await apiClient.getVideoComments(videoId);
            if (!mounted.current) return;
            setComments(live ? data.filter(comment => comment.source !== 'YouTube') : data);
            setLoadError(false);
        } catch {
            if (mounted.current) setLoadError(true);
        } finally {
            if (mounted.current) setLoading(false);
        }
    }, [videoId, live]);

    useEffect(() => {
        mounted.current = true;
        try { setName(localStorage.getItem(NAME_KEY) || ''); } catch { /* storage unavailable */ }
        load();
        const timer = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
        return () => { mounted.current = false; clearInterval(timer); };
    }, [load]);

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');
        setNotice('');

        const errors = {};
        if (!name.trim()) errors.name = 'Please enter your name.';
        if (!text.trim()) errors.text = 'Please write a comment.';
        if (Object.keys(errors).length) { setFieldErrors(errors); return; }

        setFieldErrors({});
        setPosting(true);
        try {
            let result;
            if (live) {
                const response = await fetch(`/api/live-engagement/${videoId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), text: text.trim() }), signal: AbortSignal.timeout(15000) });
                result = await response.json(); if (!response.ok) throw new Error(result.message || 'Your comment could not be posted.');
            } else result = await apiClient.postVideoComment({ videoId, name: name.trim(), text: text.trim() });
            try { localStorage.setItem(NAME_KEY, name.trim()); } catch { /* ignore */ }
            setText('');
            setNotice(result?.message || 'Comment posted.');
            await load();
        } catch (error) {
            if (Array.isArray(error.fieldErrors) && error.fieldErrors.length) {
                const map = { name: 'name', text: 'text' };
                const mapped = {};
                error.fieldErrors.forEach(({ field, errors: messages }) => {
                    const key = map[field?.toLowerCase()];
                    if (key && messages?.length) mapped[key] = messages[0];
                });
                setFieldErrors(mapped);
                if (!Object.keys(mapped).length) setFormError('Please check your comment and try again.');
            } else {
                setFormError(error.message || 'We could not post your comment. Please try again.');
            }
        } finally {
            setPosting(false);
        }
    }

    const shown = comments.slice(0, visibleCount);
    function addEmoji(emoji) {
        const start = textInput.current?.selectionStart ?? text.length;
        const end = textInput.current?.selectionEnd ?? text.length;
        const next = text.slice(0, start) + emoji + text.slice(end);
        if (next.length > MAX_TEXT) return;
        setText(next);
        requestAnimationFrame(() => { textInput.current?.focus(); textInput.current?.setSelectionRange(start + emoji.length, start + emoji.length); });
    }
    const inputClass = (hasError) =>
        `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`;

    return (
        <section className="bg-white rounded-2xl shadow-sm p-5 md:p-7" aria-labelledby="comments-heading">
            <div className="flex items-center justify-between gap-3 mb-5">
                <h2 id="comments-heading" className="text-lg font-black text-gray-900">
                    {live ? 'Dayspring comments' : 'Comments'}{!loading && comments.length > 0 ? ` (${comments.length})` : ''}
                </h2>
                <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline">
                    Open on YouTube ↗
                </a>
            </div>

            {live && <p className="text-sm text-gray-600 mb-4">Comments here are shared on Dayspring and moderated by the media team. Use the YouTube chat to post on YouTube.</p>}
            <form onSubmit={handleSubmit} noValidate className="space-y-3 mb-6">
                <div>
                    <label htmlFor="comment-name" className="block text-sm font-semibold text-gray-700 mb-1">Your name</label>
                    <input id="comment-name" type="text" value={name} maxLength={MAX_NAME}
                        onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: '' })); }}
                        className={inputClass(fieldErrors.name)} placeholder="Your name" autoComplete="name" />
                    {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="comment-text" className="block text-sm font-semibold text-gray-700">Add a comment</label>
                        <span className="text-xs font-medium text-gray-400">{text.length}/{MAX_TEXT}</span>
                    </div>
                    <textarea ref={textInput} id="comment-text" rows={3} value={text} maxLength={MAX_TEXT}
                        onChange={(e) => { setText(e.target.value); setFieldErrors((p) => ({ ...p, text: '' })); }}
                        className={inputClass(fieldErrors.text)} placeholder="Share a thought or a blessing…" />
                    {live && <div className="flex flex-wrap gap-2 mt-2" aria-label="Comment emojis">{[['🙏', 'Prayer'], ['❤️', 'Heart'], ['👏', 'Applause'], ['🙌', 'Praise'], ['😊', 'Smile']].map(([emoji, label]) => <button type="button" key={label} aria-label={`Add ${label.toLowerCase()} emoji`} onMouseDown={event => event.preventDefault()} onClick={() => addEmoji(emoji)} style={{ background: '#f8f8fc', color: '#172b43', borderColor: '#d6dce8', padding: '8px 12px' }}>{emoji}</button>)}</div>}
                    {fieldErrors.text && <p className="text-red-500 text-sm mt-1">{fieldErrors.text}</p>}
                </div>

                {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">{formError}</div>
                )}
                {notice && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm" role="status" aria-live="polite">{notice}</div>
                )}

                <button type="submit" disabled={posting}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {posting ? 'Posting…' : 'Post comment'}
                </button>
            </form>

            {loading ? (
                <p className="text-sm text-gray-500">Loading comments…</p>
            ) : loadError && comments.length === 0 ? (
                <div className="text-sm text-gray-600">
                    We couldn&apos;t load the comments right now.{' '}
                    <button type="button" onClick={load} className="font-semibold text-primary hover:underline">Try again</button>
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet. Be the first to share a thought.</p>
            ) : (
                <ul className="space-y-5">
                    {shown.map((c) => (
                        <li key={c.id} className="flex gap-3">
                            <Avatar comment={c} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span className="font-bold text-gray-900 text-sm">{c.authorName}</span>
                                    <span className="text-xs text-gray-400">{timeAgo(c.postedAt)}</span>
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
                                        style={c.source === 'YouTube'
                                            ? { background: '#fee2e2', color: '#b91c1c' }
                                            : { background: '#fff1e6', color: '#c2570c' }}>
                                        {c.source === 'YouTube' ? 'YouTube' : 'Website'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{c.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {comments.length > visibleCount && (
                <button type="button" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    className="mt-5 text-sm font-semibold text-primary hover:underline">
                    Show more comments
                </button>
            )}
        </section>
    );
}
