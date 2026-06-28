'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './create.module.css';

const CONTENT_TYPES = [
    { value: '1', label: 'Image' },
    { value: '2', label: 'Video' },
    { value: '3', label: 'Audio' },
    { value: '4', label: 'PDF' },
];

export default function CreateMediaPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        description: '',
        contentType: '2',
        category: '',
        tags: '',
    });
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Please select a media file'); return; }
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('contentType', form.contentType);
            formData.append('category', form.category);
            formData.append('tags', form.tags);
            formData.append('file', file);
            if (thumbnail) formData.append('thumbnail', thumbnail);

            await apiClient.uploadMediaContent(formData);
            router.push('/admin/media');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => router.back()}>← Back</button>
            <h1 className={styles.pageTitle}>Upload Media</h1>
            <p className={styles.pageSubtitle}>Upload a new media file — it starts in Draft status</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Drop zone */}
                <div
                    className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        className={styles.hiddenInput}
                        accept="image/*,video/*,audio/*,.pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    {file ? (
                        <>
                            <p className={styles.dropZoneFileName}>{file.name}</p>
                            <p className={styles.dropZoneFileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                    ) : (
                        <>
                            <span className={styles.dropZoneIcon}>☁</span>
                            <p className={styles.dropZoneLabel}>Drag & drop or click to select</p>
                            <p className={styles.dropZoneHint}>Images, Videos, Audio, PDF</p>
                        </>
                    )}
                </div>

                <div className={styles.row2}>
                    <div className={styles.formGroup}>
                        <label>Title *</label>
                        <input name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Content Type *</label>
                        <select name="contentType" value={form.contentType} onChange={handleChange}>
                            {CONTENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
                </div>

                <div className={styles.row2}>
                    <div className={styles.formGroup}>
                        <label>Category *</label>
                        <input name="category" value={form.category} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Tags</label>
                        <input name="tags" value={form.tags} onChange={handleChange} placeholder="comma separated" />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Thumbnail (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className={styles.thumbnailInput}
                        onChange={(e) => setThumbnail(e.target.files[0])}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={() => router.back()}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? 'Uploading…' : 'Upload Media'}
                    </button>
                </div>
            </form>
        </div>
    );
}
