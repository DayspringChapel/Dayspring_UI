'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

export default function AlbumsPanel() {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        albumName: '',
        description: '',
        albumYear: new Date().toISOString().split('T')[0],
        albumImage: null,
    });

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog }  = useConfirm();

    useEffect(() => { loadAlbums(); }, []);

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
        setSaving(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('AlbumName', formData.albumName);
            formDataToSend.append('Description', formData.description);
            formDataToSend.append('AlbumYear', formData.albumYear);
            if (formData.albumImage) formDataToSend.append('AlbumImage', formData.albumImage);

            await apiClient.createAlbum(formDataToSend);
            await loadAlbums();
            handleCloseModal();
            notify('success', 'Album created successfully!');
        } catch (error) {
            console.error('Failed to save album:', error);
            notify('error', error.message || 'Failed to save album. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (albumId) => {
        const yes = await confirm({
            title: 'Delete Album',
            message: 'Are you sure you want to delete this album? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;

        try {
            await apiClient.deleteAlbum(albumId);
            await loadAlbums();
            notify('success', 'Album deleted.');
        } catch (error) {
            console.error('Failed to delete album:', error);
            notify('error', error.message || 'Failed to delete album. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            albumName: '',
            description: '',
            albumYear: new Date().toISOString().split('T')[0],
            albumImage: null,
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
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

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
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Album</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="albumName">Album Name *</label>
                                <input
                                    type="text" id="albumName" value={formData.albumName} required
                                    placeholder="Enter album name"
                                    onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description" value={formData.description} required rows={4}
                                    placeholder="Enter album description"
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="albumYear">Album Year *</label>
                                <input
                                    type="date" id="albumYear" value={formData.albumYear} required
                                    onChange={(e) => setFormData({ ...formData, albumYear: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="albumImage">Album Cover</label>
                                <input
                                    type="file" id="albumImage" accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, albumImage: e.target.files?.[0] || null })}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? 'Saving...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
