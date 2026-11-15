'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LIVE_PAGE_URL } from '@/lib/livePlayer';
import styles from './LivestreamShare.module.css';
import useLiveStatus, { readLiveStatus } from '@/lib/useLiveStatus';

export default function LivestreamShare({ active, showPageLink = true }) {
    const [status, setStatus] = useState('');
    const detected = useLiveStatus();
    const live = detected && active !== false;
    const [busy, setBusy] = useState(false);
    async function share() {
        if (!live || busy) return;
        setBusy(true); setStatus('');
        const data = { title: 'Watch live | DaySpring Chapel', text: 'Join us for worship at DaySpring Chapel.', url: LIVE_PAGE_URL };
        try {
            if (!await readLiveStatus()) { setStatus('Sharing is available when a broadcast is live.'); return; }
            if (navigator.share) { await navigator.share(data); setStatus('Livestream link shared.'); }
            else { await navigator.clipboard.writeText(LIVE_PAGE_URL); setStatus('Livestream link copied.'); }
        } catch (error) { if (error.name !== 'AbortError') setStatus('Select the link below to copy it.'); }
        finally { setBusy(false); }
    }
    return <div className={styles.share}>
        <div className={styles.actions}>{showPageLink && <Link href="/live">Open livestream page ↗</Link>}<button type="button" disabled={!live || busy} onClick={share}>{busy ? 'Checking broadcast…' : 'Share livestream'}</button></div>
        <label>Shareable watch link<input type="url" readOnly disabled={!live} value={live ? LIVE_PAGE_URL : ''} placeholder="Available during a live broadcast" onFocus={event => { if (live) event.target.select(); }} /></label>
        <span role="status">{live ? status : 'Sharing becomes available when we are live.'}</span>
    </div>;
}
