'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CountdownBadge from '@/components/CountdownTimer';

function formatDate(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
        });
    } catch { return null; }
}

const FALLBACKS = ['/upcoming-events-1.png', '/upcoming-events-2.png', '/upcoming-events-3.png'];

// Transform config per stack position (0 = active front, 1 = 1st behind, …)
const STACK = [
    { tx: 0,  ty: 0,   rot: 0,    scale: 1,    opacity: 1,    z: 30 },
    { tx: 28, ty: -28, rot: 2.5,  scale: 0.97, opacity: 0.88, z: 20 },
    { tx: 52, ty: -52, rot: -1.5, scale: 0.94, opacity: 0.70, z: 10 },
    { tx: 70, ty: -70, rot: 1,    scale: 0.91, opacity: 0.45, z: 5  },
];

export default function EventsCarousel({ events }) {
    const [active, setActive] = useState(0);

    if (!events || events.length === 0) return null;

    const go = (dir) => setActive((a) => (a + dir + events.length) % events.length);

    return (
        <div>
            {/* ── Card stack ─────────────────────────────────────────── */}
            {/* Container height + extra space for the stack peeking above/right */}
            <div className="relative" style={{ height: 580, paddingTop: 72, paddingRight: 72 }}>
                {events.map((event, i) => {
                    const pos = (i - active + events.length) % events.length;
                    const cfg = STACK[Math.min(pos, STACK.length - 1)];
                    const isActive = pos === 0;
                    const tooFar = pos >= STACK.length;

                    const title   = (event.heading || event.title || '').toUpperCase();
                    const dateStr = event.eventDate || event.datetime;
                    const date    = formatDate(dateStr);
                    const img     = event.eventImage || FALLBACKS[i % 3];

                    return (
                        <div
                            key={event.id}
                            onClick={!isActive ? () => setActive(i) : undefined}
                            style={{
                                position: 'absolute',
                                // Base position: inset within the padding area
                                top: 72, left: 0, right: 72, bottom: 0,
                                transform: `translate(${cfg.tx}px, ${cfg.ty}px) rotate(${cfg.rot}deg) scale(${cfg.scale})`,
                                opacity: tooFar ? 0 : cfg.opacity,
                                zIndex: tooFar ? 0 : cfg.z,
                                transition: 'all 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)',
                                cursor: isActive ? 'default' : 'pointer',
                                pointerEvents: tooFar ? 'none' : 'auto',
                                transformOrigin: 'bottom left',
                            }}
                        >
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={img}
                                    alt={title || 'Event'}
                                    fill
                                    className="object-cover object-center"
                                    style={{ transition: 'transform 0.6s ease', transform: isActive ? 'scale(1.03)' : 'scale(1)' }}
                                    unoptimized
                                    priority={isActive}
                                />

                                {/* Gradient */}
                                <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.15) 100%)' }} />

                                {/* Countdown */}
                                {dateStr && isActive && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <CountdownBadge targetDate={dateStr} />
                                    </div>
                                )}

                                {/* "Click to view" hint for behind cards */}
                                {!isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                                        style={{ background: 'rgba(0,0,0,0.30)' }}>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px',
                                            padding: '0.5rem 1.25rem', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                                        }}>
                                            Click to view
                                        </span>
                                    </div>
                                )}

                                {/* Card body — only fully rendered for active */}
                                <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                                    {/* Orange accent line */}
                                    <div style={{ width: 36, height: 3, background: '#f58634', borderRadius: 2, marginBottom: '0.8rem' }} />

                                    <h3 className="font-black text-white leading-tight"
                                        style={{ fontSize: isActive ? '1.6rem' : '1.15rem', marginBottom: '0.4rem' }}>
                                        {title}
                                    </h3>

                                    {date && (
                                        <p style={{
                                            color: '#f58634', fontWeight: 700,
                                            fontSize: isActive ? '0.88rem' : '0.75rem',
                                            marginBottom: isActive ? '0.85rem' : 0,
                                        }}>
                                            📅 {date}
                                        </p>
                                    )}

                                    {isActive && event.description && (
                                        <p style={{
                                            color: 'rgba(255,255,255,0.68)', fontSize: '0.9rem',
                                            lineHeight: 1.6, marginBottom: '1.25rem',
                                            display: '-webkit-box', WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {event.description}
                                        </p>
                                    )}

                                    {isActive && (
                                        <Link
                                            href={`/content/event/${event.id}`}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                background: '#f58634', color: '#fff',
                                                padding: '0.7rem 1.6rem', borderRadius: '999px',
                                                fontWeight: 800, fontSize: '0.88rem',
                                                boxShadow: '0 4px 20px rgba(245,134,52,0.45)',
                                            }}
                                            className="hover:brightness-110 active:scale-95 transition-all"
                                        >
                                            View Full Details
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Navigation ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mt-6 px-1">
                {/* Pill dots */}
                <div className="flex items-center gap-2">
                    {events.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                                width: i === active ? 28 : 8, height: 8,
                                borderRadius: 4, padding: 0, border: 'none', cursor: 'pointer',
                                background: i === active ? '#f58634' : '#d1d5db',
                                transition: 'all 0.3s ease',
                            }}
                            aria-label={`Go to event ${i + 1}`}
                        />
                    ))}
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 600 }}>
                        {active + 1} / {events.length}
                    </span>
                </div>

                {/* Arrow buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => go(-1)}
                        aria-label="Previous"
                        style={{
                            width: 44, height: 44, borderRadius: '50%', border: '1.5px solid #e5e7eb',
                            background: '#fff', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#374151', transition: 'all 0.2s',
                        }}
                        className="hover:border-orange-400 hover:text-orange-500"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => go(1)}
                        aria-label="Next"
                        style={{
                            width: 44, height: 44, borderRadius: '50%', border: 'none',
                            background: '#f58634', color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(245,134,52,0.40)', transition: 'all 0.2s',
                        }}
                        className="hover:brightness-110"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
