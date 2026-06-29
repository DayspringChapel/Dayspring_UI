'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

export default function SermonsPanel() {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);
    const [formData, setFormData] = useState({
        title: '', image: null, seriesTitle: '', preacherName: '', sermonDate: '', audioFile: null,
    });

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => { loadSermons(); }, []);

    const loadSermons = async () => {
        try {
            const data = await apiClient.getSermons();
            setSermons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load sermons:', error);
            setSermons([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingSermon) {
                await apiClient.updateSermon(editingSermon.id, {
                    title: formData.title, seriesTitle: formData.seriesTitle,
                    preacherName: formData.preacherName, sermonDate: formData.sermonDate,
                });
                notify('success', 'Sermon updated successfully!');
            } else {
                const fd = new FormData();
                fd.append('Title', formData.title);
                fd.append('SeriesTitle', formData.seriesTitle);
                fd.append('PreacherName', formData.preacherName);
                fd.append('SermonDate', formData.sermonDate);
                if (formData.image)     fd.append('Image',     formData.image);
                if (formData.audioFile) fd.append('AudioFile', formData.audioFile);
                await apiClient.createSermon(fd);
                notify('success', 'Sermon created successfully!');
            }
            await loadSermons();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save sermon:', error);
            notify('error', error.message || 'Failed to save sermon. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (sermonId) => {
        const yes = await confirm({
            title: 'Delete Sermon',
            message: 'Are you sure you want to delete this sermon? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;

        try {
            await apiClient.deleteSermon(sermonId);
            await loadSermons();
            notify('success', 'Sermon deleted.');
        } catch (error) {
            console.error('Failed to delete sermon:', error);
            notify('error', error.message || 'Failed to delete sermon. Please try again.');
        }
    };

    const handleEdit = (sermon) => {
        setEditingSermon(sermon);
        setFormData({
            title: sermon.title || '', image: null,
            seriesTitle: sermon.seriesTitle || '', preacherName: sermon.preacherName || '',
            sermonDate: sermon.sermonDate ? sermon.sermonDate.split('T')[0] : '',
            audioFile: null,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSermon(null);
        setFormData({ title: '', image: null, seriesTitle: '', preacherName: '', sermonDate: '', audioFile: null });
    };

    if (loading && sermons.length === 0) {
        return (
            <div className={styles.loading}><div className={styles.spinner}></div><p>Loading sermons...</p></div>
        );
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <h2>Sermons</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Sermon</button>
            </div>

            {sermons.length === 0 ? (
                <div className={styles.empty}><p>No sermons found. Create your first sermon!</p></div>
            ) : (
                <div className={styles.grid}>
                    {sermons.map((sermon) => (
                        <div key={sermon.id} className={styles.card}>
                            {sermon.image && <img src={sermon.image} alt={sermon.title} className={styles.cardImage} />}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{sermon.title}</h3>
                                <p className={styles.cardDescription}>By {sermon.preacherName} • {sermon.seriesTitle}</p>
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={() => handleEdit(sermon)}>Edit</button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(sermon.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingSermon ? 'Edit Sermon' : 'Add New Sermon'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Title *</label>
                                <input type="text" value={formData.title} required placeholder="Enter sermon title"
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Preacher Name *</label>
                                <input type="text" value={formData.preacherName} required placeholder="Enter preacher name"
                                    onChange={(e) => setFormData({ ...formData, preacherName: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Series Title</label>
                                <input type="text" value={formData.seriesTitle} placeholder="Enter series title"
                                    onChange={(e) => setFormData({ ...formData, seriesTitle: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Sermon Date *</label>
                                <input type="date" value={formData.sermonDate} required
                                    onChange={(e) => setFormData({ ...formData, sermonDate: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Image</label>
                                <input type="file" accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Audio File{editingSermon ? '' : ' *'}</label>
                                <input type="file" accept="audio/*" required={!editingSermon}
                                    onChange={(e) => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })} />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? 'Saving...' : editingSermon ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
