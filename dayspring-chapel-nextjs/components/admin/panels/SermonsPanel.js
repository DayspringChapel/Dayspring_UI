'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

export default function SermonsPanel() {
    const router = useRouter();
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);
    const [calendarYears, setCalendarYears] = useState([]);
    const [formData, setFormData] = useState({
        title: '', preacherName: '', sermonDate: '', calendarYearId: '',
    });

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => { loadSermons(); }, []);
    useEffect(() => {
        apiClient.getCalendarYears().then(setCalendarYears).catch(() => setCalendarYears([]));
    }, []);

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
        if (!editingSermon) return;
        setSaving(true);
        try {
            await apiClient.updateSermon(editingSermon.id, {
                title: formData.title,
                preacherName: formData.preacherName,
                sermonDate: formData.sermonDate,
                calendarYearId: formData.calendarYearId || null,
            });
            notify('success', 'Sermon updated successfully!');
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
            title: sermon.title || '',
            preacherName: sermon.preacherName || '',
            sermonDate: sermon.sermonDate ? sermon.sermonDate.split('T')[0] : '',
            calendarYearId: sermon.calendarYearId || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSermon(null);
        setFormData({ title: '', preacherName: '', sermonDate: '', calendarYearId: '' });
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
                <button className={styles.addBtn} onClick={() => router.push('/admin/media/create')}>
                    + Upload Media
                </button>
            </div>
            <p className={styles.cardDescription} style={{ margin: '-0.5rem 0 1rem' }}>
                New sermons are uploaded from Media, reviewed, and published from the Publishing page. This panel manages sermons already in the library.
            </p>

            {sermons.length === 0 ? (
                <div className={styles.empty}><p>No sermons found yet. Upload one to get started.</p></div>
            ) : (
                <div className={styles.grid}>
                    {sermons.map((sermon) => (
                        <div key={sermon.id} className={styles.card}>
                            {sermon.image && <img src={sermon.image} alt={sermon.title} className={styles.cardImage} />}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{sermon.title}</h3>
                                <p className={styles.cardDescription}>
                                    By {sermon.preacherName} • {sermon.sermonType === 2 ? 'Video' : 'Audio'}
                                </p>
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={() => handleEdit(sermon)}>Edit</button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(sermon.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && editingSermon && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Edit Sermon</h3>
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
                                <label>Sermon Date *</label>
                                <input type="date" value={formData.sermonDate} required
                                    onChange={(e) => setFormData({ ...formData, sermonDate: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Calendar Year</label>
                                <select value={formData.calendarYearId}
                                    onChange={(e) => setFormData({ ...formData, calendarYearId: e.target.value })}>
                                    <option value="">— None —</option>
                                    {calendarYears.map((cy) => (
                                        <option key={cy.id} value={cy.id}>{cy.year}{cy.label ? ` — ${cy.label}` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
