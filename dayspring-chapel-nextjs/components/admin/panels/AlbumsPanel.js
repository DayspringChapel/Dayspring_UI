'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';

export default function AlbumsPanel() {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        albumName: '',
        description: '',
        albumYear: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        try {
            const data = await apiClient.getAlbums();
            setAlbums(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load albums:', error);
            setAlbums([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiClient.createAlbum(formData);
            await loadAlbums();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save album:', error);
            alert('Failed to save album. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (albumId) => {
        if (!confirm('Are you sure you want to delete this album?')) return;

        try {
            await apiClient.deleteAlbum(albumId);
            await loadAlbums();
        } catch (error) {
            console.error('Failed to delete album:', error);
            alert('Failed to delete album. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            albumName: '',
            description: '',
            albumYear: new Date().toISOString().split('T')[0],
        });
    };

    if (loading && albums.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading albums...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2>Albums</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    + Add Album
                </button>
            </div>

            {albums.length === 0 ? (
                <div className={styles.empty}>
                    <p>No albums found. Create your first album!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {albums.map((album) => (
                        <div key={album.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{album.albumName}</h3>
                                <p className={styles.cardDescription}>{album.description}</p>
                                <p className={styles.cardDescription}>
                                    Year: {new Date(album.albumYear).getFullYear()}
                                </p>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(album.id)}
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
                            <h3>Add New Album</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="albumName">Album Name *</label>
                                <input
                                    type="text"
                                    id="albumName"
                                    value={formData.albumName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, albumName: e.target.value })
                                    }
                                    required
                                    placeholder="Enter album name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    required
                                    rows={4}
                                    placeholder="Enter album description"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="albumYear">Album Year *</label>
                                <input
                                    type="date"
                                    id="albumYear"
                                    value={formData.albumYear}
                                    onChange={(e) =>
                                        setFormData({ ...formData, albumYear: e.target.value })
                                    }
                                    required
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
                                    {loading ? 'Saving...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
