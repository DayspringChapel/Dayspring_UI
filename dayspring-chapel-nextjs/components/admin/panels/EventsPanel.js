'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useEvents } from '@/context/EventContext';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

export default function EventsPanel() {
    // Use context events initially for instant load
    // Use context events directly
    const { events, loading: contextLoading, refreshEvents } = useEvents();
    // Local loading state only for actions
    const [actionLoading, setActionLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [viewingEvent, setViewingEvent] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        datetime: '',
        eventImage: null,
    });

    // Helper to clear form
    const resetForm = () => {
        setFormData({
            heading: '',
            description: '',
            datetime: '',
            eventImage: null,
        });
        setImagePreview(null);
        setEditingEvent(null);
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
        setActionLoading(true);

        try {
            if (editingEvent) {
                // Update existing event logic
                // Field names must match backend exactly: Heading, Description, DateTime, EventImage
                const formDataToSend = new FormData();
                formDataToSend.append('Heading', formData.heading);
                formDataToSend.append('Description', formData.description);
                // Convert datetime to ISO 8601 format
                const isoDatetime = formData.datetime ? new Date(formData.datetime).toISOString() : '';
                formDataToSend.append('DateTime', isoDatetime);
                if (formData.eventImage) {
                    formDataToSend.append('EventImage', formData.eventImage);
                }
                await apiClient.updateEvent(editingEvent.id, formDataToSend);
            } else {
                // Create new event logic ...
                const formDataToSend = new FormData();
                formDataToSend.append('heading', formData.heading);
                formDataToSend.append('Description', formData.description);
                const isoDatetime = new Date(formData.datetime).toISOString();
                formDataToSend.append('Datetime', isoDatetime);
                if (formData.eventImage) {
                    formDataToSend.append('EventImage', formData.eventImage);
                }
                await apiClient.createEvent(formDataToSend);
            }

            refreshEvents();
            handleCloseModal();
            notify('success', editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
        } catch (error) {
            console.error('Failed to save event:', error);
            notify('error', error.message || 'Failed to save event. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        const yes = await confirm({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;

        try {
            await apiClient.deleteEvent(eventId);
            refreshEvents();
            notify('success', 'Event deleted.');
        } catch (error) {
            console.error('Failed to delete event:', error);
            notify('error', error.message || 'Failed to delete event. Please try again.');
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

    if (contextLoading && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
                <div className="w-11 h-11 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm font-medium">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />
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

            {/* Events Table */}
            {events.length === 0 ? (
                <div className="bg-white rounded-xl p-8 sm:p-16 text-center text-gray-500 italic">
                    <p>No events found. Create your first event!</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1">Image</div>
                        <div className="col-span-3">Title</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-3 text-right">Actions</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-gray-100">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => setViewingEvent(event)}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-4 sm:px-6 py-4 items-center hover:bg-orange-50/40 transition-colors cursor-pointer"
                            >
                                {/* Image */}
                                <div className="col-span-1">
                                    {event.eventImage ? (
                                        <img
                                            src={event.eventImage}
                                            alt={event.heading || 'Event'}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="col-span-3">
                                    <p className="font-semibold text-gray-900 truncate">{event.heading || 'Untitled'}</p>
                                </div>

                                {/* Date */}
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">
                                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="col-span-3">
                                    <p className="text-sm text-gray-600 line-clamp-2">{event.description || 'No description'}</p>
                                </div>

                                {/* Actions — stop row click propagation */}
                                <div className="col-span-3 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setViewingEvent(event)}
                                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── View Modal ──────────────────────────────────── */}
            {viewingEvent && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setViewingEvent(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image */}
                        {viewingEvent.eventImage ? (
                            <div className="relative w-full" style={{ height: 260 }}>
                                <img
                                    src={viewingEvent.eventImage}
                                    alt={viewingEvent.heading || 'Event'}
                                    className="w-full h-full object-cover rounded-t-2xl"
                                />
                                <div className="absolute inset-0 rounded-t-2xl"
                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
                            </div>
                        ) : (
                            <div className="w-full rounded-t-2xl flex items-center justify-center bg-gray-100" style={{ height: 160 }}>
                                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                            {/* Orange accent + title */}
                            <div style={{ width: 36, height: 3, background: '#f58634', borderRadius: 2, marginBottom: '0.75rem' }} />
                            <h3 className="text-2xl font-black text-gray-900 uppercase leading-tight mb-3">
                                {viewingEvent.heading || 'Untitled'}
                            </h3>

                            {/* Date */}
                            {viewingEvent.eventDate && (
                                <p className="text-sm font-bold mb-4" style={{ color: '#f58634' }}>
                                    📅 {new Date(viewingEvent.eventDate).toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                            )}

                            {/* Description */}
                            {viewingEvent.description ? (
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    {viewingEvent.description}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm italic mb-6">No description provided.</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setViewingEvent(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => { handleEdit(viewingEvent); setViewingEvent(null); }}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => { handleDelete(viewingEvent.id); setViewingEvent(null); }}
                                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit / Create Modal ──────────────────────────── */}
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
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
