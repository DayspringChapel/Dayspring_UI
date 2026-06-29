'use client';

import { useEffect, useState } from 'react';

const ICONS = {
    success: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    error: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    info: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    warning: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
};

const STYLES = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', text: '#15803d', bar: '#22c55e' },
    error:   { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#b91c1c', bar: '#ef4444' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1d4ed8', bar: '#3b82f6' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#b45309', bar: '#f59e0b' },
};

export default function AdminToast({ toast, onClose }) {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!toast) { setVisible(false); return; }
        setVisible(true);
        setProgress(100);
        const duration = 3500;
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining === 0) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [toast]);

    if (!toast) return null;

    const type = toast.type || 'info';
    const s = STYLES[type] || STYLES.info;

    return (
        <div
            style={{
                position: 'fixed',
                top: '1.25rem',
                right: '1.5rem',
                zIndex: 9999,
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.95)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
                minWidth: 300,
                maxWidth: 420,
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: '0.875rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}
        >
            {/* Progress bar */}
            <div style={{ height: 3, background: s.border, position: 'relative' }}>
                <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${progress}%`, background: s.bar,
                    transition: 'width 0.05s linear',
                }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem' }}>
                <span style={{ color: s.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[type]}</span>
                <p style={{ flex: 1, margin: 0, fontSize: '0.88rem', fontWeight: 600, color: s.text, lineHeight: 1.5 }}>
                    {toast.message}
                </p>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: s.icon, padding: 2, flexShrink: 0, opacity: 0.7,
                        lineHeight: 1, marginTop: 1,
                    }}
                    aria-label="Dismiss"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState(null);
    const [timer, setTimer] = useState(null);

    const notify = (type, message) => {
        if (timer) clearTimeout(timer);
        setToast({ type, message, id: Date.now() });
        const t = setTimeout(() => setToast(null), 3500);
        setTimer(t);
    };

    return { toast, notify, clearToast: () => setToast(null) };
}
