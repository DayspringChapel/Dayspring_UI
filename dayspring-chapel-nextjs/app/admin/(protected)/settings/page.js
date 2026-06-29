'use client';

import { useState, useEffect } from 'react';

const PLATFORMS = [
    {
        id: 'youtube',
        label: 'YouTube',
        color: '#FF0000',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
            </svg>
        ),
        placeholder: 'https://youtube.com/watch?v=VIDEO_ID  or  https://youtu.be/VIDEO_ID',
        descPlaceholder: "e.g. We're live on YouTube! Join us for today's Sunday service.",
    },
    {
        id: 'facebook',
        label: 'Facebook',
        color: '#1877F2',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
            </svg>
        ),
        placeholder: 'https://facebook.com/video/live/...',
        descPlaceholder: "e.g. Watch us LIVE on Facebook! Click the link to join.",
    },
    {
        id: 'instagram',
        label: 'Instagram',
        color: '#E1306C',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
        placeholder: 'https://instagram.com/...',
        descPlaceholder: "e.g. We're going live on Instagram! Don't miss it.",
    },
];

const PUBLISH_TARGETS = [
    { id: 'facebook',  label: 'Facebook',   emoji: '🔵' },
    { id: 'twitter',   label: 'Twitter/X',  emoji: '𝕏' },
    { id: 'whatsapp',  label: 'WhatsApp',   emoji: '💚' },
    { id: 'instagram', label: 'Instagram',  emoji: '📸' },
];

const fieldStyle = (focused, color = '#F58634') => ({
    width: '100%', boxSizing: 'border-box',
    padding: '0.6rem 0.85rem',
    border: `1.5px solid ${focused ? color : 'rgba(15,23,42,0.14)'}`,
    borderRadius: '0.6rem',
    background: 'rgba(255,255,255,0.92)',
    color: '#0f172a', fontSize: '0.84rem',
    fontFamily: 'inherit', outline: 'none',
    boxShadow: focused ? `0 0 0 3px ${color}22` : 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
});

