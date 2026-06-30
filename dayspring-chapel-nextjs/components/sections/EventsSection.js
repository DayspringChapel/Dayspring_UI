import Link from 'next/link';
import { fetchEventsServer } from '@/lib/serverApi';
import EventsCarousel from './EventsCarousel';

const PLACEHOLDER_EVENTS = [
    { id: 1, heading: 'SERVICE OF HYMNS', eventDate: null, eventImage: '/upcoming-events-3.png', description: null },
    { id: 2, heading: "GLS'2025",         eventDate: null, eventImage: '/upcoming-events-1.png', description: null },
    { id: 3, heading: 'YOUTH FEAST',      eventDate: null, eventImage: '/upcoming-events-2.png', description: null },
];

export default async function EventsSection() {
    const allEvents = await fetchEventsServer();

    const now = new Date();
    const upcoming = allEvents.filter((e) => {
        const d = new Date(e.eventDate || e.datetime || 0);
        return d >= now;
    });

    const source        = upcoming.length > 0 ? upcoming : allEvents;
    const displayEvents = source.length > 0 ? source.slice(0, 6) : PLACEHOLDER_EVENTS;

    return (
        <div className="container mx-auto px-4">
            {/* ── Section header ─────────────────────────────────── */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <div style={{ width: 5, height: 48, background: '#f58634', borderRadius: 3, flexShrink: 0 }} />
                    <h2 className="font-black uppercase leading-none"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: '#111' }}>
                        Upcoming Events
                    </h2>
                </div>
                <p className="text-gray-500 text-base md:text-lg leading-relaxed"
                    style={{ maxWidth: '40rem', paddingLeft: '1.25rem', borderLeft: '1px solid #e5e7eb' }}>
                    Click any card to bring it forward. Click the front card to open the event page.
                </p>
            </div>

            {/* ── Carousel / card-stack ──────────────────────────── */}
            <EventsCarousel events={displayEvents} />

            {/* ── CTA ────────────────────────────────────────────── */}
            <div className="text-center mt-10">
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
