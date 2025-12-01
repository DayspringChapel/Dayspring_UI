'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';

export default function EventsPanel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        eventImage: null,
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await apiClient.getEvents();
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingEvent) {
                // Update existing event
                await apiClient.updateEvent({
                    eventId: editingEvent.id,
                    description: formData.description,
                    eventImage: formData.eventImage,
                });
            } else {
                // Create new event
                const formDataToSend = new FormData();
                formDataToSend.append('Description', formData.description);
                if (formData.eventImage) {
                    formDataToSend.append('EventImage', formData.eventImage);
                }
                await apiClient.createEvent(formDataToSend);
            }

            await loadEvents();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save event:', error);
            alert('Failed to save event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await apiClient.deleteEvent(eventId);
            await loadEvents();
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event. Please try again.');
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            description: event.description || '',
            eventImage: null,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({ description: '', eventImage: null });
    };

    if (loading && events.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2>Events</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    + Add Event
                </button>
            </div>

            {events.length === 0 ? (
                <div className={styles.empty}>
                    <p>No events found. Create your first event!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {events.map((event) => (
                        <div key={event.id} className={styles.card}>
                            {event.eventImage && (
                                <img
                                    src={event.eventImage}
                                    alt={event.description}
                                    className={styles.cardImage}
                                />
                            )}
                            <div className={styles.cardContent}>
                                <p className={styles.cardDescription}>{event.description}</p>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEdit(event)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(event.id)}
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
                            <h3>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
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
                                    placeholder="Enter event description"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="eventImage">Event Image</label>
                                <input
                                    type="file"
                                    id="eventImage"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData({ ...formData, eventImage: e.target.files[0] })
                                    }
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
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
