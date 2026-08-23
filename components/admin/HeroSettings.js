'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

const DEFAULT_CONSTRAINTS = { minWidth: 1280, minHeight: 720, aspectRatio: '16:9', imageFormats: ['JPG', 'PNG', 'WebP'], videoFormats: ['MP4', 'WebM'], imageMaxMb: 10, videoMaxMb: 100, maxImages: 10 };

function readDimensions(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = file.type.startsWith('video/');
        const media = document.createElement(video ? 'video' : 'img');
        const done = (value, error) => { URL.revokeObjectURL(url); error ? reject(error) : resolve(value); };
        media.onloadedmetadata = () => done({ width: media.videoWidth, height: media.videoHeight });
        media.onload = () => done({ width: media.naturalWidth, height: media.naturalHeight });
        media.onerror = () => done(null, new Error(`Unable to read ${file.name}`));
        media.src = url;
    });
}

export default function HeroSettings() {
    const [settings, setSettings] = useState(null);
    const [memoryShorts, setMemoryShorts] = useState([]);
    const [mode, setMode] = useState('0');
    const [files, setFiles] = useState([]);
    const [fileInfo, setFileInfo] = useState([]);
    const [memoryShortId, setMemoryShortId] = useState('');
    const [rotationSeconds, setRotationSeconds] = useState(8);
    const [shuffle, setShuffle] = useState(false);
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);
    const constraints = settings?.constraints || DEFAULT_CONSTRAINTS;

    useEffect(() => {
        Promise.all([apiClient.getHeroSettings(), apiClient.getMemoryShorts()])
            .then(([hero, memories]) => {
                setSettings(hero); setMemoryShorts(memories || []); setMode(String(hero.mode ?? 0));
                setRotationSeconds(hero.rotationSeconds ?? 8); setShuffle(!!hero.shuffle);
            })
            .catch((error) => setStatus(error.message));
    }, []);

    const selectFiles = async (selected) => {
        const nextFiles = Array.from(selected || []);
        setStatus(''); setMemoryShortId('');
        try {
            const info = await Promise.all(nextFiles.map(async (file) => {
                const dimensions = await readDimensions(file);
                const expectedType = mode === '1' ? 'video/' : 'image/';
                const maxBytes = (mode === '1' ? constraints.videoMaxMb : constraints.imageMaxMb) * 1024 * 1024;
                if (!file.type.startsWith(expectedType)) throw new Error(`${file.name} has the wrong format`);
                if (file.size > maxBytes) throw new Error(`${file.name} exceeds the file-size limit`);
                if (dimensions.width < constraints.minWidth || dimensions.height < constraints.minHeight) throw new Error(`${file.name} must be at least ${constraints.minWidth}×${constraints.minHeight}`);
                if (Math.abs(dimensions.width / dimensions.height - 16 / 9) > 0.04) throw new Error(`${file.name} must use a 16:9 aspect ratio`);
                return { name: file.name, size: file.size, ...dimensions };
            }));
            if (mode === '1' && nextFiles.length !== 1) throw new Error('Select exactly one hero video');
            if (mode === '2' && (nextFiles.length < 2 || nextFiles.length > constraints.maxImages)) throw new Error(`Select 2 to ${constraints.maxImages} hero images`);
            setFiles(nextFiles); setFileInfo(info);
        } catch (error) {
            setFiles([]); setFileInfo([]); setStatus(error.message);
        }
    };

    const save = async () => {
        setSaving(true); setStatus('');
        try {
            const form = new FormData();
            form.append('Mode', mode); form.append('RotationSeconds', String(rotationSeconds)); form.append('Shuffle', String(shuffle));
            files.forEach((file) => form.append('Files', file));
            if (memoryShortId) form.append('MemoryShortIds', memoryShortId);
            const updated = await apiClient.updateHeroSettings(form);
            setSettings(updated); setFiles([]); setFileInfo([]); setStatus('Hero settings saved.');
        } catch (error) { setStatus(error.message); } finally { setSaving(false); }
    };

    const reset = async () => {
        setSaving(true);
        try {
            const updated = await apiClient.resetHeroSettings();
            setSettings(updated); setMode('0'); setFiles([]); setFileInfo([]); setMemoryShortId(''); setStatus('Default local hero video restored.');
        } catch (error) { setStatus(error.message); } finally { setSaving(false); }
    };

    return (
        <section style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a' }}>Homepage Hero</h2>
            <p style={{ color: '#475569', fontSize: '0.85rem' }}>One active mode only. Minimum {constraints.minWidth}×{constraints.minHeight}, {constraints.aspectRatio}; images {constraints.imageFormats.join('/')} up to {constraints.imageMaxMb} MB, video {constraints.videoFormats.join('/')} up to {constraints.videoMaxMb} MB.</p>
            <label style={{ display: 'block', marginBottom: '0.75rem', color: '#0f172a' }}>Mode
                <select value={mode} onChange={(event) => { setMode(event.target.value); setFiles([]); setFileInfo([]); setMemoryShortId(''); }} style={{ display: 'block', width: '100%', padding: '0.65rem', marginTop: '0.3rem' }}>
                    <option value="0">Default local video</option><option value="1">One Cloudinary video</option><option value="2">Multiple Cloudinary images</option>
                </select>
            </label>
            {mode === '1' && <>
                <label style={{ display: 'block', color: '#0f172a', marginBottom: '0.75rem' }}>Upload new video<input type="file" accept="video/mp4,video/webm" onChange={(event) => selectFiles(event.target.files)} style={{ display: 'block', marginTop: '0.3rem' }} /></label>
                <label style={{ display: 'block', color: '#0f172a', marginBottom: '0.75rem' }}>Or select existing Memory/Short
                    <select value={memoryShortId} onChange={(event) => { setMemoryShortId(event.target.value); setFiles([]); setFileInfo([]); }} style={{ display: 'block', width: '100%', padding: '0.65rem', marginTop: '0.3rem' }}>
                        <option value="">Select a video</option>{memoryShorts.map((item) => {
                            const valid = item.mediaWidth >= constraints.minWidth && item.mediaHeight >= constraints.minHeight && Math.abs(item.mediaWidth / item.mediaHeight - 16 / 9) <= 0.04 && ['mp4', 'webm'].includes(item.mediaFormat?.toLowerCase());
                            return <option key={item.id} value={item.id} disabled={!valid}>{item.title} · {item.mediaWidth || '?'}×{item.mediaHeight || '?'} · {item.mediaFormat || 'unknown'}{valid ? '' : ' (not hero compatible)'}</option>;
                        })}
                    </select>
                </label>
            </>}
            {mode === '2' && <label style={{ display: 'block', color: '#0f172a', marginBottom: '0.75rem' }}>Upload 2–{constraints.maxImages} images<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => selectFiles(event.target.files)} style={{ display: 'block', marginTop: '0.3rem' }} /></label>}
            {fileInfo.map((item) => <div key={item.name} style={{ color: '#475569', fontSize: '0.8rem' }}>{item.name}: {item.width}×{item.height}, {(item.size / 1024 / 1024).toFixed(2)} MB, {(item.width / item.height).toFixed(2)}:1</div>)}
            {mode === '2' && <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', color: '#0f172a' }}><label>Rotation seconds <input type="number" min="3" max="60" value={rotationSeconds} onChange={(event) => setRotationSeconds(Number(event.target.value))} /></label><label><input type="checkbox" checked={shuffle} onChange={(event) => setShuffle(event.target.checked)} /> Shuffle</label></div>}
            {settings?.items?.length > 0 && <p style={{ color: '#475569', fontSize: '0.8rem' }}>Active media: {settings.items.map((item) => `${item.width || '?'}×${item.height || '?'} ${item.format || ''}`).join(', ')}</p>}
            {status && <p style={{ color: status.includes('saved') || status.includes('restored') ? '#047857' : '#b91c1c' }}>{status}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}><button onClick={save} disabled={saving || mode === '0'} style={{ padding: '0.65rem 1rem' }}>{saving ? 'Saving…' : 'Save Hero'}</button><button onClick={reset} disabled={saving} style={{ padding: '0.65rem 1rem' }}>Reset to Default</button></div>
        </section>
    );
}