export default function SettingsPage() {
    const [config, setConfig] = useState({
        youtube:   { active: false, url: '', description: '' },
        facebook:  { active: false, url: '', description: '' },
        instagram: { active: false, url: '', description: '' },
    });
    const [imageUrl, setImageUrl]   = useState('');
    const [saving, setSaving]       = useState(false);
    const [status, setStatus]       = useState(null);

    const [targets, setTargets]         = useState({ facebook: true, twitter: true, whatsapp: false, instagram: false });
    const [posting, setPosting]         = useState(false);
    const [postResults, setPostResults] = useState(null);

    const [botInfo, setBotInfo]       = useState('');
    const [savingBot, setSavingBot]   = useState(false);
    const [botStatus, setBotStatus]   = useState(null);

    // Track which fields are focused for ring color
    const [focused, setFocused] = useState({});
    const onFocus = (key) => setFocused((p) => ({ ...p, [key]: true }));
    const onBlur  = (key) => setFocused((p) => ({ ...p, [key]: false }));

    useEffect(() => {
        fetch('/api/livestream')
            .then((r) => r.json())
            .then((d) => {
                setConfig({
                    youtube:   { active: false, url: '', description: '', ...d.youtube },
                    facebook:  { active: false, url: '', description: '', ...d.facebook },
                    instagram: { active: false, url: '', description: '', ...d.instagram },
                });
                setImageUrl(d.imageUrl || '');
            })
            .catch(() => {});
        fetch('/api/chatbot-config')
            .then((r) => r.json())
            .then((d) => setBotInfo(d.additionalInfo || ''))
            .catch(() => {});
    }, []);

    const update = (platform, field, value) =>
        setConfig((prev) => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));

    // Core computed values
    const anyUrlSet = PLATFORMS.some((p) => config[p.id]?.url?.trim());
    const anyLive   = PLATFORMS.some((p) => config[p.id]?.active && config[p.id]?.url?.trim());
    const anyTarget = Object.values(targets).some(Boolean);
    const anyDescriptionSet = PLATFORMS.some((p) => config[p.id]?.url?.trim() && config[p.id]?.description?.trim());

    const save = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const res = await fetch('/api/livestream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...config, imageUrl }),
            });
            if (!res.ok) throw new Error();
            setStatus('saved');
        } catch {
            setStatus('error');
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const postAnnouncement = async () => {
        if (!anyDescriptionSet || !anyTarget) return;
        setPosting(true);
        setPostResults(null);

        // Build per-platform descriptions
        const descriptions = {};
        PLATFORMS.forEach((p) => {
            if (config[p.id]?.description?.trim()) descriptions[p.id] = config[p.id].description.trim();
        });

        try {
            const res = await fetch('/api/announce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targets: Object.keys(targets).filter((k) => targets[k]), descriptions, imageUrl }),
            });
            const data = await res.json();
            setPostResults(data);
        } catch {
            setPostResults({ error: 'Network error' });
        } finally {
            setPosting(false);
        }
    };

    const saveBot = async () => {
        setSavingBot(true);
        setBotStatus(null);
        try {
            const res = await fetch('/api/chatbot-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ additionalInfo: botInfo }),
            });
            if (!res.ok) throw new Error();
            setBotStatus('saved');
        } catch {
            setBotStatus('error');
        } finally {
            setSavingBot(false);
            setTimeout(() => setBotStatus(null), 4000);
        }
    };

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#f1f5f9', margin: '0 0 0.3rem', letterSpacing: '-0.03em' }}>
                    Settings
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.9rem', margin: 0 }}>
                    Manage live stream configuration and site-wide settings.
                </p>
            </div>

            {/* ── Live Stream Card ───────────────────────────────────────── */}
            <div style={{
                background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.90)', borderRadius: '1.25rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.20)', padding: '1.75rem', marginBottom: '1.5rem',
            }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>📡</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>Live Stream</h2>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                            Toggle a platform live, paste the stream URL, then add a description.
                        </p>
                    </div>
                    {anyLive && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)',
                            borderRadius: '999px', padding: '0.25rem 0.75rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                                boxShadow: '0 0 6px #ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
                        </div>
                    )}
                </div>

                {/* Platform rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {PLATFORMS.map((p) => {
                        const val = config[p.id] || { active: false, url: '', description: '' };
                        const hasUrl = !!val.url?.trim();
                        return (
                            <div key={p.id} style={{
                                border: `1px solid ${val.active ? p.color + '44' : hasUrl ? p.color + '22' : 'rgba(15,23,42,0.10)'}`,
                                borderRadius: '0.875rem', padding: '1rem 1.25rem',
                                background: val.active ? p.color + '08' : hasUrl ? p.color + '04' : 'rgba(255,255,255,0.5)',
                                transition: 'all 0.2s ease',
                            }}>
                                {/* Header row — icon, label, toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                                    <span style={{ color: p.color, display: 'flex', flexShrink: 0 }}>{p.icon}</span>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', flex: 1 }}>{p.label}</span>
                                    {/* Toggle — requires URL */}
                                    <button
                                        onClick={() => hasUrl && update(p.id, 'active', !val.active)}
                                        title={!hasUrl ? 'Paste a stream URL below to enable the live toggle' : val.active ? 'Click to stop this stream' : 'Click to go live'}
                                        style={{
                                            width: 44, height: 24, borderRadius: 999, border: 'none',
                                            cursor: hasUrl ? 'pointer' : 'not-allowed',
                                            background: val.active ? p.color : hasUrl ? '#94a3b8' : '#e2e8f0',
                                            position: 'relative', transition: 'background 0.2s',
                                            flexShrink: 0, opacity: hasUrl ? 1 : 0.45,
                                        }}
                                        aria-label={val.active ? `Stop ${p.label} stream` : `Go live on ${p.label}`}
                                    >
                                        <span style={{
                                            position: 'absolute', top: 3,
                                            left: val.active ? 23 : 3, width: 18, height: 18,
                                            borderRadius: '50%', background: '#fff',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left 0.2s',
                                        }} />
                                    </button>
                                </div>

                                {/* URL input — always visible */}
                                <input
                                    type="url"
                                    value={val.url}
                                    onChange={(e) => update(p.id, 'url', e.target.value)}
                                    placeholder={p.placeholder}
                                    style={{ ...fieldStyle(focused[`${p.id}_url`], p.color), marginBottom: hasUrl ? '0.6rem' : 0 }}
                                    onFocus={() => onFocus(`${p.id}_url`)}
                                    onBlur={() => onBlur(`${p.id}_url`)}
                                />

                                {/* Description — appears once URL is set */}
                                {hasUrl && (
                                    <textarea
                                        rows={2}
                                        value={val.description}
                                        onChange={(e) => update(p.id, 'description', e.target.value)}
                                        placeholder={p.descPlaceholder}
                                        style={{
                                            ...fieldStyle(focused[`${p.id}_desc`], p.color),
                                            resize: 'vertical', lineHeight: 1.55,
                                        }}
                                        onFocus={() => onFocus(`${p.id}_desc`)}
                                        onBlur={() => onBlur(`${p.id}_desc`)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Announcement + publish section — only when any URL is set ── */}
                {anyUrlSet && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1rem' }}>📢</span>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                Publish Announcement
                            </p>
                        </div>

                        {/* Image URL */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                                Image URL <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Paste a publicly accessible image link for the announcement"
                                style={fieldStyle(focused['imageUrl'])}
                                onFocus={() => onFocus('imageUrl')}
                                onBlur={() => onBlur('imageUrl')}
                            />
                        </div>

                        {/* Image preview */}
                        {imageUrl && (
                            <img
                                src={imageUrl} alt="Announcement preview"
                                style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: '0.6rem',
                                    border: '1px solid rgba(15,23,42,0.10)', marginBottom: '0.75rem' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}

                        {/* Platform target toggles */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                                Publish to
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {PUBLISH_TARGETS.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTargets((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            padding: '0.42rem 0.9rem',
                                            borderRadius: '999px',
                                            border: targets[t.id] ? '1.5px solid #7c3aed' : '1.5px solid rgba(15,23,42,0.15)',
                                            background: targets[t.id] ? 'rgba(124,58,237,0.10)' : 'rgba(255,255,255,0.7)',
                                            color: targets[t.id] ? '#6d28d9' : '#64748b',
                                            fontWeight: targets[t.id] ? 700 : 500,
                                            fontSize: '0.8rem', cursor: 'pointer',
                                            transition: 'all 0.18s', fontFamily: 'inherit',
                                        }}
                                    >
                                        <span>{t.emoji}</span>
                                        {t.label}
                                        {targets[t.id] && <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Publish button + results */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={postAnnouncement}
                                disabled={posting || !anyDescriptionSet || !anyTarget}
                                style={{
                                    padding: '0.62rem 1.4rem', borderRadius: '0.65rem', border: 'none',
                                    background: (posting || !anyDescriptionSet || !anyTarget)
                                        ? '#e2e8f0'
                                        : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                                    color: (posting || !anyDescriptionSet || !anyTarget) ? '#94a3b8' : '#fff',
                                    fontWeight: 800, fontSize: '0.86rem', fontFamily: 'inherit',
                                    cursor: (posting || !anyDescriptionSet || !anyTarget) ? 'not-allowed' : 'pointer',
                                    boxShadow: (!posting && anyDescriptionSet && anyTarget) ? '0 4px 14px rgba(124,58,237,0.30)' : 'none',
                                    transition: 'all 0.18s',
                                }}
                                title={!anyDescriptionSet ? 'Add a description to at least one stream link first' : !anyTarget ? 'Select at least one platform' : undefined}
                            >
                                {posting ? 'Posting…' : '📢 Post Now'}
                            </button>

                            {(!anyDescriptionSet && anyUrlSet) && (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Add a description to a stream link above to enable posting
                                </span>
                            )}

                            {/* Per-platform results */}
                            {postResults && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {PUBLISH_TARGETS.map(({ id, label, emoji }) => {
                                        const r = postResults[id];
                                        if (!r) return null;
                                        if (r.skipped) return (
                                            <span key={id} style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {emoji} {label}: not configured
                                            </span>
                                        );
                                        if (r.success) return (
                                            <span key={id} style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {emoji} {label}: ✓ {id === 'whatsapp' ? `sent to ${r.sent}` : 'posted'}
                                                {id === 'whatsapp' && r.failed > 0 && ` (${r.failed} failed)`}
                                            </span>
                                        );
                                        return (
                                            <span key={id} style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {emoji} {label}: ✗ {r.error}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Save button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '1.25rem' }}>
                    <button
                        onClick={save}
                        disabled={saving || !anyUrlSet}
                        title={!anyUrlSet ? 'Add at least one stream URL before saving' : undefined}
                        style={{
                            padding: '0.68rem 1.75rem', borderRadius: '0.75rem', border: 'none',
                            background: (!saving && anyUrlSet) ? 'linear-gradient(135deg,#d9752c,#c26622)' : '#e2e8f0',
                            color: (!saving && anyUrlSet) ? '#fff' : '#94a3b8',
                            fontWeight: 800, fontSize: '0.9rem',
                            cursor: (saving || !anyUrlSet) ? 'not-allowed' : 'pointer',
                            boxShadow: (!saving && anyUrlSet) ? '0 4px 16px rgba(217,117,44,0.32)' : 'none',
                            fontFamily: 'inherit', transition: 'all 0.18s',
                        }}
                    >
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>

                    {!anyUrlSet && (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Add at least one stream URL to save
                        </span>
                    )}
                    {status === 'saved' && <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>✓ Saved</span>}
                    {status === 'error' && <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 700 }}>✗ Failed to save</span>}
                </div>
            </div>

            {/* ── Chatbot Knowledge Base Card ───────────────────────────── */}
            <div style={{
                background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.90)', borderRadius: '1.25rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.20)', padding: '1.75rem', marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>🤖</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                            Chatbot Knowledge Base
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                            Add extra info the assistant should know — service times, pastor names, contact details, etc.
                        </p>
                    </div>
                </div>

                <textarea
                    value={botInfo}
                    onChange={(e) => setBotInfo(e.target.value)}
                    rows={8}
                    placeholder={`Examples:\n- Sunday services: 7:00 AM and 9:30 AM\n- Lead Pastor: Pastor John Doe\n- WhatsApp: +234 800 000 0000`}
                    style={{
                        width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem',
                        border: `1.5px solid ${focused['botInfo'] ? '#F58634' : 'rgba(15,23,42,0.14)'}`,
                        borderRadius: '0.75rem', background: 'rgba(255,255,255,0.92)',
                        color: '#0f172a', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none',
                        lineHeight: 1.6, resize: 'vertical',
                        boxShadow: focused['botInfo'] ? '0 0 0 3px rgba(245,134,52,0.15)' : 'none',
                    }}
                    onFocus={() => onFocus('botInfo')}
                    onBlur={() => onBlur('botInfo')}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={saveBot}
                        disabled={savingBot}
                        style={{
                            padding: '0.68rem 1.75rem', borderRadius: '0.75rem', border: 'none',
                            background: 'linear-gradient(135deg,#d9752c,#c26622)',
                            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                            cursor: savingBot ? 'not-allowed' : 'pointer',
                            opacity: savingBot ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(217,117,44,0.32)', fontFamily: 'inherit',
                        }}
                    >
                        {savingBot ? 'Saving…' : 'Save Knowledge'}
                    </button>
                    {botStatus === 'saved' && <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>✓ Saved</span>}
                    {botStatus === 'error' && <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 700 }}>✗ Failed</span>}
                </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', textAlign: 'center' }}>
                Live stream settings are held in server memory and reset on server restart.
            </p>
        </div>
    );
}
