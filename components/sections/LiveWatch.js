'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { activeLiveStreams, liveEmbedUrl, liveYouTubeVideoId } from '@/lib/livePlayer';
import LivestreamShare from '@/components/LivestreamShare';
import LiveCommunity from './LiveCommunity';
import styles from './LiveWatch.module.css';

export default function LiveWatch() {
    const [settings, setSettings] = useState(null); const [error, setError] = useState('');
    const [selected, setSelected] = useState('youtube'); const [busy, setBusy] = useState(false); const [origin, setOrigin] = useState('');
    const request = useRef(null); const mounted = useRef(false);
    const refresh = useCallback(async () => {
        if (request.current) return;
        const controller = new AbortController(); request.current = controller;
        const timeout = setTimeout(() => controller.abort(), 15000);
        setBusy(true);
        try {
            const response = await fetch('/api/livestream', { cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw new Error('Live status is temporarily unavailable.');
            const value = await response.json();
            if (mounted.current && request.current === controller) { setSettings(value); setError(''); }
        } catch {
            if (mounted.current && request.current === controller) setError('We could not refresh the broadcast. Check your connection and try again.');
        } finally {
            clearTimeout(timeout); if (request.current === controller) { request.current = null; if (mounted.current) setBusy(false); }
        }
    }, []);
    useEffect(() => {
        mounted.current = true; setOrigin(window.location.origin);
        const visible = () => { if (document.visibilityState !== 'hidden') refresh(); };
        refresh(); const interval = setInterval(visible, 60000);
        window.addEventListener('focus', visible); window.addEventListener('online', visible); document.addEventListener('visibilitychange', visible);
        return () => { mounted.current = false; clearInterval(interval); request.current?.abort(); request.current = null; window.removeEventListener('focus', visible); window.removeEventListener('online', visible); document.removeEventListener('visibilitychange', visible); };
    }, [refresh]);
    const streams = activeLiveStreams(settings || {}), stream = streams.find(item => item.platform === selected) || streams[0];
    const embed = stream && liveEmbedUrl(stream, origin);
    const videoId = liveYouTubeVideoId(stream);
    return <section className={styles.page}>
        <div className={styles.inner}>
            <header className={styles.heading}><div><p className={styles.eyebrow}>DAYSPRING CHAPEL · WATCH TOGETHER</p><h1>Watch live</h1><p>Join our worship service wherever you are.</p></div><span className={stream ? styles.live : styles.badge}>{stream ? '● LIVE NOW' : settings ? 'BROADCAST STATUS' : error ? 'STATUS UNAVAILABLE' : 'CONNECTING'}</span></header>
            {error && <p className={styles.error} role="alert">{error} {stream && 'The player is showing the last received broadcast.'}</p>}
            <article className={styles.card} aria-label="Livestream player">
                {streams.length > 1 && <div className={styles.platforms} aria-label="Watch on a platform">{streams.map(item => <button type="button" key={item.platform} aria-pressed={stream.platform === item.platform} onClick={() => setSelected(item.platform)}>{item.label}</button>)}</div>}
                {stream ? <>
                    {embed ? <div className={styles.player}><iframe key={embed} src={embed} title={`${stream.label} Live Stream`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div> : <div className={styles.empty}><span className={styles.eyebrow}>{stream.label} LIVE</span><h2>Continue watching on {stream.label}</h2><p>{stream.platform === 'instagram' ? 'This platform opens its live player in its own app or website.' : 'This broadcast is available through its original player.'}</p><a className={styles.primary} href={stream.url} target="_blank" rel="noopener noreferrer">Watch live on {stream.label} ↗</a></div>}
                    <div className={styles.caption}><div><h2>{stream.label} live broadcast</h2>{stream.description && <p>{stream.description}</p>}</div><a href={stream.url} target="_blank" rel="noopener noreferrer">Open in {stream.label} ↗</a></div>
                </> : <div className={styles.empty} role="status"><span className={styles.symbol}>▶</span><h2>{settings ? 'We’re not broadcasting right now' : error ? 'Unable to check the broadcast' : 'Checking for a live broadcast…'}</h2><p>{settings ? 'Keep this page open. The player appears automatically when our next broadcast starts.' : error ? 'Use Refresh live status to try again.' : 'Connecting to the latest livestream status.'}</p><Link className={styles.primary} href="/library">Explore sermons</Link></div>}
            </article>
            <div className={styles.below}><p>The page updates automatically. If playback is restricted by the platform, use its direct watch link.</p><button type="button" disabled={busy} onClick={refresh}>{busy ? 'Checking…' : 'Refresh live status'}</button></div>
            {videoId && <LiveCommunity key={videoId} videoId={videoId} watchUrl={stream.url} />}
            <div className={styles.shareCard}><h2>Invite someone to watch</h2><p>Share this permanent link before or during the service. No Dayspring sign-in is needed to open this page.</p><LivestreamShare /></div>
        </div>
    </section>;
}
