'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import CountdownBadge from '@/components/CountdownTimer';

function formatDate(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
    } catch {
        return null;
    }
}

// ── Single shuffle card ───────────────────────────────────────────────────────
function ShuffleCard({ event, height = 300 }) {
    const title       = (event.heading || event.title || 'Event').toUpperCase();
    const dateStr     = event.eventDate || event.datetime;
    const image       = event.eventImage || '/upcoming-events-1.png';
    const description = event.description;
    const date        = formatDate(dateStr);

    return (
        <Link href={`/events/${event.id}`} style={{ display: 'block', height: '100%' }}>
            <div className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{ height }}>
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                />

                {/* Gradient */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)' }} />

                {/* Countdown badge */}
                {dateStr && (
                    <div className="absolute top-3 right-3 z-10">
                        <CountdownBadge targetDate={dateStr} />
                    </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="font-black text-white leading-tight mb-1 drop-shadow"
                        style={{ fontSize: height >= 380 ? '1.45rem' : '1.05rem' }}>
                        {title}
                    </h3>
                    {date && (
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginBottom: description && height >= 380 ? '0.5rem' : 0 }}>
                            📅 {date}
                        </p>
                    )}
                    {description && height >= 380 && (
                        <p style={{
                            color: 'rgba(255,255,255,0.50)', fontSize: '0.85rem', lineHeight: 1.5,
                            marginBottom: '0.75rem',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {description}
                        </p>
                    )}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        color: '#f58634', fontSize: '0.78rem', fontWeight: 700,
                    }}
                        className="group-hover:underline">
                        Learn More →
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ── Shuffle layout with variable card sizes ───────────────────────────────────
function ShuffleGrid({ events }) {
    if (events.length === 0) return null;

    if (events.length === 1) {
        return (
            <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
                <ShuffleCard event={events[0]} height={420} />
            </div>
        );
    }

    if (events.length === 2) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ShuffleCard event={events[0]} height={400} />
                <ShuffleCard event={events[1]} height={400} />
            </div>
        );
    }

    // 3+ events: asymmetric "shuffle" pair then uniform grid
    const [first, second, third, ...overflow] = events;
    const hasThird = !!third;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ── Asymmetric pair ── */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Big card — takes 3/5 */}
                <div className="md:col-span-3">
                    <ShuffleCard event={first} height={460} />
                </div>

                {/* Stacked cards — take 2/5 */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <ShuffleCard event={second} height={hasThird ? 210 : 460} />
                    {hasThird && <ShuffleCard event={third} height={210} />}
                </div>
            </div>

            {/* ── Overflow in 3-col grid ── */}
            {overflow.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {overflow.map((e) => (
                        <ShuffleCard key={e.id} event={e} height={280} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3 rounded-2xl bg-gray-200 animate-pulse" style={{ height: 460 }} />
            <div className="md:col-span-2 flex flex-col gap-6">
                <div className="rounded-2xl bg-gray-200 animate-pulse flex-1" style={{ minHeight: 210 }} />
                <div className="rounded-2xl bg-gray-200 animate-pulse flex-1" style={{ minHeight: 210 }} />
            </div>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function EventsContent() {
    const { events, loading, error, refreshEvents } = useEvents();

    // Separate upcoming from past, sorted by date
    const now = new Date();
    const upcoming = events
        .filter((e) => new Date(e.eventDate || e.datetime || 0) >= now)
        .sort((a, b) =>
            new Date(a.eventDate || a.datetime || 0) -
            new Date(b.eventDate || b.datetime || 0)
        );
    const past = events
        .filter((e) => new Date(e.eventDate || e.datetime || 0) < now)
        .sort((a, b) =>
            new Date(b.eventDate || b.datetime || 0) -
            new Date(a.eventDate || a.datetime || 0)
        );

    // Skip the hero event (index 0 of upcoming — shown above)
    const shuffleEvents = upcoming.length > 0 ? upcoming.slice(1) : [];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* ── Upcoming section ─────────────────────────────── */}
                <div className="mb-14">
                    <div className="flex items-baseline gap-4 mb-8">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                            Upcoming Events
                        </h2>
                        {upcoming.length > 0 && (
                            <span style={{
                                background: 'rgba(245,134,52,0.12)', border: '1px solid rgba(245,134,52,0.35)',
                                color: '#f58634', borderRadius: '999px', padding: '0.2rem 0.75rem',
                                fontSize: '0.78rem', fontWeight: 800,
                            }}>
                                {upcoming.length} event{upcoming.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {loading && events.length === 0 && <Skeleton />}

                    {error && events.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">{error}</p>
                            <button
                                onClick={refreshEvents}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && upcoming.length === 0 && (
                        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4">📅</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming events</h3>
                            <p className="text-gray-500">Check back soon — something exciting is coming!</p>
                        </div>
                    )}

                    {/* Shuffle grid — events after the hero (index 0 shown in hero above) */}
                    {shuffleEvents.length > 0 && <ShuffleGrid events={shuffleEvents} />}

                    {/* If only 1 upcoming (shown in hero), say so */}
                    {!loading && upcoming.length === 1 && (
                        <div className="text-center py-10" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            One event coming up — see the feature above for full details.
                        </div>
                    )}
                </div>

                {/* ── Past events (compact horizontal list) ────────── */}
                {past.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-400 uppercase tracking-tight mb-6">
                            Past Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {past.map((event) => {
                                const title   = (event.heading || event.title || 'Event').toUpperCase();
                                const dateStr = event.eventDate || event.datetime;
                                const image   = event.eventImage || '/upcoming-events-1.png';
                                const date    = formatDate(dateStr);
                                return (
                                    <Link key={event.id} href={`/events/${event.id}`}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                                            <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 70, height: 70 }}>
                                                <Image src={image} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300" unoptimized />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p className="font-bold text-gray-700 text-sm leading-tight truncate group-hover:text-gray-900 transition-colors">
                                                    {title}
                                                </p>
                                                {date && <p className="text-gray-400 text-xs mt-0.5">{date}</p>}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
