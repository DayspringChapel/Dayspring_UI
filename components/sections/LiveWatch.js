'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { activeLiveStreams, liveEmbedUrl, liveYouTubeVideoId } from '@/lib/livePlayer';
import LivestreamShare from '@/components/LivestreamShare';
import LiveCommunity from './LiveCommunity';
import LivePlayer from './LivePlayer';
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
            if (mounted.current && request.current === controller) { setSettings(value); setError(''); window.dispatchEvent(new CustomEvent('dayspring:live-status', { detail: activeLiveStreams(value).length > 0 })); }
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
            <header className={styles.heading}><div><p className={styles.eyebrow}>DAYSPRING CHAPEL · WATCH TOGETHER</p><h1>Watch live</h1><p>Join our services</p></div><span className={stream ? styles.live : styles.badge}>{stream ? '● LIVE NOW' : settings ? 'BROADCAST STATUS' : error ? 'STATUS UNAVAILABLE' : 'CONNECTING'}</span></header>
            {error && <p className={styles.error} role="alert">{error} {stream && 'The player is showing the last received broadcast.'} <button type="button" disabled={busy} onClick={refresh}>{busy ? 'Checking…' : 'Try again'}</button></p>}
            <article className={styles.card} aria-label="Livestream player">
                {streams.length > 1 && <div className={styles.platforms} aria-label="Watch on a platform">{streams.map(item => <button type="button" key={item.platform} aria-pressed={stream.platform === item.platform} onClick={() => setSelected(item.platform)}>{item.label}</button>)}</div>}
                {stream ? <>
                    <LivePlayer key={`${stream.platform}:${stream.url}`} stream={stream} embed={embed}/>
                </> : <div className={styles.empty} role="status"><span className={styles.symbol}>▶</span><h2>{settings ? 'We’re not broadcasting right now' : error ? 'Unable to check the broadcast' : 'Checking for a live broadcast…'}</h2><p>{settings ? 'Join us here for our next service.' : error ? 'Please try again when your connection is restored.' : 'Connecting to the latest livestream status.'}</p><Link className={styles.primary} href="/library">Explore sermons</Link></div>}
            </article>
            {videoId && <LiveCommunity key={videoId} videoId={videoId} watchUrl={stream.url} />}
            <div className={styles.shareCard}><h2>Invite someone to watch</h2><p>Share the watch link while the service is live. No Dayspring sign-in is needed to open this page.</p><LivestreamShare active={!!stream && !error} showPageLink={false} /></div>
        </div>
    </section>;
}
