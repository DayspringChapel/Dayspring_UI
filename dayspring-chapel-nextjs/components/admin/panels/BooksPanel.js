'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

export default function BooksPanel() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', author: '', description: '', publisher: '', isbn: '',
        bookImage: null, bookPdf: null,
    });

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => { loadBooks(); }, []);

    const loadBooks = async () => {
        try {
            const data = await apiClient.getBooks();
            setBooks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load books:', error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Title', formData.title);
            formDataToSend.append('Author', formData.author);
            formDataToSend.append('Description', formData.description);
            formDataToSend.append('Publisher', formData.publisher);
            formDataToSend.append('ISBN', formData.isbn);
            if (formData.bookImage) formDataToSend.append('BookImage', formData.bookImage);
            if (formData.bookPdf)   formDataToSend.append('BookPdf',   formData.bookPdf);
            await apiClient.createBook(formDataToSend);
            await loadBooks();
            handleCloseModal();
            notify('success', 'Book added successfully!');
        } catch (error) {
            console.error('Failed to save book:', error);
            notify('error', error.message || 'Failed to save book. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (bookId) => {
        const yes = await confirm({
            title: 'Delete Book',
            message: 'Are you sure you want to delete this book? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;

        try {
            await apiClient.deleteBook(bookId);
            await loadBooks();
            notify('success', 'Book deleted.');
        } catch (error) {
            console.error('Failed to delete book:', error);
            notify('error', error.message || 'Failed to delete book. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: '', author: '', description: '', publisher: '', isbn: '', bookImage: null, bookPdf: null });
    };

    if (loading && books.length === 0) {
        return (
            <div className={styles.loading}><div className={styles.spinner}></div><p>Loading books...</p></div>
        );
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <h2>Books</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Book</button>
            </div>

            {books.length === 0 ? (
                <div className={styles.empty}><p>No books found. Add your first book!</p></div>
            ) : (
                <div className={styles.grid}>
                    {books.map((book) => (
                        <div key={book.id} className={styles.card}>
                            {book.bookImage && <img src={book.bookImage} alt={book.title} className={styles.cardImage} />}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{book.title}</h3>
                                <p className={styles.cardDescription}>{book.author}</p>
                                <div className={styles.cardActions}>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(book.id)}>Delete</button>
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
                            <h3>Add New Book</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Title *</label>
                                <input type="text" value={formData.title} required placeholder="Enter book title"
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Author *</label>
                                <input type="text" value={formData.author} required placeholder="Enter author name"
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={formData.description} rows={3} placeholder="Short description"
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Publisher</label>
                                <input type="text" value={formData.publisher} placeholder="Publisher"
                                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>ISBN</label>
                                <input type="text" value={formData.isbn} placeholder="ISBN"
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Book Cover Image *</label>
                                <input type="file" accept="image/*" required
                                    onChange={(e) => setFormData({ ...formData, bookImage: e.target.files[0] })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Book PDF *</label>
                                <input type="file" accept="application/pdf" required
                                    onChange={(e) => setFormData({ ...formData, bookPdf: e.target.files[0] })} />
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
