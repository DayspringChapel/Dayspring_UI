'use client';
import { useEffect, useState } from 'react';
import { UPLOAD_PROGRESS_EVENT } from '@/lib/directUploads';
import styles from './UploadProgress.module.css';

const LABELS = { authorizing: 'Preparing secure upload', uploading: 'Uploading file', saving: 'Verifying and saving', complete: 'Upload saved', error: 'Upload could not finish' };
export default function UploadProgress() {
    const [upload, setUpload] = useState(null);
    useEffect(() => {
        const update = event => setUpload(event.detail);
        window.addEventListener(UPLOAD_PROGRESS_EVENT, update);
        return () => window.removeEventListener(UPLOAD_PROGRESS_EVENT, update);
    }, []);
    useEffect(() => {
        if (upload?.phase !== 'complete') return;
        const timer = setTimeout(() => setUpload(null), 4500); return () => clearTimeout(timer);
    }, [upload]);
    if (!upload) return null;
    const finished = ['error', 'complete'].includes(upload.phase);
    return <aside className={`${styles.panel} ${upload.phase === 'error' ? styles.error : ''}`} aria-label="File upload progress">
        <div className={styles.header}><strong role="status">{LABELS[upload.phase]}</strong>{finished && <button type="button" aria-label="Dismiss upload status" onClick={() => setUpload(null)}>×</button>}</div>
        <p>{upload.name}</p>
        {upload.phase !== 'error' && <><progress max="100" value={upload.percent} aria-label="Upload progress" /><span>{upload.percent}%</span></>}
        {upload.phase === 'saving' && <p>The file has reached storage. Keep this page open while its record is saved.</p>}
    </aside>;
}
