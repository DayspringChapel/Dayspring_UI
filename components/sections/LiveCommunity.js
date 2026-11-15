'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import CommentsPanel from '@/components/CommentsPanel';
import styles from './LiveCommunity.module.css';

const REACTIONS = [['like', '👍', 'Like'], ['heart', '❤️', 'Love'], ['amen', '🙏', 'Amen'], ['clap', '👏', 'Praise'], ['joy', '🙌', 'Joy']];
function snapshot(value) {
    if (!value || typeof value.counts !== 'object' || value.counts === null || !Array.isArray(value.mine)) throw new Error('Reactions are temporarily unavailable. Please try again.');
    return value;
}

export default function LiveCommunity({ videoId }) {
    const [data, setData] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
    const mounted = useRef(false); const pending = useRef(null); const writing = useRef(false);
    const read = useCallback(async () => {
        if (pending.current || writing.current) return;
        const controller = new AbortController(); pending.current = controller;
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(`/api/live-engagement/${videoId}`, { cache: 'no-store', signal: controller.signal });
            const value = await response.json(); if (!response.ok) throw new Error(value.message || 'Could not load reactions.');
            if (mounted.current && pending.current === controller) { setData(snapshot(value)); setError(''); }
        } catch (e) { if (mounted.current && pending.current === controller) setError(e.message || 'Could not load reactions.'); }
        finally { clearTimeout(timer); if (pending.current === controller) pending.current = null; }
    }, [videoId]);
    useEffect(() => {
        mounted.current = true; read();
        const visible = () => { if (!document.hidden) read(); }; const timer = setInterval(visible, 20000);
        window.addEventListener('focus', visible); window.addEventListener('online', visible);
        return () => { mounted.current = false; clearInterval(timer); pending.current?.abort(); pending.current = null; window.removeEventListener('focus', visible); window.removeEventListener('online', visible); };
    }, [read]);
    async function react(kind) {
        if (writing.current || !data) return;
        writing.current = true; setBusy(true); pending.current?.abort(); pending.current = null; setError('');
        try {
            const response = await fetch(`/api/live-engagement/${videoId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, active: !data.mine.includes(kind) }), signal: AbortSignal.timeout(15000) });
            const value = await response.json(); if (!response.ok) throw new Error(value.message || 'Your reaction could not be saved.');
            if (mounted.current) setData(snapshot(value));
        } catch (e) { if (mounted.current) setError(e.message || 'Your reaction could not be saved.'); }
        finally { writing.current = false; if (mounted.current) setBusy(false); }
    }
    return <section className={styles.community} aria-label="Live community">
        <div className={styles.reactionCard}><div className={styles.reactionHeader}><div><h2>Join the conversation</h2><p>Share a thought, an emoji or a reaction with everyone watching.</p></div></div>
            <div className={styles.reactions} aria-label="Live reactions">{REACTIONS.map(([kind, emoji, label]) => <button type="button" key={kind} disabled={!data || busy} aria-pressed={!!data?.mine?.includes(kind)} onClick={() => react(kind)}><span aria-hidden="true">{emoji}</span><span>{label}</span><strong>{data ? data.counts[kind] || 0 : '—'}</strong></button>)}</div>
            {error && <div className={styles.error} role="alert">{error} <button type="button" disabled={busy} onClick={read}>Refresh reactions</button></div>}
        </div>
        <div className={styles.comments}>{data || error ? <CommentsPanel key={videoId} videoId={videoId} live /> : <p>Loading the conversation…</p>}</div>
    </section>;
}
