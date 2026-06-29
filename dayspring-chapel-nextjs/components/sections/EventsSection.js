import Image from 'next/image';
import Link from 'next/link';
import { fetchEventsServer } from '@/lib/serverApi';
import CountdownBadge from '@/components/CountdownTimer';

const PLACEHOLDER_EVENTS = [
    { id: 1, heading: 'SERVICE OF HYMNS', eventDate: null, eventImage: '/upcoming-events-3.png' },
    { id: 2, heading: "GLS'2025",         eventDate: null, eventImage: '/upcoming-events-1.png' },
    { id: 3, heading: 'YOUTH FEAST',      eventDate: null, eventImage: '/upcoming-events-2.png' },
];

function formatEventDate(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
    } catch {
        return null;
    }
}

// Card is a server component — CountdownBadge is a client component that hydrates independently
function EventCard({ event, index }) {
    const imgSrc = event.eventImage || [
        '/upcoming-events-1.png',
        '/upcoming-events-2.png',
        '/upcoming-events-3.png',
    ][index % 3];

    const title   = (event.heading || event.title || '').toUpperCase();
    const dateStr = event.eventDate || event.datetime;
    const date    = formatEventDate(dateStr);

    return (
        <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
            <Image
                src={imgSrc}
                alt={title || 'Event'}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                unoptimized
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300" />

            {/* Countdown badge — top right */}
            {dateStr && (
                <div className="absolute top-3 right-3 z-10">
                    <CountdownBadge targetDate={dateStr} />
                </div>
            )}

            {/* Info — bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                {title && (
                    <p className="font-black text-white text-lg leading-tight mb-1 drop-shadow">{title}</p>
                )}
                {date && (
                    <p className="text-gray-300 text-sm font-medium">📅 {date}</p>
                )}
            </div>
        </div>
    );
}

export default async function EventsSection() {
    const allEvents = await fetchEventsServer();

    // Prefer upcoming events; fall back to whatever exists
    const now = new Date();
    const upcoming = allEvents.filter((e) => {
        const d = new Date(e.eventDate || e.datetime || 0);
        return d >= now;
    });

    const source = upcoming.length > 0 ? upcoming : allEvents;
    const displayEvents = source.length > 0 ? source.slice(0, 6) : PLACEHOLDER_EVENTS;
    const count = displayEvents.length;

    // Grid class: 1 event → centered single; 2 → 2-col centered; 3+ → 3-col
    const gridClass =
        count === 1 ? 'flex justify-center' :
        count === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto' :
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

    return (
        <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black italic mb-4 text-center">
                    GET A GLIMPSE OF OUR UPCOMING EVENTS
                </h2>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                    Explore our upcoming programs and get ready for a life-transforming encounter in God&apos;s presence.
                </p>
            </div>

            <div className={`${gridClass} mb-10`}>
                {displayEvents.map((event, index) => (
                    <div
                        key={event.id}
                        className={count === 1 ? 'w-full max-w-md' : ''}
                    >
                        <EventCard event={event} index={index} />
                    </div>
                ))}
            </div>

            <div className="text-center">
                <Link
                    href="/events"
                    className="inline-flex items-center gap-3 text-primary hover:text-primary-dark transition-colors font-bold text-lg"
                >
                    <span className="underline underline-offset-4">View All Events</span>
                    <Image src="/arrow-icon.png" alt="" width={7} height={12} className="w-[7px] h-3" />
                </Link>
            </div>
        </div>
    );
}
