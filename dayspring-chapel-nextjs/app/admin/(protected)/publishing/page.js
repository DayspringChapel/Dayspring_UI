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

    useEffect(() => {
        const load = async () => {
            const [sched, pub, ready] = await Promise.allSettled([
                apiClient.getAllScheduledPosts(),
                apiClient.getAllPublishedPosts(),
                apiClient.getMediaContentsByStatus(7),
            ]);
            if (sched.status  === 'fulfilled') setScheduledPosts(sched.value  || []);
            if (pub.status    === 'fulfilled') setPublishedPosts(pub.value    || []);
            if (ready.status  === 'fulfilled') setReadyContents(ready.value  || []);
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

    const TABS = [
        { id: 'scheduled', label: `Scheduled (${scheduledPosts.length})` },
        { id: 'published', label: `Published (${publishedPosts.length})` },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1>Publishing</h1>
                    <p>Schedule and track content publishing across platforms</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
                    + Schedule Post
                </button>
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
