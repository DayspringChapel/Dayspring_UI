'use client';
import { useEffect, useState } from 'react';

const STATES = {
    Live: 'YouTube is live. The website will show the detected broadcast.',
    Offline: 'No public YouTube broadcast is live right now.',
    NotConfigured: 'The church’s YouTube authorization needs to be configured before automatic detection can work.',
    Unavailable: 'YouTube could not be checked. Try again shortly, or save a manual link.',
    Manual: 'Manual link mode is saved. Activate the YouTube link below and save settings.',
    NotChecked: 'Automatic detection requires the updated backend. Saved manual settings are currently being used.',
};

export default function YouTubeLiveSource({ automatic, onChange }) {
    const [result, setResult] = useState(null);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        const check = async () => {
            try {
                const response = await fetch('/api/livestream', { cache: 'no-store', signal: controller.signal });
                if (!response.ok) throw new Error('Unavailable');
                const value = await response.json();
                setResult({ automatic: value.youTubeAutoDetect ?? true, state: value.youTubeDetectionState ?? 'NotChecked' });
            } catch { if (!controller.signal.aborted) setResult({ state: 'Unavailable' }); }
        };
        check();
        const timer = setInterval(() => { if (document.visibilityState !== 'hidden') check(); }, 60000);
        return () => { clearInterval(timer); controller.abort(); };
    }, [revision]);
    return <fieldset style={{ color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 12, padding: 16, margin: '0 0 20px', minWidth: 0 }}>
        <legend style={{ fontWeight: 800, padding: '0 6px' }}>YouTube source</legend>
        <label style={{ display: 'flex', gap: 8, alignItems: 'start', marginBottom: 10 }}><input type="radio" name="youtube-source" checked={automatic} onChange={() => onChange(true)} />Automatically detect YouTube Live</label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'start' }}><input type="radio" name="youtube-source" checked={!automatic} onChange={() => onChange(false)} />Add a YouTube live link</label>
        <p style={{ fontSize: 13, lineHeight: 1.6 }}>Automatic mode checks the connected church channel. Start your public broadcast normally in YouTube; no new link is needed here. Save Settings to apply your source choice.</p>
        <p role="status" style={{ fontSize: 13, lineHeight: 1.6 }}>{result ? result.automatic !== undefined && result.automatic !== automatic ? 'Your source choice has not been saved. Select Save Settings to apply it.' : STATES[result.state] || STATES.Unavailable : 'Checking live status…'}</p>
        <button type="button" onClick={() => setRevision(value => value + 1)} style={{ padding: '8px 12px', border: '1px solid #94a3b8', borderRadius: 8 }}>Refresh live status</button>
    </fieldset>;
}
