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
    { value: '6', label: 'Memory / Short', contentType: '2', roles: ['churchMedia', 'churchAdmin', 'superAdmin'] },
];

const CONTENT_TYPE_LABELS = { '1': 'Image', '2': 'Video', '3': 'Audio', '4': 'PDF' };

export default function CreateMediaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userRoleValue = apiClient.getUserData()?.role || apiClient.getUserData()?.Role || {};
    const roleName = (typeof userRoleValue === 'string' ? userRoleValue : userRoleValue.name || userRoleValue.Name || '').toLowerCase();
    const role = roleName.includes('super') ? 'superAdmin' : roleName.includes('media') ? 'churchMedia' : roleName.includes('admin') ? 'churchAdmin' : 'member';
    const availableCategories = CATEGORIES.filter((category) => !category.roles || category.roles.includes(role));
    const initialCategory = availableCategories.some((category) => category.value === searchParams.get('category'))
        ? searchParams.get('category')
        : '1';
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: initialCategory,
        tags: '',
        youtubeUrl: '',
    });
    const [files, setFiles] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [videoInputMode, setVideoInputMode] = useState('youtube'); // 'youtube' | 'upload' — Event Highlight Video only

    const selectedCategory = availableCategories.find((c) => c.value === form.category) || availableCategories[0];
    const isVideoSermon = form.category === '3';
    const isEventHighlightVideo = form.category === '5';
    const isMemoryShort = form.category === '6';
    const usingYoutube = isVideoSermon || (isEventHighlightVideo && videoInputMode === 'youtube');

    const fileRules = form.category === '2'
        ? { accept: 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,.mp3,.m4a,.wav,.ogg', maxMb: 25, label: 'MP3, M4A, WAV or OGG audio' }
        : ['5', '6'].includes(form.category)
            ? { accept: 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov', maxMb: 100, label: 'MP4, WebM or MOV video' }
            : { accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', maxMb: 10, label: 'JPG, PNG or WebP image' };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        setFiles(Array.from(e.dataTransfer.files));
    };

    const validateFiles = () => {
        if (files.length === 0) return 'Please select at least one media file';
        const acceptParts = fileRules.accept.split(',');
        for (const file of files) {
            const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
            const accepted = acceptParts.some((part) => part.startsWith('.') ? part === extension : file.type === part);
            if (!accepted) return `${file.name} is not an accepted ${fileRules.label} file`;
            if (file.size > fileRules.maxMb * 1024 * 1024) return `${file.name} exceeds ${fileRules.maxMb} MB`;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (usingYoutube) {
            if (!form.youtubeUrl.trim()) { setError('Please enter a YouTube URL'); return; }
            if (!/^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(form.youtubeUrl.trim())) {
                setError('Please enter a valid HTTPS YouTube URL'); return;
            }
        } else {
            const validationError = validateFiles();
            if (validationError) { setError(validationError); return; }
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
                files.forEach((file) => formData.append('files', file));
            }
            if (thumbnail) formData.append('thumbnail', thumbnail);

            if (usingYoutube) {
                await apiClient.uploadMediaContent(formData);
            } else {
                await apiClient.uploadMediaContents(formData, isMemoryShort);
            }
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
                        {availableCategories.map((c) => (
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
                            multiple
                            className={styles.hiddenInput}
                            accept={fileRules.accept}
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                        />
                        {files.length > 0 ? (
                            <>
                                <p className={styles.dropZoneFileName}>{files.length} file(s) selected</p>
                                <p className={styles.dropZoneFileSize}>{files.map((file) => file.name).join(', ')}</p>
                            </>
                        ) : (
                            <>
                                <span className={styles.dropZoneIcon}>☁</span>
                                <p className={styles.dropZoneLabel}>Drag & drop or click to select</p>
                                <p className={styles.dropZoneHint}>{fileRules.label} · up to {fileRules.maxMb} MB each</p>
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
