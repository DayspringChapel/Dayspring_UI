'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './create.module.css';

const CATEGORIES = [
    { value: '1', label: 'Gallery Image', contentType: '1' },
    { value: '2', label: 'Sermon Audio', contentType: '3' },
    { value: '3', label: 'Sermon Video (YouTube)', contentType: '2' },
    { value: '4', label: 'Event Flier', contentType: '1' },
    { value: '5', label: 'Event Highlight Video', contentType: '2' },
];

const CONTENT_TYPE_LABELS = { '1': 'Image', '2': 'Video', '3': 'Audio', '4': 'PDF' };

export default function CreateMediaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = CATEGORIES.some((category) => category.value === searchParams.get('category'))
        ? searchParams.get('category')
        : '1';
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: initialCategory,
        tags: '',
        youtubeUrl: '',
    });
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [videoInputMode, setVideoInputMode] = useState('youtube'); // 'youtube' | 'upload' — Event Highlight Video only

    const selectedCategory = CATEGORIES.find((c) => c.value === form.category) || CATEGORIES[0];
    const isVideoSermon = form.category === '3';
    const isEventHighlightVideo = form.category === '5';
    const usingYoutube = isVideoSermon || (isEventHighlightVideo && videoInputMode === 'youtube');

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
        if (usingYoutube) {
            if (!form.youtubeUrl.trim()) { setError('Please enter a YouTube URL'); return; }
        } else if (!file) {
            setError('Please select a media file');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('contentType', selectedCategory.contentType);
            formData.append('category', form.category);
            formData.append('tags', form.tags);
            if (usingYoutube) {
                formData.append('youtubeUrl', form.youtubeUrl.trim());
            } else {
                formData.append('file', file);
            }
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
                <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                    <p className={styles.dropZoneHint}>Type: {CONTENT_TYPE_LABELS[selectedCategory.contentType]}</p>
                </div>

                {isEventHighlightVideo && (
                    <div className={styles.formGroup}>
                        <label>Video Source *</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 400 }}>
                                <input
                                    type="radio"
                                    name="videoInputMode"
                                    checked={videoInputMode === 'youtube'}
                                    onChange={() => setVideoInputMode('youtube')}
                                />
                                YouTube Link
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 400 }}>
                                <input
                                    type="radio"
                                    name="videoInputMode"
                                    checked={videoInputMode === 'upload'}
                                    onChange={() => setVideoInputMode('upload')}
                                />
                                Upload Video File
                            </label>
                        </div>
                    </div>
                )}

                {usingYoutube ? (
                    <div className={styles.formGroup}>
                        <label>YouTube URL *</label>
                        <input
                            name="youtubeUrl"
                            value={form.youtubeUrl}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                        />
                    </div>
                ) : (
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
                            accept={isEventHighlightVideo ? 'video/*' : 'image/*,audio/*'}
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
                                <p className={styles.dropZoneHint}>{isEventHighlightVideo ? 'Video file' : 'Images or Audio'}</p>
                            </>
                        )}
                    </div>
                )}

                <div className={styles.row2}>
                    <div className={styles.formGroup}>
                        <label>Title *</label>
                        <input name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Tags</label>
                        <input name="tags" value={form.tags} onChange={handleChange} placeholder="comma separated" />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
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
