'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './Panel.module.css';
import AdminToast, { useToast } from '../AdminToast';
import AdminConfirm, { useConfirm } from '../AdminConfirm';

function resolveRole() {
    const userData = apiClient.getUserData();
    if (!userData) return 'member';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    if (name.includes('admin')) return 'churchAdmin';
    return 'member';
}

export default function CalendarYearsPanel() {
    const [calendarYears, setCalendarYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCalendarYear, setEditingCalendarYear] = useState(null);
    const [formData, setFormData] = useState({ year: '', label: '' });

    const { toast, notify, clearToast } = useToast();
    const { dialog, confirm, closeDialog } = useConfirm();

    const role = resolveRole();
    const canManage = role === 'churchAdmin' || role === 'superAdmin';

    useEffect(() => { loadCalendarYears(); }, []);

    const loadCalendarYears = async () => {
        try {
            const data = await apiClient.getCalendarYears();
            setCalendarYears(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load calendar years:', error);
            setCalendarYears([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { year: Number(formData.year), label: formData.label || null };
            if (editingCalendarYear) {
                await apiClient.updateCalendarYear(editingCalendarYear.id, payload);
                notify('success', 'Calendar year updated successfully!');
            } else {
                await apiClient.createCalendarYear(payload);
                notify('success', 'Calendar year created successfully!');
            }
            await loadCalendarYears();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save calendar year:', error);
            notify('error', error.message || 'Failed to save calendar year. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const yes = await confirm({
            title: 'Delete Calendar Year',
            message: 'Are you sure you want to delete this calendar year? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        });
        if (!yes) return;

        try {
            await apiClient.deleteCalendarYear(id);
            await loadCalendarYears();
            notify('success', 'Calendar year deleted.');
        } catch (error) {
            console.error('Failed to delete calendar year:', error);
            notify('error', error.message || 'Failed to delete calendar year. Please try again.');
        }
    };

    const handleEdit = (item) => {
        setEditingCalendarYear(item);
        setFormData({ year: item.year ?? '', label: item.label || '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCalendarYear(null);
        setFormData({ year: '', label: '' });
    };

    if (loading && calendarYears.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading calendar years...</p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <AdminToast toast={toast} onClose={clearToast} />
            <AdminConfirm dialog={dialog} onClose={closeDialog} />

            <div className={styles.panelHeader}>
                <h2>Calendar Years</h2>
                {canManage && (
                    <button className={styles.addBtn} onClick={() => setShowModal(true)}>+ Add Calendar Year</button>
                )}
            </div>

            {calendarYears.length === 0 ? (
                <div className={styles.empty}><p>No calendar years found{canManage ? 'ed. Create your first calendar year!' : '.'}</p></div>
            ) : (
                <div className={styles.grid}>
                    {calendarYears.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{item.year}</h3>
                                {item.label && <p>{item.label}</p>}
                                {canManage && (
                                    <div className={styles.cardActions}>
                                        <button className={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {canManage && showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingCalendarYear ? 'Edit Calendar Year' : 'Add New Calendar Year'}</h3>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="year">Year *</label>
                                <input type="number" id="year" value={formData.year} required
                                    min="2000" max="2100"
                                    placeholder="2026"
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="label">Label</label>
                                <input type="text" id="label" value={formData.label}
                                    placeholder="e.g. 2026 - Year of Overflow"
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })} />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? 'Saving...' : editingCalendarYear ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
