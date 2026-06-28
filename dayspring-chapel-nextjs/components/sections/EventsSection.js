'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

const PLACEHOLDER_IMAGES = [
    '/upcoming-events-1.png',
    '/upcoming-events-2.png',
    '/upcoming-events-3.png',
];

function formatEventDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    } catch {
        return String(dateStr).toUpperCase();
    }
}

export default function EventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient
            .getEvents()
            .then((data) => setEvents((data || []).slice(0, 6)))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    const displayEvents = loading
        ? []
        : events.length > 0
        ? events
        : [
              { id: 1, heading: 'SERVICE OF HYMNS', eventDate: null, eventImage: '/upcoming-events-3.png' },
              { id: 2, heading: "GLS'2025", eventDate: null, eventImage: '/upcoming-events-1.png' },
              { id: 3, heading: 'YOUTH FEAST', eventDate: null, eventImage: '/upcoming-events-2.png' },
              { id: 4, heading: 'SERVICE OF HYMNS', eventDate: null, eventImage: '/upcoming-events-3.png' },
              { id: 5, heading: "GLS'2025", eventDate: null, eventImage: '/upcoming-events-1.png' },
              { id: 6, heading: 'YOUTH FEAST', eventDate: null, eventImage: '/upcoming-events-2.png' },
          ];

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-2xl md:hidden text-center mb-8 font-bold">UPCOMING EVENTS</h2>

            <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold italic mb-6 hidden md:block text-center">
                    GET A GLIMPSE OF OUR UPCOMING EVENTS
                </h2>
                <p className="text-lg mb-12 max-w-4xl mx-auto text-center leading-relaxed text-gray-600">
                    Explore our upcoming programs and get ready for a life-transforming encounter in God's presence.
                    These God-ordained gatherings are designed to uplift, inspire, and renew your spirit.
                </p>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-[300px] rounded-lg bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8">
                        {displayEvents.map((event, index) => {
                            const imgSrc = event.eventImage || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
                            const title = (event.heading || event.title || '').toUpperCase();
                            const date = formatEventDate(event.eventDate || event.datetime);

                            return (
                                <div
                                    key={event.id}
                                    className="relative h-[300px] rounded-lg overflow-hidden cursor-pointer group shadow-lg"
                                >
                                    <Image
                                        src={imgSrc}
                                        alt={title}
                                        fill
                                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center w-full px-4">
                                        <p className="font-bold text-xl mb-2">{title}</p>
                                        {date && <p className="text-lg">{date}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Link
                    href="/events"
                    className="inline-flex items-center gap-3 text-primary hover:text-primary-dark transition-colors font-semibold"
                >
                    <span className="underline">Learn More</span>
                    <Image src="/arrow-icon.png" alt="Arrow" width={7} height={12} className="w-[7px] h-3" />
                </Link>
            </div>
        </div>
    );
}
