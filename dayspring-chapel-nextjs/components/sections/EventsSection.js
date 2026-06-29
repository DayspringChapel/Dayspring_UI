import Image from 'next/image';
import Link from 'next/link';
import { fetchEventsServer } from '@/lib/serverApi';
import CountdownBadge from '@/components/CountdownTimer';

const PLACEHOLDER_EVENTS = [
    { id: 1, heading: 'SERVICE OF HYMNS', eventDate: null, eventImage: '/upcoming-events-3.png', description: null },
    { id: 2, heading: "GLS'2025",         eventDate: null, eventImage: '/upcoming-events-1.png', description: null },
    { id: 3, heading: 'YOUTH FEAST',      eventDate: null, eventImage: '/upcoming-events-2.png', description: null },
];

function formatEventDate(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
        });
    } catch {
        return null;
    }
}

function EventCard({ event, index, height = 420 }) {
    const imgSrc = event.eventImage || [
        '/upcoming-events-1.png',
        '/upcoming-events-2.png',
        '/upcoming-events-3.png',
    ][index % 3];

    const title       = (event.heading || event.title || '').toUpperCase();
    const dateStr     = event.eventDate || event.datetime;
    const date        = formatEventDate(dateStr);
    const description = event.description || null;

    return (
        <Link href={`/content/event/${event.id}`} className="block group">
            <div
                className="relative rounded-2xl overflow-hidden shadow-xl"
                style={{ height }}
            >
                {/* Background image */}
                <Image
                    src={imgSrc}
                    alt={title || 'Event'}
                    fill
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                    unoptimized
                />

                {/* Persistent dark gradient */}
                <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)' }}
                />

                {/* Countdown badge */}
                {dateStr && (
                    <div className="absolute top-4 right-4 z-10">
                        <CountdownBadge targetDate={dateStr} />
                    </div>
                )}

                {/* Default bottom info — fades out on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10
                    transition-all duration-300 ease-in-out
                    group-hover:opacity-0 group-hover:translate-y-3">
                    <p className="font-black text-white leading-tight drop-shadow"
                        style={{ fontSize: height >= 460 ? '1.4rem' : '1.15rem' }}>
                        {title}
                    </p>
                    {date && (
                        <p className="text-white/65 text-sm font-medium mt-1">📅 {date}</p>
                    )}
                </div>

                {/* Hover panel — slides up from bottom */}
                <div
                    className="absolute inset-0 z-20 flex flex-col justify-end
                        translate-y-4 opacity-0
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-350 ease-out"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.82) 50%, rgba(0,0,0,0.30) 100%)' }}
                >
                    <div className="p-6">
                        {/* Orange accent line */}
                        <div style={{ width: 36, height: 3, background: '#f58634', borderRadius: 2, marginBottom: '0.75rem' }} />

                        <p className="font-black text-white leading-tight mb-2"
                            style={{ fontSize: height >= 460 ? '1.4rem' : '1.15rem' }}>
                            {title}
                        </p>

                        {date && (
                            <p style={{ color: '#f58634', fontSize: '0.82rem', fontWeight: 700, marginBottom: description ? '0.75rem' : '1rem' }}>
                                📅 {date}
                            </p>
                        )}

                        {description && (
                            <p style={{
                                color: 'rgba(255,255,255,0.68)', fontSize: '0.88rem', lineHeight: 1.6,
                                marginBottom: '1rem',
                                display: '-webkit-box', WebkitLineClamp: height >= 460 ? 4 : 3,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                                {description}
                            </p>
                        )}

                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            color: '#f58634', fontSize: '0.82rem', fontWeight: 800,
                        }}>
                            View Details
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default async function EventsSection() {
    const allEvents = await fetchEventsServer();

    const now = new Date();
    const upcoming = allEvents.filter((e) => {
        const d = new Date(e.eventDate || e.datetime || 0);
        return d >= now;
    });

    const source       = upcoming.length > 0 ? upcoming : allEvents;
    const displayEvents = source.length > 0 ? source.slice(0, 6) : PLACEHOLDER_EVENTS;
    const count        = displayEvents.length;

    return (
        <div className="container mx-auto px-4">
            {/* ── Section header ─────────────────────────────────── */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div style={{ width: 5, height: 48, background: '#f58634', borderRadius: 3, flexShrink: 0 }} />
                    <h2 className="font-black uppercase leading-none"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: '#111' }}>
                        Upcoming Events
                    </h2>
                </div>
                <p className="text-gray-500 text-base md:text-lg leading-relaxed"
                    style={{ maxWidth: '40rem', paddingLeft: '1.25rem', borderLeft: '1px solid #e5e7eb' }}>
                    Join us for these life-transforming gatherings. Hover to see details, click to learn more.
                </p>
            </div>

            {/* ── Cards ──────────────────────────────────────────── */}
            {count === 1 && (
                <div style={{ maxWidth: '42rem', margin: '0 auto 2.5rem' }}>
                    <EventCard event={displayEvents[0]} index={0} height={500} />
                </div>
            )}

            {count === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
                    style={{ maxWidth: '56rem', margin: '0 auto 2.5rem' }}>
                    {displayEvents.map((e, i) => (
                        <EventCard key={e.id} event={e} index={i} height={480} />
                    ))}
                </div>
            )}

            {count >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {displayEvents.map((e, i) => (
                        <EventCard key={e.id} event={e} index={i} height={440} />
                    ))}
                </div>
            )}

            {/* ── CTA ────────────────────────────────────────────── */}
            <div className="text-center">
                <Link
                    href="/events"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        background: '#f58634', color: '#fff',
                        padding: '0.85rem 2.25rem', borderRadius: '999px',
                        fontWeight: 800, fontSize: '0.95rem',
                        boxShadow: '0 4px 20px rgba(245,134,52,0.35)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    className="hover:brightness-110 active:scale-95"
                >
                    View All Events
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
