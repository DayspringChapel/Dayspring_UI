'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export default function EventsPanel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        datetime: '',
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, eventImage: file });

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingEvent) {
                // Update existing event
                const formDataToSend = new FormData();
                formDataToSend.append('Id', editingEvent.id);
                formDataToSend.append('Heading', formData.heading);
                formDataToSend.append('Description', formData.description);
                formDataToSend.append('DateTime', formData.datetime);
                if (formData.eventImage) {
                    formDataToSend.append('EventImage', formData.eventImage);
                }
                await apiClient.updateEvent(formDataToSend);
            } else {
                // Create new event
                const formDataToSend = new FormData();
                formDataToSend.append('heading', formData.heading);
                formDataToSend.append('Description', formData.description);
                // Convert datetime-local to ISO 8601 format
                const isoDatetime = new Date(formData.datetime).toISOString();
                formDataToSend.append('Datetime', isoDatetime);
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
            heading: event.heading || '',
            description: event.description || '',
            datetime: event.datetime ? new Date(event.datetime).toISOString().slice(0, 16) : '',
            eventImage: null,
        });
        setImagePreview(event.eventImage || null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({ heading: '', description: '', datetime: '', eventImage: null });
        setImagePreview(null);
    };

    if (loading && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
                <div className="w-11 h-11 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm font-medium">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Header - Stacks on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Events</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    + Add Event
                </button>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="bg-white rounded-xl p-8 sm:p-16 text-center text-gray-500 italic">
                    <p>No events found. Create your first event!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                        >
                            {event.eventImage && (
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={event.eventImage}
                                        alt={event.description}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                                    {event.description}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingEvent ? 'Edit Event' : 'Add New Event'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Heading */}
                            <div>
                                <label
                                    htmlFor="heading"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Event Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="heading"
                                    value={formData.heading}
                                    onChange={(e) =>
                                        setFormData({ ...formData, heading: e.target.value })
                                    }
                                    required
                                    placeholder="Enter event title"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Date and Time */}
                            <div>
                                <label
                                    htmlFor="datetime"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Date & Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        id="datetime"
                                        value={formData.datetime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, datetime: e.target.value })
                                        }
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium appearance-none"
                                    />
                                    {/* The calendar icon is usually provided by the browser, but consistent padding helps */}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    required
                                    rows={4}
                                    placeholder="Enter event description"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none font-medium"
                                />
                            </div>

                            {/* Image Upload with Preview */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Image
                                </label>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="mb-4 relative rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 sm:h-64 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData({ ...formData, eventImage: null });
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {/* File Input - Compact on mobile */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="eventImage"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="eventImage"
                                        className="flex flex-col items-center justify-center gap-3 px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-orange-500 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <svg
                                                className="w-6 h-6 text-orange-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-semibold text-gray-900 block">
                                                {formData.eventImage
                                                    ? formData.eventImage.name
                                                    : imagePreview
                                                        ? 'Change Image'
                                                        : 'Click to upload image'}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                SVG, PNG, JPG or GIF (max. 5MB)
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
