'use client';

import { useState } from 'react';

export default function AdminConfirm({ dialog, onClose }) {
    if (!dialog) return null;

    const {
        title = 'Confirm Action',
        message,
        confirmLabel = 'Confirm',
        cancelLabel  = 'Cancel',
        danger       = false,
        onConfirm,
    } = dialog;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9000,
                background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                animation: 'fadeIn 0.15s ease',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff', borderRadius: '1rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: 420,
                    padding: '1.75rem',
                    animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: danger ? '#fef2f2' : '#f0f9ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                }}>
                    {danger ? (
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                    ) : (
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    )}
                </div>

                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>
                    {title}
                </h3>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '0.7rem', borderRadius: '0.625rem',
                            border: '1.5px solid #e2e8f0', background: '#fff',
                            color: '#374151', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '0.7rem', borderRadius: '0.625rem',
                            border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                            background: danger ? '#dc2626' : '#f58634',
                            color: '#fff',
                            boxShadow: danger
                                ? '0 4px 14px rgba(220,38,38,0.35)'
                                : '0 4px 14px rgba(245,134,52,0.35)',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

export function useConfirm() {
    const [dialog, setDialog] = useState(null);

    const confirm = ({ title, message, confirmLabel = 'Confirm', danger = false }) =>
        new Promise((resolve) => {
            setDialog({
                title, message, confirmLabel, danger,
                onConfirm: () => { resolve(true);  setDialog(null); },
            });
        });

    return { dialog, confirm, closeDialog: () => setDialog(null) };
}
