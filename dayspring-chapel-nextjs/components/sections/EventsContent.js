'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';

// Section Header Component - Always displays
function EventsHeader() {
    return (
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
                Upcoming Events
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
                Join us for these upcoming events and experience the presence of God with us.
            </p>
        </div>
    );
}

// Loading Skeleton Component
function EventsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Error State Component
function EventsError({ error, onRetry }) {
    return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Events</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
                onClick={onRetry}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}

// Empty State Component
function EventsEmpty() {
    return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600">Check back soon for upcoming events!</p>
        </div>
    );
}

// Event Card Component
function EventCard({ event }) {
    // Helper to get property case-insensitively or with fallbacks
    const getHeading = () => event.heading || event.Heading || event.title || 'Event';
    const getDatetime = () => event.eventDate || event.datetime || event.dateTime || event.DateTime || event.date;
    const getLocation = () => event.location || event.Location;

    // The image field seems to be eventImage from previous tests
    const getImage = () => event.eventImage || event.EventImage || '/upcoming-events-1.png';
    const getDescription = () => event.description || event.Description;

    const heading = getHeading();
    const datetime = getDatetime();
    const location = getLocation();
    const image = getImage();
    const description = getDescription();



    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <div className="relative h-64 w-full">
                <Image
                    src={image}
                    alt={heading}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                {heading && (
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{heading}</h3>
                )}

                <div className="space-y-2 mb-4">
                    {datetime && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">
                                {new Date(datetime).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                    {datetime && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">
                                {new Date(datetime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                    {location && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium">{location}</span>
                        </div>
                    )}
                </div>

                <p className="text-gray-600 text-sm mb-6 flex-grow">{description}</p>

                <Link
                    href={`/events/${event.id}`}
                    className="w-full py-3 px-6 bg-primary text-white text-center rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                    Learn More
                </Link>
            </div>
        </div>
    );
}

// Events Grid Component
function EventsGrid({ events }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}

// Main Events Content Component
export default function EventsContent() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.getEvents();
            // API returns { status: true, message: "...", data: [...] }
            const eventsData = response?.data || response || [];
            setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Render content based on state
    const renderContent = () => {
        if (loading) {
            return <EventsLoadingSkeleton />;
        }

        if (error) {
            return <EventsError error={error} onRetry={fetchEvents} />;
        }

        if (events.length === 0) {
            return <EventsEmpty />;
        }

        return <EventsGrid events={events} />;
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header always shows */}
                <EventsHeader />

                {/* Dynamic content based on state */}
                {renderContent()}
            </div>
        </section>
    );
}
