'use client';

import { useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';
import Portal from '@/components/ui/Portal';
import styles from './ImportCsvControl.module.css';

/**
 * "Download Template" + "Import CSV" for a bulk-import endpoint (units, small-groups, members,
 * children). Each row in the file is validated and created independently on the server, so a
 * bad row is reported by number instead of failing the whole file.
 */
export default function ImportCsvControl({ kind, label, onImported }) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const reset = () => {
        setFile(null);
        setResult(null);
        setError('');
    };

    const closeModal = () => {
        setOpen(false);
        reset();
    };

    const handleDownloadTemplate = async () => {
        try {
            await apiClient.downloadImportTemplate(kind);
        } catch (err) {
            setError(err.message || 'Failed to download the template.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const res = await apiClient.importCsv(kind, file);
            setResult(res);
            if ((res?.successCount ?? res?.SuccessCount ?? 0) > 0) onImported?.();
        } catch (err) {
            setError(err.message || 'Import failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const success = result?.successCount ?? result?.SuccessCount ?? 0;
    const failed = result?.failCount ?? result?.FailCount ?? 0;
    const errors = result?.errors ?? result?.Errors ?? [];

    return (
        <div className={styles.group}>
            <button type="button" className={styles.btn} onClick={handleDownloadTemplate}>
                ⬇ {label} Template
            </button>
            <button type="button" className={styles.btn} onClick={() => setOpen(true)}>
                ⬆ Import {label}
            </button>

            {open && (
                <Portal>
                    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                        <div className={styles.modal}>
                            <h2>Import {label} from CSV</h2>
                            <p className={styles.hint}>
                                Download the <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTemplate(); }}>CSV template</a> first
                                so your columns match exactly.
                            </p>

                            {!result && (
                                <>
                                    <div className={styles.dropzone}>
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            accept=".csv,text/csv"
                                            style={{ display: 'none' }}
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <button type="button" className={styles.btn} onClick={() => inputRef.current?.click()}>
                                            Choose CSV File
                                        </button>
                                        {file && <p className={styles.fileName}>{file.name}</p>}
                                    </div>
                                    {error && <p className={styles.errorRow}><b>{error}</b></p>}
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                                        <button type="button" className={styles.submitBtn} onClick={handleUpload} disabled={!file || uploading}>
                                            {uploading ? 'Importing…' : 'Import'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {result && (
                                <>
                                    <div className={styles.resultSummary}>
                                        <span className={styles.resultOk}>✓ {success} imported</span>
                                        {failed > 0 && <span className={styles.resultFail}>✗ {failed} failed</span>}
                                    </div>
                                    {errors.length > 0 && (
                                        <div className={styles.errorList}>
                                            {errors.map((e, i) => (
                                                <div key={i} className={styles.errorRow}>
                                                    <b>Row {e.row ?? e.Row}:</b> {e.message ?? e.Message}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.cancelBtn} onClick={reset}>Import Another File</button>
                                        <button type="button" className={styles.submitBtn} onClick={closeModal}>Done</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}
