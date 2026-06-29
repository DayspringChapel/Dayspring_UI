'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './giving.module.css';

const GIVING_TYPES = ['Tithe', 'Offering', 'Seed', 'Special Pledge', 'Project', 'Mission', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS', 'Online', 'Cheque'];

const EMPTY_FORM = {
    donorName: '',
    amount: '',
    givingType: 'Offering',
    dateOfGiving: '',
    paymentMethod: 'Cash',
    description: '',
};

function formatAmount(amount) {
    if (!amount && amount !== 0) return '—';
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

export default function GivingPage() {
    const [givings, setGivings]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const [modal, setModal]         = useState(null); // null | 'create' | 'edit'
    const [editing, setEditing]     = useState(null);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [saving, setSaving]       = useState(false);
    const [formError, setFormError] = useState(null);

    const [deleting, setDeleting]   = useState(null);
    const [search, setSearch]       = useState('');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getGivings();
            setGivings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load giving records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setForm({ ...EMPTY_FORM, dateOfGiving: new Date().toISOString().split('T')[0] });
        setEditing(null);
        setFormError(null);
        setModal('create');
    };

    const openEdit = (giving) => {
        setForm({
            donorName:     giving.donorName || '',
            amount:        giving.amount != null ? String(giving.amount) : '',
            givingType:    giving.givingType || 'Offering',
            dateOfGiving:  giving.dateOfGiving ? giving.dateOfGiving.split('T')[0] : '',
            paymentMethod: giving.paymentMethod || 'Cash',
            description:   giving.description || '',
        });
        setEditing(giving);
        setFormError(null);
        setModal('edit');
    };

    const closeModal = () => { setModal(null); setEditing(null); setFormError(null); };

    const handleField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.donorName.trim())    { setFormError('Donor name is required'); return; }
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
            setFormError('Enter a valid amount'); return;
        }
        if (!form.dateOfGiving)        { setFormError('Date is required'); return; }

        setSaving(true);
        setFormError(null);
        const payload = {
            donorName:     form.donorName.trim(),
            amount:        Number(form.amount),
            givingType:    form.givingType,
            dateOfGiving:  form.dateOfGiving,
            paymentMethod: form.paymentMethod,
            description:   form.description.trim(),
        };

        try {
            if (modal === 'edit' && editing) {
                await apiClient.updateGiving(editing.id, payload);
            } else {
                await apiClient.createGiving(payload);
            }
            await load();
            closeModal();
        } catch (err) {
            setFormError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (giving) => {
        if (!window.confirm(`Delete giving record for "${giving.donorName}"? This cannot be undone.`)) return;
        setDeleting(giving.id);
        try {
            await apiClient.deleteGiving(giving.id);
            await load();
        } catch (err) {
            alert(err.message || 'Failed to delete');
        } finally {
            setDeleting(null);
        }
    };

    const filtered = givings.filter((g) => {
        const q = search.toLowerCase();
        return (
            g.donorName?.toLowerCase().includes(q) ||
            g.givingType?.toLowerCase().includes(q) ||
            g.paymentMethod?.toLowerCase().includes(q)
        );
    });

    const totalAmount = filtered.reduce((sum, g) => sum + (Number(g.amount) || 0), 0);

    const columns = [
        { key: 'donorName',     label: 'Donor' },
        { key: 'amount',        label: 'Amount',  render: (v) => <strong>{formatAmount(v)}</strong> },
        { key: 'givingType',    label: 'Type' },
        { key: 'paymentMethod', label: 'Method' },
        { key: 'dateOfGiving',  label: 'Date',    render: (v) => formatDate(v) },
        { key: 'description',   label: 'Note',    render: (v) => v || '—' },
    ];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>Giving</h1>
                    <p>Track and manage all church giving records</p>
                </div>
                <button className={styles.addBtn} onClick={openCreate}>+ Add Record</button>
            </div>

            {/* Summary */}
            <div className={styles.summaryBar}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total Records</span>
                    <span className={styles.summaryValue}>{filtered.length}</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total Amount</span>
                    <span className={styles.summaryValue} style={{ color: '#d9752c' }}>{formatAmount(totalAmount)}</span>
                </div>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by donor, type or payment method…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
            />

            {/* States */}
            {loading && (
                <div className={styles.stateBox}>
                    <div className={styles.spinner} />
                    <p>Loading giving records…</p>
                </div>
            )}
            {!loading && error && (
                <div className={styles.stateBox}>
                    <p style={{ color: '#dc2626' }}>{error}</p>
                    <button className={styles.retryBtn} onClick={load}>Retry</button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {columns.map((c) => (
                                    <th key={c.key} className={styles.th}>{c.label}</th>
                                ))}
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className={styles.empty}>
                                        {search ? 'No records match your search' : 'No giving records yet — click "+ Add Record" to begin'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((g) => (
                                    <tr key={g.id} className={styles.tr}>
                                        {columns.map((c) => (
                                            <td key={c.key} className={styles.td}>
                                                {c.render ? c.render(g[c.key]) : (g[c.key] || '—')}
                                            </td>
                                        ))}
                                        <td className={styles.td}>
                                            <div className={styles.actionCell}>
                                                <button className={styles.editBtn} onClick={() => openEdit(g)}>Edit</button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(g)}
                                                    disabled={deleting === g.id}
                                                >
                                                    {deleting === g.id ? '…' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {modal === 'edit' ? 'Edit Giving Record' : 'Add Giving Record'}
                            </h3>
                            <button className={styles.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Donor Name *</label>
                                <input
                                    className={styles.input}
                                    value={form.donorName}
                                    onChange={(e) => handleField('donorName', e.target.value)}
                                    placeholder="Full name of donor"
                                />
                            </div>

                            <div className={styles.row2}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Amount (₦) *</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(e) => handleField('amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Date *</label>
                                    <input
                                        className={styles.input}
                                        type="date"
                                        value={form.dateOfGiving}
                                        onChange={(e) => handleField('dateOfGiving', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.row2}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Giving Type</label>
                                    <select
                                        className={styles.input}
                                        value={form.givingType}
                                        onChange={(e) => handleField('givingType', e.target.value)}
                                    >
                                        {GIVING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Payment Method</label>
                                    <select
                                        className={styles.input}
                                        value={form.paymentMethod}
                                        onChange={(e) => handleField('paymentMethod', e.target.value)}
                                    >
                                        {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Note (optional)</label>
                                <textarea
                                    className={styles.input}
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => handleField('description', e.target.value)}
                                    placeholder="Any additional notes"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            {formError && <p className={styles.formError}>{formError}</p>}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Add Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
