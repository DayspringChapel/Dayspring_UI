'use client';
import { useEffect, useState } from 'react';
import { activeLiveStreams } from './livePlayer.js';
let pending;
export function readLiveStatus() {
    if (!pending) pending = fetch('/api/livestream', { cache: 'no-store', signal: AbortSignal.timeout(15000) })
        .then(async response => response.ok && activeLiveStreams(await response.json()).length > 0)
        .catch(() => false).then(live => { window.dispatchEvent(new CustomEvent('dayspring:live-status', { detail: live })); return live; }).finally(() => { pending = null; });
    return pending;
}
export default function useLiveStatus(enabled = true) {
    const [live, setLive] = useState(false);
    useEffect(() => {
        if (!enabled) return;
        let active = true;
        const sync = event => { if (active) setLive(event.detail === true); };
        const refresh = () => { if (!document.hidden) readLiveStatus().then(value => { if (active) setLive(value); }); };
        refresh(); const timer = setInterval(refresh, 60000);
        window.addEventListener('dayspring:live-status', sync); window.addEventListener('focus', refresh); window.addEventListener('online', refresh); document.addEventListener('visibilitychange', refresh);
        return () => { active = false; clearInterval(timer); window.removeEventListener('dayspring:live-status', sync); window.removeEventListener('focus', refresh); window.removeEventListener('online', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, [enabled]);
    return live;
}
