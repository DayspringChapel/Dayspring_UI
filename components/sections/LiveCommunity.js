'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import CommentsPanel from '@/components/CommentsPanel';
import styles from './LiveCommunity.module.css';

const REACTIONS = [['like', '👍', 'Like'], ['heart', '❤️', 'Love'], ['amen', '🙏', 'Amen'], ['clap', '👏', 'Praise'], ['joy', '🙌', 'Joy']];
function subscribeDesktop(callback) { const query = window.matchMedia('(min-width: 900px)'); query.addEventListener('change', callback); return () => query.removeEventListener('change', callback); }
const desktopSnapshot = () => window.matchMedia('(min-width: 900px)').matches;
const serverSnapshot = () => false;
function snapshot(value) {
    if (!value || typeof value.counts !== 'object' || value.counts === null || !Array.isArray(value.mine)) throw new Error('Reactions are temporarily unavailable. Please try again.');
    return value;
}

export default function LiveCommunity({ videoId, watchUrl }) {
    const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot);
    const [host, setHost] = useState(''); const [data, setData] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
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
        mounted.current = true; setHost(window.location.hostname); read();
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
    const chatUrl = host ? `https://www.youtube.com/live_chat?${new URLSearchParams({ v: videoId, embed_domain: host, dark_theme: '1' })}` : null;
    return <section className={styles.community} aria-label="Live community">
        <div className={styles.reactionCard}><div className={styles.reactionHeader}><div><h2>React with Dayspring</h2><p>Saved on this website. Tap again to remove your reaction.</p></div><a href={watchUrl} target="_blank" rel="noopener noreferrer">{data?.youTubeLikes != null ? `${Number(data.youTubeLikes).toLocaleString()} YouTube likes · ` : ''}Like on YouTube ↗</a></div>
            <div className={styles.reactions} aria-label="Dayspring reactions">{REACTIONS.map(([kind, emoji, label]) => <button type="button" key={kind} disabled={!data || busy} aria-pressed={!!data?.mine?.includes(kind)} onClick={() => react(kind)}><span aria-hidden="true">{emoji}</span><span>{label}</span><strong>{data ? data.counts[kind] || 0 : '—'}</strong></button>)}</div>
            {error && <div className={styles.error} role="alert">{error} <button type="button" disabled={busy} onClick={read}>Refresh reactions</button></div>}
        </div>
        <div className={styles.columns}><div className={styles.comments}><CommentsPanel videoId={videoId} live /></div>
            <aside className={styles.chat}><header><h2>YouTube live chat</h2><p>Join with your YouTube account. YouTube chat messages and emojis stay on YouTube.</p><a href={watchUrl} target="_blank" rel="noopener noreferrer">Open YouTube chat ↗</a></header>
                {desktop && chatUrl ? <iframe src={chatUrl} title="YouTube live chat" referrerPolicy="strict-origin-when-cross-origin" /> : <p className={styles.mobileNote}>YouTube’s embedded chat is available on desktop. On a phone, use the YouTube link above, or comment and react here with Dayspring.</p>}
            </aside>
        </div>
    </section>;
}
