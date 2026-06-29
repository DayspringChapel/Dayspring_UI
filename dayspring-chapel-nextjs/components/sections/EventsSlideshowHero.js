'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import { HeroCountdown } from '@/components/CountdownTimer';
import PageHero from './PageHero';

export default function EventsSlideshowHero() {
    const { events, loading } = useEvents();
    const [featured, setFeatured] = useState(null);

    useEffect(() => {
        if (!events || events.length === 0) return;
        const now = new Date();
        const upcoming = events
            .filter((e) => {
                const d = new Date(e.eventDate || e.datetime || e.date || 0);
                return d >= now;
            })
            .sort((a, b) =>
                new Date(a.eventDate || a.datetime || 0) -
                new Date(b.eventDate || b.datetime || 0)
            );
        setFeatured(upcoming[0] || events[0]);
    }, [events]);

    if (loading || !featured) {
        return (
            <PageHero
                title="EVENTS"
                subtitle="Join us for these life-changing events and encounters."
                bgImage="/about-cover.png"
            />
        );
    }

    const title       = (featured.heading || featured.title || 'Upcoming Event').toUpperCase();
    const dateStr     = featured.eventDate || featured.datetime;
    const location    = featured.location;
    const image       = featured.eventImage || '/about-cover.png';
    const description = featured.description;
    const isUpcoming  = dateStr && new Date(dateStr) > new Date();

    const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : null;

    return (
        <div className="relative w-full overflow-hidden bg-black" style={{ height: '88vh', minHeight: 520 }}>
            {/* Background image */}
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover object-center"
                style={{ opacity: 0.45 }}
                priority
                unoptimized
            />

            {/* Layered gradient — dark at bottom for text legibility */}
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)' }} />

            {/* Subtle left vignette */}
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end pb-16 px-6 md:px-16"
                style={{ maxWidth: '72rem', width: '100%', margin: '0 auto', left: 0, right: 0 }}>

                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(245,134,52,0.20)', border: '1px solid rgba(245,134,52,0.50)',
                    borderRadius: '999px', padding: '0.3rem 1rem',
                    color: '#f58634', fontSize: '0.75rem', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    width: 'fit-content', marginBottom: '1.25rem',
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f58634', display: 'inline-block' }} />
                    {isUpcoming ? 'Next Event' : 'Featured Event'}
                </div>

                {/* Title */}
                <h1 className="font-black text-white leading-none mb-4 uppercase"
                    style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
                    {title}
                </h1>

                {/* Date + location */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4"
                    style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>
                    {formattedDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f58634" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {formattedDate}
                        </span>
                    )}
                    {location && (
                        <>
                            <span className="hidden md:inline" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f58634" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                                {location}
                            </span>
                        </>
                    )}
                </div>

                {/* Description snippet */}
                {description && (
                    <p className="mb-5" style={{
                        color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: '36rem',
                        lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {description}
                    </p>
                )}

                {/* Countdown */}
                {isUpcoming && (
                    <div className="mb-6">
                        <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.6rem' }}>
                            Starts In
                        </p>
                        <HeroCountdown targetDate={dateStr} />
                    </div>
                )}

                {/* CTA */}
                <Link
                    href={`/events/${featured.id}`}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        background: '#f58634', color: '#fff',
                        padding: '0.85rem 2rem', borderRadius: '999px',
                        fontWeight: 800, fontSize: '0.95rem', width: 'fit-content',
                        transition: 'background 0.2s, transform 0.2s',
                        boxShadow: '0 6px 24px rgba(245,134,52,0.40)',
                    }}
                    className="hover:brightness-110 active:scale-95"
                >
                    View Full Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
