'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';

export default function SeriesPanel() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSeries, setEditingSeries] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
    });

    useEffect(() => {
        loadSeries();
    }, []);

    const loadSeries = async () => {
        try {
            const data = await apiClient.getSeries();
            setSeries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load series:', error);
            setSeries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingSeries) {
                await apiClient.updateSeries(editingSeries.id, formData);
            } else {
                await apiClient.createSeries(formData);
            }

            await loadSeries();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save series:', error);
            alert('Failed to save series. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this series?')) return;

        try {
            await apiClient.deleteSeries(id);
            await loadSeries();
        } catch (error) {
            console.error('Failed to delete series:', error);
            alert('Failed to delete series. Please try again.');
        }
    };

    const handleEdit = (item) => {
        setEditingSeries(item);
        setFormData({
            title: item.title || '',
            image: item.image || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSeries(null);
        setFormData({ title: '', image: '' });
    };

    if (loading && series.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading series...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2>Sermon Series</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    + Add Series
                </button>
            </div>

            {series.length === 0 ? (
                <div className={styles.empty}>
                    <p>No series found. Create your first series!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {series.map((item) => (
                        <div key={item.id} className={styles.card}>
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className={styles.cardImage}
                                />
                            )}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEdit(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(item.id)}
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
                            <h3>{editingSeries ? 'Edit Series' : 'Add New Series'}</h3>
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
                                    placeholder="Enter series title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="image">Image URL</label>
                                <input
                                    type="url"
                                    id="image"
                                    value={formData.image}
                                    onChange={(e) =>
                                        setFormData({ ...formData, image: e.target.value })
                                    }
                                    placeholder="https://example.com/image.jpg"
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
                                    {loading ? 'Saving...' : editingSeries ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
