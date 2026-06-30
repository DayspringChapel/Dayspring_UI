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
    const [givings, setGivings]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [search, setSearch]           = useState('');

    // modal: null | 'form' | 'preview' | 'delete'
    const [modalType, setModalType]     = useState(null);
    const [selected, setSelected]       = useState(null);   // giving being acted on
    const [editing, setEditing]         = useState(false);  // true = edit, false = create

    const [form, setForm]               = useState(EMPTY_FORM);
    const [saving, setSaving]           = useState(false);
    const [formError, setFormError]     = useState(null);
    const [deleting, setDeleting]       = useState(false);

    const [isRevealed, setIsRevealed]   = useState(false);
    const [copied, setCopied]           = useState(false);

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

    const closeModal = () => {
        setModalType(null);
        setSelected(null);
        setFormError(null);
        setIsRevealed(false);
        setCopied(false);
    };

    const openCreate = () => {
        setEditing(false);
        setForm(EMPTY_FORM);
        setFormError(null);
        setModalType('form');
    };

    const openEdit = (g) => {
        setEditing(true);
        setSelected(g);
        setForm({
            name:            g.name            || '',
            purposeOfGiving: g.purposeOfGiving || '',
            accountNumber:   g.accountNumber   || '',
            accountName:     g.accountName     || '',
            bankName:        g.bankName        || '',
            description:     g.description     || '',
        });
        setFormError(null);
        setModalType('form');
    };

    const openPreview = (g) => {
        setSelected(g);
        setIsRevealed(false);
        setCopied(false);
        setModalType('preview');
    };

    const openDelete = (g) => {
        setSelected(g);
        setModalType('delete');
    };

    const handleField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.name.trim())            { setFormError('Name is required'); return; }
        if (!form.purposeOfGiving.trim()) { setFormError('Purpose of giving is required'); return; }
        if (!form.accountNumber.trim())   { setFormError('Account number is required'); return; }
        if (!form.accountName.trim())     { setFormError('Account name is required'); return; }
        if (!form.bankName.trim())        { setFormError('Bank name is required'); return; }

        setSaving(true);
        setFormError(null);
        const payload = {
            name:            form.name.trim(),
            purposeOfGiving: form.purposeOfGiving.trim(),
            accountNumber:   form.accountNumber.trim(),
            accountName:     form.accountName.trim(),
            bankName:        form.bankName.trim(),
            description:     form.description.trim() || null,
        };
        try {
            if (editing && selected) {
                await apiClient.updateGiving(selected.id, payload);
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

    const handleDelete = async () => {
        if (!selected) return;
        setDeleting(true);
        try {
            await apiClient.deleteGiving(selected.id);
            await load();
            closeModal();
        } catch (err) {
            setFormError(err.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                                <th className={styles.th}>Date Added</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.empty}>
                                        {search
                                            ? 'No accounts match your search'
                                            : 'No giving accounts yet — click "+ Add Account" to begin'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((g) => (
                                    <tr key={g.id} className={styles.tr}>
                                        <td className={styles.td}><strong>{g.name || '—'}</strong></td>
                                        <td className={styles.td}>{g.purposeOfGiving || '—'}</td>
                                        <td className={styles.td}>
                                            <code style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                                                {g.accountNumber || '—'}
                                            </code>
                                        </td>
                                        <td className={styles.td}>{g.accountName || '—'}</td>
                                        <td className={styles.td}>{g.bankName || '—'}</td>
                                        <td className={styles.td}>{formatDate(g.createdDate)}</td>
                                        <td className={styles.td}>
                                            <div className={styles.actionCell}>
                                                <button className={styles.viewBtn} onClick={() => openPreview(g)}>View</button>
                                                <button className={styles.editBtn} onClick={() => openEdit(g)}>Edit</button>
                                                <button className={styles.deleteBtn} onClick={() => openDelete(g)}>Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Form modal (create / edit) ─────────────────────────────── */}
            {modalType === 'form' && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editing ? 'Edit Giving Account' : 'Add Giving Account'}
                            </h3>
                            <button className={styles.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Name *</label>
                                <input className={styles.input} value={form.name}
                                    onChange={(e) => handleField('name', e.target.value)}
                                    placeholder="e.g. Sunday Tithe, Building Fund" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Purpose of Giving *</label>
                                <input className={styles.input} value={form.purposeOfGiving}
                                    onChange={(e) => handleField('purposeOfGiving', e.target.value)}
                                    placeholder="e.g. Weekly tithe for church operations" />
                            </div>

                            <div className={styles.row2}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Account Number *</label>
                                    <input className={styles.input} value={form.accountNumber}
                                        onChange={(e) => handleField('accountNumber', e.target.value)}
                                        placeholder="0123456789" maxLength={20} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Account Name *</label>
                                    <input className={styles.input} value={form.accountName}
                                        onChange={(e) => handleField('accountName', e.target.value)}
                                        placeholder="e.g. Dayspring Chapel" />
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Bank Name *</label>
                                <input className={styles.input} value={form.bankName}
                                    onChange={(e) => handleField('bankName', e.target.value)}
                                    placeholder="e.g. GTBank, Access Bank" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea className={styles.input} value={form.description}
                                    onChange={(e) => handleField('description', e.target.value)}
                                    placeholder="Optional notes about this giving account…"
                                    rows={3} style={{ resize: 'vertical' }} />
                            </div>

                            {formError && <p className={styles.formError}>{formError}</p>}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Preview modal (donate-page style) ─────────────────────── */}
            {modalType === 'preview' && selected && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>{selected.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                                    {selected.purposeOfGiving}
                                </p>
                            </div>
                            <button className={styles.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        <div className={styles.previewBody}>
                            {selected.description && (
                                <p className={styles.previewNote}>{selected.description}</p>
                            )}

                            <div className={styles.revealCard}>
                                {!isRevealed ? (
                                    <div className={styles.revealBlurred}>
                                        <div className={styles.blurredFields}>
                                            <div className={styles.blurredRow}>
                                                <span className={styles.fieldLabel}>Bank Name</span>
                                                <span className={styles.blurText}>****************</span>
                                            </div>
                                            <div className={styles.blurredRow}>
                                                <span className={styles.fieldLabel}>Account Name</span>
                                                <span className={styles.blurText}>****************</span>
                                            </div>
                                            <div className={styles.blurredRow}>
                                                <span className={styles.fieldLabel}>Account Number</span>
                                                <span className={styles.blurTextMono}>**********</span>
                                            </div>
                                        </div>
                                        <button className={styles.revealBtn} onClick={() => setIsRevealed(true)}>
                                            Reveal Account Details
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.revealedFields}>
                                        <div className={styles.revealedRow}>
                                            <span className={styles.fieldLabel}>Bank Name</span>
                                            <span className={styles.fieldValue}>{selected.bankName}</span>
                                        </div>
                                        <div className={styles.revealedRow}>
                                            <span className={styles.fieldLabel}>Account Name</span>
                                            <span className={styles.fieldValue}>{selected.accountName}</span>
                                        </div>
                                        <div className={styles.revealedRow}>
                                            <span className={styles.fieldLabel}>Account Number</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className={styles.fieldValueMono}>{selected.accountNumber}</span>
                                                <button className={styles.copyBtn} onClick={() => handleCopy(selected.accountNumber)}
                                                    title="Copy account number">
                                                    {copied
                                                        ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                        : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    }
                                                </button>
                                            </div>
                                            {copied && <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Copied!</span>}
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                                            Added {formatDate(selected.createdDate)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Close</button>
                            <button className={styles.editBtnModal} onClick={() => { closeModal(); openEdit(selected); }}>
                                Edit Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm delete modal ───────────────────────────────────── */}
            {modalType === 'delete' && selected && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confirmIcon}>🗑</div>
                        <h3 className={styles.confirmTitle}>Remove Giving Account?</h3>
                        <p className={styles.confirmMsg}>
                            <strong>&ldquo;{selected.name}&rdquo;</strong> will be permanently removed.
                            Members will no longer see this account on the giving page.
                        </p>
                        {formError && <p className={styles.formError} style={{ textAlign: 'center' }}>{formError}</p>}
                        <div className={styles.confirmBtns}>
                            <button className={styles.cancelBtn} onClick={closeModal} disabled={deleting}>Cancel</button>
                            <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Removing…' : 'Yes, Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
