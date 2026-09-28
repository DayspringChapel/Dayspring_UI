'use client';

import { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import Portal from '@/components/ui/Portal';

/**
 * A lightweight, dependency-free guided tour: dims the page, cuts a spotlight around each step's
 * target element (found via `[data-tour="<id>"]`), and shows a small card with next/back/skip.
 *
 * `steps`: [{ id, title, content, placement? }] — `id` must match a `data-tour` attribute
 * somewhere on the page. A step whose target isn't currently on screen is skipped automatically,
 * so the same step list is safe to reuse even if a permission-gated element is hidden for this user.
 *
 * Auto-starts once per `storageKey` (role-scoped), then only replays when `restartSignal` changes
 * — pair with a "Take the tour" button that bumps a counter.
 */
export default function DashboardTour({ steps, storageKey, restartSignal }) {
    const [active, setActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState(null);
    const [availableSteps, setAvailableSteps] = useState([]);

    const seenKey = `dayspring_tour_seen_${storageKey}`;

    const computeAvailable = useCallback(() => {
        return steps.filter((s) => document.querySelector(`[data-tour="${s.id}"]`));
    }, [steps]);

    // First-visit auto-start.
    useEffect(() => {
        let seen = false;
        try { seen = localStorage.getItem(seenKey) === '1'; } catch { /* private mode etc. */ }
        if (seen) return;

        const id = requestAnimationFrame(() => {
            const found = computeAvailable();
            if (found.length > 0) {
                setAvailableSteps(found);
                setStepIndex(0);
                setActive(true);
            }
        });
        return () => cancelAnimationFrame(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Manual replay.
    useEffect(() => {
        if (restartSignal === undefined || restartSignal === 0) return;
        const found = computeAvailable();
        if (found.length === 0) return;
        setAvailableSteps(found);
        setStepIndex(0);
        setActive(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restartSignal]);

    const finish = useCallback(() => {
        setActive(false);
        try { localStorage.setItem(seenKey, '1'); } catch { /* ignore */ }
    }, [seenKey]);

    const current = availableSteps[stepIndex];

    const updateRect = useCallback(() => {
        if (!current) return;
        const el = document.querySelector(`[data-tour="${current.id}"]`);
        if (!el) { setStepIndex((i) => Math.min(i + 1, availableSteps.length)); return; }
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }, [current, availableSteps.length]);

    useLayoutEffect(() => {
        if (!active || !current) return;
        const id = requestAnimationFrame(updateRect);
        return () => cancelAnimationFrame(id);
    }, [active, current, updateRect]);

    useEffect(() => {
        if (!active) return;
        const onEvent = () => updateRect();
        window.addEventListener('resize', onEvent);
        window.addEventListener('scroll', onEvent, true);
        const onKey = (e) => { if (e.key === 'Escape') finish(); };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('resize', onEvent);
            window.removeEventListener('scroll', onEvent, true);
            window.removeEventListener('keydown', onKey);
        };
    }, [active, updateRect, finish]);

    if (!active || !current || !rect) return null;

    const pad = 8;
    const spot = {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
    };

    // Card goes below the spotlight, or above if there isn't room.
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const cardWidth = 320;
    const spaceBelow = viewportH - (spot.top + spot.height);
    const placeAbove = spaceBelow < 180 && spot.top > 180;
    const cardTop = placeAbove ? Math.max(12, spot.top - 168) : Math.min(spot.top + spot.height + 14, viewportH - 180);
    const cardLeft = Math.min(Math.max(spot.left, 12), viewportW - cardWidth - 12);

    const isLast = stepIndex === availableSteps.length - 1;

    return (
        <Portal>
            <div
                aria-hidden="true"
                onClick={finish}
                style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(8, 11, 20, 0.72)',
                    clipPath: `polygon(
                        0% 0%, 0% 100%, ${spot.left}px 100%, ${spot.left}px ${spot.top}px,
                        ${spot.left + spot.width}px ${spot.top}px, ${spot.left + spot.width}px ${spot.top + spot.height}px,
                        ${spot.left}px ${spot.top + spot.height}px, ${spot.left}px 100%, 100% 100%, 100% 0%
                    )`,
                    transition: 'clip-path 0.25s ease',
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    top: spot.top, left: spot.left, width: spot.width, height: spot.height,
                    zIndex: 2001, borderRadius: '0.75rem',
                    boxShadow: '0 0 0 3px #d9752c, 0 0 24px rgba(217,117,44,0.55)',
                    pointerEvents: 'none', transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
                }}
            />
            <div
                role="dialog"
                aria-label="Dashboard tour"
                style={{
                    position: 'fixed', top: cardTop, left: cardLeft, width: cardWidth,
                    zIndex: 2002, background: '#fff', borderRadius: '1rem',
                    padding: '1.1rem 1.25rem', boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                    fontFamily: 'inherit',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em' }}>
                        STEP {stepIndex + 1} OF {availableSteps.length}
                    </span>
                    <button
                        type="button" onClick={finish} aria-label="Close tour"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1, padding: '0.2rem' }}
                    >✕</button>
                </div>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 800, color: '#172033' }}>{current.title}</h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>{current.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        type="button" onClick={finish}
                        style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: '0.4rem 0' }}
                    >
                        Skip
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {stepIndex > 0 && (
                            <button
                                type="button" onClick={() => setStepIndex((i) => i - 1)}
                                style={{ border: '1.5px solid #e2e8f0', background: '#fff', color: '#334155', borderRadius: '0.5rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => (isLast ? finish() : setStepIndex((i) => i + 1))}
                            style={{ border: 'none', background: '#d9752c', color: '#fff', borderRadius: '0.5rem', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                            {isLast ? 'Done' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
