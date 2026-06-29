'use client';

import { useState, useEffect } from 'react';

function calcTimeLeft(targetDate) {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (!targetDate || isNaN(diff)) return null;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    return {
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        over:    false,
    };
}

// ── Large hero countdown (white tiles with orange accent) ─────────────────────
export function HeroCountdown({ targetDate }) {
    const [t, setT] = useState(null);

    useEffect(() => {
        setT(calcTimeLeft(targetDate));
        const id = setInterval(() => setT(calcTimeLeft(targetDate)), 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    if (!t) return null;
    if (t.over) return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.40)',
            borderRadius: '999px', padding: '0.45rem 1.2rem',
            color: '#fca5a5', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em',
        }}>
            🔴 Happening Now
        </span>
    );

    const units = [
        { val: t.days,    label: 'Days' },
        { val: t.hours,   label: 'Hrs' },
        { val: t.minutes, label: 'Mins' },
        { val: t.seconds, label: 'Secs' },
    ];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {units.map(({ val, label }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.14)', borderRadius: '0.7rem',
                            padding: '0.7rem 1.1rem', minWidth: '3.5rem',
                            fontWeight: 900, fontSize: '2rem', color: '#fff', lineHeight: 1,
                            fontVariantNumeric: 'tabular-nums', textAlign: 'center',
                        }}>
                            {String(val).padStart(2, '0')}
                        </div>
                        <div style={{
                            marginTop: '0.3rem', fontSize: '0.65rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            color: 'rgba(255,255,255,0.55)', textAlign: 'center',
                        }}>
                            {label}
                        </div>
                    </div>
                    {i < 3 && (
                        <span style={{
                            color: 'rgba(255,255,255,0.35)', fontSize: '1.6rem',
                            fontWeight: 900, lineHeight: 1, marginTop: '0.5rem',
                        }}>:</span>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Small badge countdown (overlaid on cards) ─────────────────────────────────
export default function CountdownBadge({ targetDate, dark = false }) {
    const [t, setT] = useState(null);

    useEffect(() => {
        setT(calcTimeLeft(targetDate));
        const id = setInterval(() => setT(calcTimeLeft(targetDate)), 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    if (!t) return null;
    if (t.over) return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            background: 'rgba(220,38,38,0.85)', color: '#fff',
            borderRadius: '999px', padding: '0.22rem 0.7rem',
            fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em',
        }}>
            🔴 Now
        </span>
    );

    const parts = [];
    if (t.days > 0)  parts.push(`${t.days}d`);
    parts.push(`${String(t.hours).padStart(2, '0')}h`);
    parts.push(`${String(t.minutes).padStart(2, '0')}m`);
    if (t.days === 0) parts.push(`${String(t.seconds).padStart(2, '0')}s`);

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: dark ? 'rgba(245,134,52,0.12)' : 'rgba(0,0,0,0.60)',
            backdropFilter: dark ? 'none' : 'blur(6px)',
            border: `1px solid ${dark ? 'rgba(245,134,52,0.35)' : 'rgba(245,134,52,0.50)'}`,
            color: '#f58634', borderRadius: '999px',
            padding: '0.22rem 0.7rem', fontSize: '0.7rem',
            fontWeight: 800, letterSpacing: '0.03em', fontVariantNumeric: 'tabular-nums',
        }}>
            ⏱ {parts.join(' : ')}
        </span>
    );
}
