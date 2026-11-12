'use client';
import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Management.module.css';
import VideoEmbed from '@/components/VideoEmbed';

export default function EventVideoEditor({ event, videos = [], onClose, onSaved }) {
    const [source, setSource] = useState('youtube');
    const [purpose, setPurpose] = useState(event.videoPurpose || 'Highlight');
    const [title, setTitle] = useState(''); const [inputVersion, setInputVersion] = useState(0);
    const [youtube, setYoutube] = useState(''); const [file, setFile] = useState(null);
    const [library, setLibrary] = useState([]); const [selected, setSelected] = useState('');
    const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    useEffect(() => {
        let active = true;
        if (source === 'library') apiClient.getMediaContents().then(items => { if (active) setLibrary(items.filter(item => Number(item.contentType) === 2 && Number(item.workflowStatus) !== 11)); }).catch(e => { if (active) setError(e.message); });
        return () => { active = false; };
    }, [source, event.id]);
    function changeSource(value) { setSource(value); setError(''); }
    async function save(e) {
        e.preventDefault(); if (pending.current) return;
        if (source === 'upload' && (!file || file.size > 100 * 1024 * 1024 || !/\.(mp4|webm|mov)$/i.test(file.name))) { setError('Choose an MP4, WebM or MOV video up to 100 MB.'); return; }
        pending.current = true; setBusy(true); setError('');
        try {
            const form = new FormData(); form.append('Title', title); form.append('Purpose', purpose);
            if (source === 'library') form.append('MediaContentId', selected);
            else if (source === 'youtube') form.append('YoutubeUrl', youtube.trim());
            else form.append('File', file);
            const result = await apiClient.upload(`/api/v1/event-programs/${event.id}/videos`, form, 'POST');
            await onSaved(result.message || 'Video attached to the event.');
            setTitle(''); setYoutube(''); setFile(null); setSelected(''); setInputVersion(value => value + 1);
        } catch (e) { setError(e.message); } finally { pending.current = false; setBusy(false); }
    }
    async function remove(video) {
        if (pending.current || !window.confirm(`Remove "${video.title}" from this event? The original library video is kept.`)) return;
        pending.current = true; setBusy(true); setError('');
        try { const result = await apiClient.request(`/api/v1/event-programs/${event.id}/videos/${video.id}`, { method: 'DELETE' }); await onSaved(result.message); }
        catch (e) { setError(e.message); } finally { pending.current = false; setBusy(false); }
    }
    return <form className={styles.card} onSubmit={save} aria-label="Optional event video">
        <header className={styles.cardHeader}><div><p className={styles.eyebrow}>OPTIONAL EVENT VIDEO</p><h2>{event.title}</h2><p>Add optional videos directly to this event, whether it is a draft, awaiting approval or published. They travel with the event; normal media uploads stay separate.</p></div><button type="button" disabled={busy} onClick={onClose}>Close</button></header>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {videos.length > 0 && <div className={styles.grid}>{videos.map(video => <article key={video.id} className={styles.card}><span className={styles.badge}>{video.purpose}</span><h3>{video.title}</h3><VideoEmbed youtubeUrl={video.youtubeUrl} videoUrl={video.videoUrl} title={video.title} /><p>{video.mediaContentId ? 'Tagged from the media library' : video.youtubeUrl ? 'YouTube attachment' : 'Uploaded for this event'}</p><button type="button" disabled={busy} onClick={() => remove(video)}>Remove from event</button></article>)}</div>}
        <fieldset disabled={busy}>
            <legend>Add an event video</legend><label>Video title (optional)<input maxLength={150} value={title} onChange={e => setTitle(e.target.value)} /></label>
            <label>Video purpose<select value={purpose} onChange={e => setPurpose(e.target.value)}><option>Highlight</option><option>Trailer</option><option value="Promotional">Promotional video</option></select></label>
            <label>Video source<select value={source} onChange={e => changeSource(e.target.value)}><option value="youtube">YouTube link</option><option value="library">Cloudinary media library</option><option value="upload">Upload a new video</option></select></label>
            {source === 'youtube' && <label>YouTube video link<input type="url" required placeholder="https://www.youtube.com/watch?v=…" value={youtube} onChange={e => setYoutube(e.target.value)} /></label>}
            {source === 'library' && <label>Library video<select required value={selected} onChange={e => setSelected(e.target.value)}><option value="">Choose a video</option>{library.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select><small>Tag any video you can access, including one used by another event. Its original media record is unchanged.</small></label>}
            {source === 'upload' && <label>Video file<input key={inputVersion} type="file" required accept="video/mp4,video/webm,video/quicktime" onChange={e => setFile(e.target.files?.[0] || null)} /><small>MP4, WebM or MOV · up to 100 MB. Upload progress appears while saving.</small></label>}
        </fieldset><div className={styles.actions}><button className={styles.primary} disabled={busy}>{busy ? 'Saving video…' : 'Attach video to event'}</button><button type="button" disabled={busy} onClick={onClose}>Cancel</button></div>
    </form>;
}
