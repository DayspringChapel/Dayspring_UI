'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LIVE_PAGE_URL } from '@/lib/livePlayer';
import styles from './LivestreamShare.module.css';

export default function LivestreamShare() {
    const [status, setStatus] = useState('');
    async function share() {
        const data = { title: 'Watch live | DaySpring Chapel', text: 'Join us for worship at DaySpring Chapel.', url: LIVE_PAGE_URL };
        try {
            if (navigator.share) { await navigator.share(data); setStatus('Livestream link shared.'); }
            else { await navigator.clipboard.writeText(LIVE_PAGE_URL); setStatus('Livestream link copied.'); }
        } catch (error) { if (error.name !== 'AbortError') setStatus('Select the link below to copy it.'); }
    }
    return <div className={styles.share}>
        <div className={styles.actions}><Link href="/live">Open livestream page ↗</Link><button type="button" onClick={share}>Share livestream</button></div>
        <label>Shareable watch link<input type="url" readOnly value={LIVE_PAGE_URL} onFocus={event => event.target.select()} /></label>
        <span role="status">{status}</span>
    </div>;
}
