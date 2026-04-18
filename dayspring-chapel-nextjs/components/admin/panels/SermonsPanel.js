'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';

export default function SermonsPanel() {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image: null,
        seriesTitle: '',
        preacherName: '',
        sermonDate: '',
        audioFile: null,
    });

    useEffect(() => {
        loadSermons();
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
        setLoading(true);

        try {
            if (editingSermon) {
                await apiClient.updateSermon(editingSermon.id, {
                    title: formData.title,
                    seriesTitle: formData.seriesTitle,
                    preacherName: formData.preacherName,
                    sermonDate: formData.sermonDate,
                });
            } else {
                const formDataToSend = new FormData();
                formDataToSend.append('Title', formData.title);
                formDataToSend.append('SeriesTitle', formData.seriesTitle);
                formDataToSend.append('PreacherName', formData.preacherName);
                formDataToSend.append('SermonDate', formData.sermonDate);
                if (formData.image) {
                    formDataToSend.append('Image', formData.image);
                }
                if (formData.audioFile) {
                    formDataToSend.append('AudioFile', formData.audioFile);
                }

                await apiClient.createSermon(formDataToSend);
            }

            await loadSermons();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save sermon:', error);
            alert('Failed to save sermon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sermonId) => {
        if (!confirm('Are you sure you want to delete this sermon?')) return;

        try {
            await apiClient.deleteSermon(sermonId);
            await loadSermons();
        } catch (error) {
            console.error('Failed to delete sermon:', error);
            alert('Failed to delete sermon. Please try again.');
        }
    };

    const handleEdit = (sermon) => {
        setEditingSermon(sermon);
        setFormData({
            title: sermon.title || '',
            image: null,
            seriesTitle: sermon.seriesTitle || '',
            preacherName: sermon.preacherName || '',
            sermonDate: sermon.sermonDate ? sermon.sermonDate.split('T')[0] : '',
            audioFile: null,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSermon(null);
        setFormData({
            title: '',
            image: null,
            seriesTitle: '',
            preacherName: '',
            sermonDate: '',
            audioFile: null,
        });
    };

    if (loading && sermons.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading sermons...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2>Sermons</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    + Add Sermon
                </button>
            </div>

            {sermons.length === 0 ? (
                <div className={styles.empty}>
                    <p>No sermons found. Create your first sermon!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {sermons.map((sermon) => (
                        <div key={sermon.id} className={styles.card}>
                            {sermon.image && (
                                <img
                                    src={sermon.image}
                                    alt={sermon.title}
                                    className={styles.cardImage}
                                />
                            )}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{sermon.title}</h3>
                                <p className={styles.cardDescription}>
                                    By {sermon.preacherName} • {sermon.seriesTitle}
                                </p>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEdit(sermon)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(sermon.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>{editingSermon ? 'Edit Sermon' : 'Add New Sermon'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    required
                                    placeholder="Enter sermon title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="preacherName">Preacher Name *</label>
                                <input
                                    type="text"
                                    id="preacherName"
                                    value={formData.preacherName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, preacherName: e.target.value })
                                    }
                                    required
                                    placeholder="Enter preacher name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="seriesTitle">Series Title</label>
                                <input
                                    type="text"
                                    id="seriesTitle"
                                    value={formData.seriesTitle}
                                    onChange={(e) =>
                                        setFormData({ ...formData, seriesTitle: e.target.value })
                                    }
                                    placeholder="Enter series title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="sermonDate">Sermon Date *</label>
                                <input
                                    type="date"
                                    id="sermonDate"
                                    value={formData.sermonDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sermonDate: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="image">Image</label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData({ ...formData, image: e.target.files?.[0] || null })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="audioFile">{editingSermon ? 'Audio File' : 'Audio File *'}</label>
                                <input
                                    type="file"
                                    id="audioFile"
                                    accept="audio/*"
                                    onChange={(e) =>
                                        setFormData({ ...formData, audioFile: e.target.files?.[0] || null })
                                    }
                                    required={!editingSermon}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : editingSermon ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
