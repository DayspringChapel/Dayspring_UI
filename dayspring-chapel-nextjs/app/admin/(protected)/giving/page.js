'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './giving.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

const EMPTY_FORM = {
    name: '',
    purposeOfGiving: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    description: '',
};

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

    const [modal, setModal]         = useState(false);
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
            setError(err.message || 'Failed to load giving accounts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setFormError(null);
        setModal(true);
    };

    const closeModal = () => { setModal(false); setFormError(null); };

    const handleField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.name.trim())            { setFormError('Name is required'); return; }
        if (!form.purposeOfGiving.trim()) { setFormError('Purpose of giving is required'); return; }
        if (!form.accountNumber.trim())   { setFormError('Account number is required'); return; }
        if (!form.accountName.trim())     { setFormError('Account name is required'); return; }
        if (!form.bankName.trim())        { setFormError('Bank name is required'); return; }

        setSaving(true);
        setFormError(null);
        try {
            await apiClient.createGiving({
                name:            form.name.trim(),
                purposeOfGiving: form.purposeOfGiving.trim(),
                accountNumber:   form.accountNumber.trim(),
                accountName:     form.accountName.trim(),
                bankName:        form.bankName.trim(),
                description:     form.description.trim() || null,
            });
            await load();
            closeModal();
        } catch (err) {
            setFormError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (giving) => {
        if (!window.confirm(`Remove "${giving.name}" giving account? This cannot be undone.`)) return;
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
            g.name?.toLowerCase().includes(q) ||
            g.purposeOfGiving?.toLowerCase().includes(q) ||
            g.accountName?.toLowerCase().includes(q) ||
            g.bankName?.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q)
        );
    });

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>Giving Accounts</h1>
                    <p>Manage bank account details for each type of church giving</p>
                </div>
                <button className={styles.addBtn} onClick={openCreate}>+ Add Account</button>
            </div>

            {/* Summary */}
            <div className={styles.summaryBar}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total Accounts</span>
                    <span className={styles.summaryValue}>{filtered.length}</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Banks</span>
                    <span className={styles.summaryValue}>
                        {new Set(filtered.map((g) => g.bankName).filter(Boolean)).size}
                    </span>
                </div>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by name, purpose, account name or bank…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
            />

            {/* States */}
            {loading && <LoadingSpinner message="Loading giving accounts" minHeight="280px" />}
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
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Purpose</th>
                                <th className={styles.th}>Account Number</th>
                                <th className={styles.th}>Account Name</th>
                                <th className={styles.th}>Bank</th>
                                <th className={styles.th}>Description</th>
                                <th className={styles.th}>Date Added</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.empty}>
                                        {search
                                            ? 'No accounts match your search'
                                            : 'No giving accounts yet — click "+ Add Account" to begin'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((g) => (
                                    <tr key={g.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <strong>{g.name || '—'}</strong>
                                        </td>
                                        <td className={styles.td}>{g.purposeOfGiving || '—'}</td>
                                        <td className={styles.td}>
                                            <code style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                                                {g.accountNumber || '—'}
                                            </code>
                                        </td>
                                        <td className={styles.td}>{g.accountName || '—'}</td>
                                        <td className={styles.td}>{g.bankName || '—'}</td>
                                        <td className={styles.td}>
                                            <span style={{ color: '#9ca3af', fontStyle: g.description ? 'normal' : 'italic' }}>
                                                {g.description || 'None'}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{formatDate(g.createdDate)}</td>
                                        <td className={styles.td}>
                                            <div className={styles.actionCell}>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(g)}
                                                    disabled={deleting === g.id}
                                                >
                                                    {deleting === g.id ? '…' : 'Remove'}
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

            {/* Create modal */}
            {modal && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Add Giving Account</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Name *</label>
                                <input
                                    className={styles.input}
                                    value={form.name}
                                    onChange={(e) => handleField('name', e.target.value)}
                                    placeholder="e.g. Sunday Tithe, Building Fund"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Purpose of Giving *</label>
                                <input
                                    className={styles.input}
                                    value={form.purposeOfGiving}
                                    onChange={(e) => handleField('purposeOfGiving', e.target.value)}
                                    placeholder="e.g. Weekly tithe for church operations"
                                />
                            </div>

                            <div className={styles.row2}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Account Number *</label>
                                    <input
                                        className={styles.input}
                                        value={form.accountNumber}
                                        onChange={(e) => handleField('accountNumber', e.target.value)}
                                        placeholder="0123456789"
                                        maxLength={20}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Account Name *</label>
                                    <input
                                        className={styles.input}
                                        value={form.accountName}
                                        onChange={(e) => handleField('accountName', e.target.value)}
                                        placeholder="e.g. Dayspring Chapel"
                                    />
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Bank Name *</label>
                                <input
                                    className={styles.input}
                                    value={form.bankName}
                                    onChange={(e) => handleField('bankName', e.target.value)}
                                    placeholder="e.g. GTBank, Access Bank"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.input}
                                    value={form.description}
                                    onChange={(e) => handleField('description', e.target.value)}
                                    placeholder="Optional notes about this giving account…"
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            {formError && <p className={styles.formError}>{formError}</p>}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : 'Add Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
