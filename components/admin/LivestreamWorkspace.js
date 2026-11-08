'use client';
import { useCallback, useState } from 'react';
import YouTubeLiveSource from './YouTubeLiveSource';
import AdminConfirm, { useConfirm } from './AdminConfirm';
import styles from './LivestreamWorkspace.module.css';

export default function LivestreamWorkspace({ config, setAutomatic, update, createYouTube, stopYouTube, busy, error, encoder, platforms }) {
    const [tab, setTab] = useState('youtube');
    const [provider, setProvider] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [reveal, setReveal] = useState(false);
    const [copied, setCopied] = useState('');
    const { dialog, confirm, closeDialog } = useConfirm();
    const statusChanged = useCallback(value => setProvider(value), []);
    const live = provider?.state === 'Live';
    const managed = !!encoder || !!config.youTubeBroadcastCreated;
    const active = live || managed;
    async function stop() {
        if (!await confirm({ title: 'Stop YouTube broadcast?', message: 'This ends the current live broadcast on YouTube, or cancels a scheduled broadcast created here. Viewers will lose access to the live feed. This does not turn off future automatic detection.', confirmLabel: 'Stop broadcast', danger: true })) return;
        if (await stopYouTube()) { setRefreshKey(value => value + 1); setReveal(false); }
    }
    async function copy(label, value) {
        try { await navigator.clipboard.writeText(value); setCopied(`${label} copied.`); }
        catch { setCopied('Copy is unavailable. Select the field to copy it.'); }
    }
    function manualFields(platform) {
        const value = config[platform.id] || {};
        return <div className={styles.fields}>
            <label className={styles.field}>{platform.label} live link<input type="url" aria-label={`${platform.label} manual livestream URL`} value={value.url || ''} onChange={event => update(platform.id, 'url', event.target.value)} placeholder={platform.placeholder} /></label>
            <label className={styles.field}>Message for viewers<textarea rows={2} value={value.description || ''} onChange={event => update(platform.id, 'description', event.target.value)} placeholder={platform.descPlaceholder} /></label>
            <label className={styles.check}><input type="checkbox" disabled={!value.url?.trim()} checked={!!value.active} onChange={event => update(platform.id, 'active', event.target.checked)} aria-label={`Show ${platform.label} live link`} />Show this live link on the website</label>
            <p>Save Settings below to publish these changes. Turn this link off when the broadcast ends.</p>
        </div>;
    }
    return <section className={styles.workspace} aria-label="Livestream workspace">
        <header className={styles.heading}><div><p className={styles.eyebrow}>Broadcast workspace</p><h2>Live streaming</h2><p>Choose your source, manage YouTube broadcasts and control what visitors can watch.</p></div></header>
        <div className={styles.tabs} role="tablist" aria-label="Livestream sections">{[['youtube', 'YouTube'], ['obs', 'OBS · direct website'], ['links', 'Other live links']].map(([id, label]) => <button key={id} id={`stream-tab-${id}`} type="button" role="tab" aria-selected={tab === id} aria-controls={`stream-panel-${id}`} onClick={() => { setTab(id); setReveal(false); setCopied(''); }}>{label}</button>)}</div>
        <div role="tabpanel" id={`stream-panel-${tab}`} aria-labelledby={`stream-tab-${tab}`}>
            {tab === 'youtube' && <article className={styles.card}>
                <header className={styles.cardHeader}><div className={styles.platformTitle}><span className={styles.icon}>{platforms[0].icon}</span><h3>YouTube broadcast</h3></div><span className={`${styles.badge} ${live ? styles.live : ''}`}>{live ? 'LIVE' : managed ? 'Broadcast created' : 'Ready to connect'}</span></header>
                <YouTubeLiveSource automatic={config.youTubeAutoDetect} onChange={setAutomatic} onStatus={statusChanged} refreshKey={refreshKey} />
                {!config.youTubeAutoDetect && manualFields(platforms[0])}
                <div className={styles.divider}><h3>Broadcast controls</h3><p>Create a YouTube event here, or start one normally in YouTube. Camera video must reach YouTube before automatic mode shows it as live.</p><div className={styles.actions}>
                    <button type="button" className={styles.primary} disabled={busy || active} onClick={createYouTube}>{busy ? 'Working…' : 'Create a YouTube broadcast'}</button>
                    <button type="button" className={styles.danger} disabled={busy || !active} onClick={stop}>{busy ? 'Working…' : 'Stop / cancel YouTube broadcast'}</button>
                    <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer">Open YouTube Studio ↗</a>
                </div><p>Stop ends a live broadcast or cancels the scheduled event. To disable discovery without ending YouTube, choose the manual-link option and save.</p>{error && <p className={styles.error} role="alert">{error}</p>}</div>
                {encoder && <details className={styles.encoder}><summary>YouTube encoder connection</summary><p>For sending video to YouTube only. Keep the stream key private. This is separate from the future direct-website OBS service.</p>
                    <div className={styles.credential}><label className={styles.field}>YouTube server<input type="text" readOnly value={encoder.ingestionUrl} /></label><button type="button" onClick={() => copy('Server', encoder.ingestionUrl)}>Copy server</button></div>
                    <div className={styles.credential}><label className={styles.field}>YouTube stream key<input type={reveal ? 'text' : 'password'} readOnly value={encoder.streamKey} autoComplete="off" /></label><button type="button" aria-pressed={reveal} onClick={() => setReveal(value => !value)}>{reveal ? 'Hide key' : 'Reveal key'}</button><button type="button" onClick={() => copy('Stream key', encoder.streamKey)}>Copy key</button></div><p role="status">{copied}</p>
                </details>}
            </article>}
            {tab === 'obs' && <article className={styles.card}><header className={styles.cardHeader}><h3>OBS to the website</h3><span className={styles.badge}>Not configured</span></header><p>A dedicated route for OBS to broadcast directly to this website, independently of YouTube.</p><div className={styles.roadmap}><h3>What will connect here</h3><ol><li>A separate video host receives the OBS stream.</li><li>Dayspring provides a protected server address and stream key.</li><li>Visitors watch through the website player.</li><li>Optional social outputs can be added for future restreaming.</li></ol></div><p>This service needs its own streaming host. No independent OBS endpoint or stream key has been configured yet. The YouTube encoder settings remain in the YouTube section.</p></article>}
            {tab === 'links' && <><p>Add live links for other platforms. These are managed independently of YouTube automatic detection.</p>{platforms.slice(1).map(platform => <article className={styles.card} key={platform.id}><header className={styles.cardHeader}><h3>{platform.label}</h3><span className={styles.badge}>{config[platform.id]?.active ? 'Link enabled' : 'Not shown'}</span></header>{manualFields(platform)}</article>)}</>}
        </div>
        <AdminConfirm dialog={dialog} onClose={closeDialog} />
    </section>;
}
