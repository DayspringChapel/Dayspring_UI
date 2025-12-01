'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';

export default function BooksPanel() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        bookImage: null,
    });

    useEffect(() => {
        loadBooks();
    }, []);

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
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Title', formData.title);
            if (formData.bookImage) {
                formDataToSend.append('BookImage', formData.bookImage);
            }
            await apiClient.createBook(formDataToSend);

            await loadBooks();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save book:', error);
            alert('Failed to save book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bookId) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await apiClient.deleteBook(bookId);
            await loadBooks();
        } catch (error) {
            console.error('Failed to delete book:', error);
            alert('Failed to delete book. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: '', bookImage: null });
    };

    if (loading && books.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading books...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2>Books</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    + Add Book
                </button>
            </div>

            {books.length === 0 ? (
                <div className={styles.empty}>
                    <p>No books found. Add your first book!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {books.map((book) => (
                        <div key={book.id} className={styles.card}>
                            {book.bookImage && (
                                <img
                                    src={book.bookImage}
                                    alt={book.title}
                                    className={styles.cardImage}
                                />
                            )}
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{book.title}</h3>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(book.id)}
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
                            <h3>Add New Book</h3>
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
                                    placeholder="Enter book title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="bookImage">Book Cover Image *</label>
                                <input
                                    type="file"
                                    id="bookImage"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData({ ...formData, bookImage: e.target.files[0] })
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
