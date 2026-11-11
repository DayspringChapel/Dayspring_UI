'use client';
import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Management.module.css';

export default function EventVideoEditor({ event, onClose, onSaved }) {
    const [source, setSource] = useState('youtube');
    const [purpose, setPurpose] = useState(event.videoPurpose || 'Highlight');
    const [youtube, setYoutube] = useState(''); const [file, setFile] = useState(null);
    const [library, setLibrary] = useState([]); const [selected, setSelected] = useState('');
    const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
    const prepared = useRef(null); const pending = useRef(false);
    useEffect(() => {
        let active = true;
        if (source === 'library') apiClient.getMediaContents().then(items => { if (active) setLibrary(items.filter(item => Number(item.category) === 5 && Number(item.workflowStatus) !== 11 && (!item.eventId || item.eventId === event.id))); }).catch(e => { if (active) setError(e.message); });
        return () => { active = false; };
    }, [source, event.id]);
    function changeSource(value) { setSource(value); prepared.current = null; setError(''); }
    async function save(e) {
        e.preventDefault(); if (pending.current) return;
        if (source === 'upload' && (!file || file.size > 100 * 1024 * 1024 || !/\.(mp4|webm|mov)$/i.test(file.name))) { setError('Choose an MP4, WebM or MOV video up to 100 MB.'); return; }
        pending.current = true; setBusy(true); setError('');
        try {
            let contentId = selected;
            if (source !== 'library') {
                const key = [source, youtube, file];
                if (!prepared.current || prepared.current.key.some((value, i) => value !== key[i])) {
                    const form = new FormData(); form.append('Title', `${event.title} · ${purpose}`); form.append('Description', event.description || event.title); form.append('Category', '5'); form.append('ContentType', '2');
                    if (source === 'upload') form.append('File', file); else form.append('YoutubeUrl', youtube.trim());
                    const result = await apiClient.uploadMediaContent(form);
                    const item = apiClient.unwrapPayload(result);
                    if (!item?.id) throw new Error('The video could not be saved. Please try again.');
                    prepared.current = { key, id: item.id };
                }
                contentId = prepared.current.id;
            }
            const result = await apiClient.request(`/api/v1/event-programs/${event.id}/video`, { method: 'POST', body: JSON.stringify({ contentId, purpose }) });
            onSaved(result.message || 'Event video saved.');
        } catch (e) { setError(e.message); } finally { pending.current = false; setBusy(false); }
    }
    return <form className={styles.card} onSubmit={save} aria-label="Optional event video">
        <header className={styles.cardHeader}><div><p className={styles.eyebrow}>OPTIONAL EVENT VIDEO</p><h2>{event.title}</h2><p>Choose one video for the event page. Videos follow the approval workflow, then can be published from Media → Publishing.</p></div><button type="button" disabled={busy} onClick={onClose}>Close</button></header>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <fieldset disabled={busy}>
            <label>Video purpose<select value={purpose} onChange={e => setPurpose(e.target.value)}><option>Highlight</option><option>Trailer</option><option value="Promotional">Promotional video</option></select></label>
            <label>Video source<select value={source} onChange={e => changeSource(e.target.value)}><option value="youtube">YouTube link</option><option value="library">Cloudinary media library</option><option value="upload">Upload a new video</option></select></label>
            {source === 'youtube' && <label>YouTube video link<input type="url" required placeholder="https://www.youtube.com/watch?v=…" value={youtube} onChange={e => setYoutube(e.target.value)} /></label>}
            {source === 'library' && <label>Event-video media<select required value={selected} onChange={e => setSelected(e.target.value)}><option value="">Choose a video</option>{library.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select><small>Shows event-video media you can access. Videos tagged to another event are excluded.</small></label>}
            {source === 'upload' && <label>Video file<input type="file" required accept="video/mp4,video/webm,video/quicktime" onChange={e => setFile(e.target.files?.[0] || null)} /><small>MP4, WebM or MOV · up to 100 MB. Upload progress appears while saving.</small></label>}
        </fieldset><div className={styles.actions}><button className={styles.primary} disabled={busy}>{busy ? 'Saving video…' : 'Save & tag video'}</button><button type="button" disabled={busy} onClick={onClose}>Cancel</button></div>
    </form>;
}
