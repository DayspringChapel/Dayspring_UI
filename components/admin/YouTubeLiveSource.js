'use client';
import { useEffect, useState } from 'react';
import styles from './LivestreamWorkspace.module.css';

const STATES = {
    Live: 'YouTube is live. The website will show the detected broadcast.',
    Offline: 'No public YouTube broadcast is live right now.',
    NotConfigured: 'The church’s YouTube authorization needs to be configured before automatic detection can work.',
    Unavailable: 'YouTube could not be checked. Try again shortly, or save a manual link.',
    Manual: 'Manual link mode is saved. Activate the YouTube link below and save settings.',
    NotChecked: 'Automatic detection requires the updated backend. Saved manual settings are currently being used.',
};

export default function YouTubeLiveSource({ automatic, onChange, onStatus, refreshKey = 0 }) {
    const [result, setResult] = useState(null);
    const [revision, setRevision] = useState(0);
    const [checking, setChecking] = useState(false);
    const [refreshedAt, setRefreshedAt] = useState(null);
    useEffect(() => {
        const controller = new AbortController();
        let inFlight = false;
        const check = async (fresh = false) => {
            if (inFlight) return;
            inFlight = true;
            setChecking(true);
            try {
                const response = await fetch(fresh ? '/api/livestream/refresh' : '/api/livestream', { method: fresh ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
                if (!response.ok) {
                    const failure = await response.json().catch(() => ({}));
                    throw new Error(failure.message || 'Unable to refresh live status. Please try again.');
                }
                const value = await response.json();
                if (!controller.signal.aborted) {
                    const next = { automatic: value.youTubeAutoDetect ?? true, state: value.youTubeDetectionState ?? 'NotChecked' };
                    setResult(next);
                    onStatus?.(next);
                    setRefreshedAt(new Date());
                }
            } catch (error) { if (!controller.signal.aborted) { const next = { state: 'Unavailable', error: error.message }; setResult(next); onStatus?.(next); } }
            finally { inFlight = false; if (!controller.signal.aborted) setChecking(false); }
        };
        check(revision > 0 || refreshKey > 0);
        const timer = setInterval(() => { if (document.visibilityState !== 'hidden') check(); }, 60000);
        return () => { clearInterval(timer); controller.abort(); };
    }, [revision, refreshKey, onStatus]);
    return <fieldset className={styles.source}>
        <legend>YouTube source</legend>
        <div className={styles.choices}>
            <label className={styles.choice}><input type="radio" name="youtube-source" checked={automatic} onChange={() => onChange(true)} aria-label="Automatically detect YouTube Live" /><span><strong>Automatic detection</strong><small>Follow the connected church channel. No new link is needed for each service.</small></span></label>
            <label className={styles.choice}><input type="radio" name="youtube-source" checked={!automatic} onChange={() => onChange(false)} aria-label="Add a YouTube live link" /><span><strong>Manual live link</strong><small>Choose a specific video and control when its link appears.</small></span></label>
        </div>
        <p>Save Settings to apply your source choice.</p>
        <div className={styles.status}>
            <p role="status" aria-live="polite">{checking ? 'Checking live status…' : result ? result.error || (result.automatic !== undefined && result.automatic !== automatic ? 'Your source choice has not been saved. Select Save Settings to apply it.' : STATES[result.state] || STATES.Unavailable) : 'Live status has not been checked.'}</p>
            {refreshedAt && !checking && !result?.error && <p className={styles.timestamp}>Last refreshed: <time dateTime={refreshedAt.toISOString()}>{refreshedAt.toLocaleTimeString()}</time></p>}
        </div>
        <button type="button" disabled={checking} aria-busy={checking} onClick={() => setRevision(value => value + 1)}>{checking ? 'Checking…' : 'Refresh live status'}</button>
    </fieldset>;
}
