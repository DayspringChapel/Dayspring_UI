'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './publishing.module.css';

const PLATFORMS = [
    { value: 1, label: 'Facebook' },
    { value: 2, label: 'Instagram' },
    { value: 3, label: 'X (Twitter)' },
    { value: 4, label: 'YouTube' },
    { value: 5, label: 'WhatsApp' },
    { value: 6, label: 'Church Website' },
];

const STREAM_PLATFORM_META = {
    youtube:   { label: 'YouTube',   color: '#FF0000', emoji: '▶' },
    facebook:  { label: 'Facebook',  color: '#1877F2', emoji: '🔵' },
    instagram: { label: 'Instagram', color: '#E1306C', emoji: '📸' },
};

const ANNOUNCE_TARGETS = [
    { id: 'facebook',  label: 'Facebook',  emoji: '🔵' },
    { id: 'twitter',   label: 'Twitter/X', emoji: '𝕏'  },
    { id: 'whatsapp',  label: 'WhatsApp',  emoji: '💚' },
    { id: 'instagram', label: 'Instagram', emoji: '📸' },
];

const POST_STATUS = {
    0: { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700' },
    1: { label: 'Published', cls: 'bg-green-100 text-green-700' },
    2: { label: 'Failed',    cls: 'bg-red-100 text-red-700' },
    3: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600' },
    4: { label: 'Retrying',  cls: 'bg-blue-100 text-blue-700' },
};

const EMPTY_FORM = { contentId: '', platforms: [], scheduledAt: '', caption: '' };

export default function PublishingPage() {
    const [activeTab, setActiveTab] = useState('scheduled');
    const [scheduledPosts, setScheduledPosts] = useState([]);
    const [publishedPosts, setPublishedPosts] = useState([]);
    const [readyContents, setReadyContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    // Live streams state
    const [streams, setStreams]           = useState(null);
    const [streamTargets, setStreamTargets] = useState({ facebook: true, twitter: true, whatsapp: false, instagram: false });
    const [streamPosting, setStreamPosting] = useState(null); // platform key being posted
    const [streamPostResults, setStreamPostResults] = useState({});

    useEffect(() => {
        const load = async () => {
            const [sched, pub, ready, streamRes] = await Promise.allSettled([
                apiClient.getAllScheduledPosts(),
                apiClient.getAllPublishedPosts(),
                apiClient.getMediaContentsByStatus(7),
                fetch('/api/livestream').then((r) => r.json()),
            ]);
            if (sched.status     === 'fulfilled') setScheduledPosts(sched.value     || []);
            if (pub.status       === 'fulfilled') setPublishedPosts(pub.value       || []);
            if (ready.status     === 'fulfilled') setReadyContents(ready.value      || []);
            if (streamRes.status === 'fulfilled') setStreams(streamRes.value);
            setLoading(false);
        };
        load();
    }, []);

    const handleCancel = async (postId) => {
        if (!confirm('Cancel this scheduled post?')) return;
        try {
            await apiClient.cancelScheduledPost(postId);
            setScheduledPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err) { alert(err.message); }
    };

    const handleRetry = async (postId) => {
        try {
            await apiClient.retryPublish(postId);
        } catch (err) { alert(err.message); }
    };

    const togglePlatform = (val) => {
        setForm((prev) => ({
            ...prev,
            platforms: prev.platforms.includes(val)
                ? prev.platforms.filter((p) => p !== val)
                : [...prev.platforms, val],
        }));
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!form.contentId || form.platforms.length === 0 || !form.scheduledAt) {
            alert('Select content, at least one platform, and a date/time.');
            return;
        }
        setSubmitting(true);
        try {
            await apiClient.schedulePublish(
                form.contentId,
                form.platforms,
                new Date(form.scheduledAt).toISOString(),
                form.caption,
            );
            const updated = await apiClient.getAllScheduledPosts();
            setScheduledPosts(updated || []);
            setShowForm(false);
            setForm(EMPTY_FORM);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const liveStreamItems = streams
        ? ['youtube', 'facebook', 'instagram'].filter((k) => streams[k]?.url?.trim())
        : [];

    const handleStreamPost = async (platformKey) => {
        if (!Object.values(streamTargets).some(Boolean)) {
            alert('Select at least one announcement target.');
            return;
        }
        setStreamPosting(platformKey);
        const p = streams[platformKey];
        try {
            const res = await fetch('/api/announce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targets:      Object.keys(streamTargets).filter((k) => streamTargets[k]),
                    descriptions: { [platformKey]: p.description },
                    imageUrl:     streams.imageUrl || '',
                }),
            });
            const data = await res.json();
            setStreamPostResults((prev) => ({ ...prev, [platformKey]: data }));
        } catch {
            setStreamPostResults((prev) => ({ ...prev, [platformKey]: { error: 'Network error' } }));
        } finally {
            setStreamPosting(null);
        }
    };

    const TABS = [
        { id: 'scheduled',    label: `Scheduled (${scheduledPosts.length})` },
        { id: 'published',    label: `Published (${publishedPosts.length})` },
        { id: 'live-streams', label: `Live Streams${liveStreamItems.length ? ` (${liveStreamItems.length})` : ''}` },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1>Publishing</h1>
                    <p>Schedule and track content publishing across platforms</p>
                </div>
                {activeTab !== 'live-streams' && (
                    <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
                        + Schedule Post
                    </button>
                )}
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

            {!loading && activeTab === 'scheduled' && (
                scheduledPosts.length === 0
                    ? <div className={styles.empty}>No scheduled posts yet</div>
                    : <div className={styles.list}>
                        {scheduledPosts.map((post) => {
                            const s = POST_STATUS[post.status] || { label: 'Unknown', cls: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={post.id} className={styles.row}>
                                    <div className={styles.rowInfo}>
                                        <h3>{post.contentTitle}</h3>
                                        <p>{post.platformName} · {new Date(post.scheduledAt).toLocaleString()}</p>
                                        {post.caption && <small>{post.caption}</small>}
                                        {post.errorMessage && <small className={styles.errorMsg}>{post.errorMessage}</small>}
                                    </div>
                                    <div className={styles.rowActions}>
                                        <span className={`${styles.badge} ${s.cls}`}>{s.label}</span>
                                        {post.status === 2 && (
                                            <button className={styles.btnRetry} onClick={() => handleRetry(post.id)}>
                                                Retry
                                            </button>
                                        )}
                                        {(post.status === 0 || post.status === 4) && (
                                            <button className={styles.btnCancel} onClick={() => handleCancel(post.id)}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
            )}

            {!loading && activeTab === 'published' && (
                publishedPosts.length === 0
                    ? <div className={styles.empty}>No published posts yet</div>
                    : <div className={styles.list}>
                        {publishedPosts.map((post) => {
                            const s = POST_STATUS[post.status] || { label: 'Unknown', cls: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={post.id} className={styles.row}>
                                    <div className={styles.rowInfo}>
                                        <h3>{post.contentTitle}</h3>
                                        <p>
                                            {post.platformName} · {new Date(post.publishedAt).toLocaleString()} · by {post.publishedByName}
                                        </p>
                                        {post.platformPostUrl && (
                                            <a
                                                href={post.platformPostUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.linkExternal}
                                            >
                                                View post →
                                            </a>
                                        )}
                                    </div>
                                    <div className={styles.rowActions}>
                                        <span className={`${styles.badge} ${s.cls}`}>{s.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
            )}

            {/* Live Streams tab */}
            {!loading && activeTab === 'live-streams' && (
                <div>
                    {liveStreamItems.length === 0 ? (
                        <div className={styles.empty}>
                            No stream links configured. Go to Settings → Live Stream to add one.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                            {/* Announce target selector */}
                            <div style={{
                                background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255,255,255,0.85)', borderRadius: '1rem',
                                padding: '1.25rem 1.5rem',
                            }}>
                                <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                                    📢 Announce each stream to:
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {ANNOUNCE_TARGETS.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setStreamTargets((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                padding: '0.38rem 0.85rem', borderRadius: '999px',
                                                border: streamTargets[t.id] ? '1.5px solid #7c3aed' : '1.5px solid rgba(15,23,42,0.15)',
                                                background: streamTargets[t.id] ? 'rgba(124,58,237,0.10)' : 'rgba(255,255,255,0.7)',
                                                color: streamTargets[t.id] ? '#6d28d9' : '#64748b',
                                                fontWeight: streamTargets[t.id] ? 700 : 500,
                                                fontSize: '0.78rem', cursor: 'pointer',
                                                fontFamily: 'inherit', transition: 'all 0.15s',
                                            }}
                                        >
                                            {t.emoji} {t.label}
                                            {streamTargets[t.id] && <span style={{ fontSize: '0.68rem' }}>✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stream items */}
                            {liveStreamItems.map((key) => {
                                const p    = streams[key];
                                const meta = STREAM_PLATFORM_META[key];
                                const res  = streamPostResults[key];
                                return (
                                    <div key={key} style={{
                                        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)',
                                        border: `1px solid ${meta.color}33`, borderRadius: '1rem',
                                        padding: '1.25rem 1.5rem',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                            <span style={{ color: meta.color, fontSize: '1.1rem' }}>{meta.emoji}</span>
                                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{meta.label}</span>
                                            {p.active && (
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                    background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
                                                    borderRadius: '999px', padding: '0.18rem 0.6rem',
                                                    fontSize: '0.7rem', fontWeight: 800, color: '#dc2626',
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                                                    LIVE
                                                </span>
                                            )}
                                        </div>

                                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                                            style={{ fontSize: '0.78rem', color: meta.color, wordBreak: 'break-all', display: 'block', marginBottom: '0.6rem' }}>
                                            {p.url}
                                        </a>

                                        {p.description ? (
                                            <p style={{ margin: '0 0 0.85rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.55 }}>
                                                {p.description}
                                            </p>
                                        ) : (
                                            <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                No description set — add one in Settings to enable announcing.
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleStreamPost(key)}
                                                disabled={streamPosting === key || !p.description?.trim()}
                                                title={!p.description?.trim() ? 'Add a description in Settings first' : undefined}
                                                style={{
                                                    padding: '0.45rem 1.1rem', borderRadius: '0.55rem', border: 'none',
                                                    background: (streamPosting === key || !p.description?.trim())
                                                        ? '#e2e8f0'
                                                        : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                                                    color: (streamPosting === key || !p.description?.trim()) ? '#94a3b8' : '#fff',
                                                    fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
                                                    cursor: (streamPosting === key || !p.description?.trim()) ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {streamPosting === key ? 'Posting…' : '📢 Announce'}
                                            </button>

                                            {/* Result display */}
                                            {res && (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {ANNOUNCE_TARGETS.map(({ id, label, emoji }) => {
                                                        const r = res[id];
                                                        if (!r) return null;
                                                        if (r.skipped) return (
                                                            <span key={id} style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                                {emoji} {label}: not configured
                                                            </span>
                                                        );
                                                        if (r.success) return (
                                                            <span key={id} style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                                                {emoji} {label}: ✓{id === 'whatsapp' ? ` sent to ${r.sent}` : ''}
                                                            </span>
                                                        );
                                                        return (
                                                            <span key={id} style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>
                                                                {emoji} {label}: ✗ {r.error}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Schedule modal */}
            {showForm && (
                <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className={styles.modal}>
                        <h2>Schedule a Post</h2>
                        <form onSubmit={handleSchedule}>
                            <div className={styles.formGroup}>
                                <label>Content *</label>
                                <select
                                    value={form.contentId}
                                    onChange={(e) => setForm((p) => ({ ...p, contentId: e.target.value }))}
                                    required
                                >
                                    <option value="">Select ready-to-publish content…</option>
                                    {readyContents.map((c) => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Platforms *</label>
                                <div className={styles.platformChips}>
                                    {PLATFORMS.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => togglePlatform(p.value)}
                                            className={`${styles.platformChip} ${form.platforms.includes(p.value) ? styles.platformChipActive : ''}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Date &amp; Time *</label>
                                <input
                                    type="datetime-local"
                                    value={form.scheduledAt}
                                    onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Caption</label>
                                <textarea
                                    rows={2}
                                    value={form.caption}
                                    onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                                    placeholder="Optional caption for the post…"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnModalCancel} onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnModalSubmit} disabled={submitting}>
                                    {submitting ? 'Scheduling…' : 'Schedule Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
