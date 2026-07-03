'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

function toDatetimeLocal(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ChurchProgramsPanel() {
    const [programs, setPrograms] = useState([]);
    const [calendarYears, setCalendarYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', programDate: '', calendarYearId: '' });

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    useEffect(() => { loadPrograms(); }, []);
    useEffect(() => {
        apiClient.getCalendarYears().then(setCalendarYears).catch(() => setCalendarYears([]));
    }, []);

    const loadPrograms = async () => {
        try {
            const data = await apiClient.getChurchPrograms();
            setPrograms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load programs:', error);
            setPrograms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description || null,
                programDate: formData.programDate ? new Date(formData.programDate).toISOString() : null,
                calendarYearId: formData.calendarYearId || null,
            };
            if (editingProgram) {
                await apiClient.updateChurchProgram(editingProgram.id, payload);
                notify('success', 'Program updated successfully!');
            } else {
                await apiClient.createChurchProgram(payload);
                notify('success', 'Program created successfully!');
            }
            await loadPrograms();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save program:', error);
            notify('error', error.message || 'Failed to save program. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const yes = await confirm({
            title: 'Delete Program',
            message: 'Are you sure you want to delete this program? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;

        try {
            await apiClient.deleteChurchProgram(id);
            await loadPrograms();
            notify('success', 'Program deleted.');
        } catch (error) {
            console.error('Failed to delete program:', error);
            notify('error', error.message || 'Failed to delete program. Please try again.');
        }
    };

    const handleEdit = (item) => {
        setEditingProgram(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            programDate: toDatetimeLocal(item.programDate),
            calendarYearId: item.calendarYearId || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProgram(null);
        setFormData({ title: '', description: '', programDate: '', calendarYearId: '' });
    };

    if (loading && programs.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading programs...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <h2>Church Programs / Services</h2>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Program</button>
            </div>

            {programs.length === 0 ? (
                <div className={styles.empty}><p>No programs found. Create your first program!</p></div>
            ) : (
                <div className={styles.grid}>
                    {programs.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                {item.programDate && (
                                    <p className={styles.cardDescription}>
                                        {new Date(item.programDate).toLocaleString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                )}
                                {item.description && <p className={styles.cardDescription}>{item.description}</p>}
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>Delete</button>
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
                            <h3>{editingProgram ? 'Edit Program' : 'Add New Program'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Title *</label>
                                <input type="text" id="title" value={formData.title} required
                                    placeholder="e.g. Sunday Service, Bible Study"
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="programDate">Date & Time *</label>
                                <input type="datetime-local" id="programDate" value={formData.programDate} required
                                    onChange={(e) => setFormData({ ...formData, programDate: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description</label>
                                <textarea id="description" value={formData.description} rows={3}
                                    placeholder="Optional details"
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="calendarYearId">Calendar Year</label>
                                <select id="calendarYearId" value={formData.calendarYearId}
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
                                    {saving ? 'Saving...' : editingProgram ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
