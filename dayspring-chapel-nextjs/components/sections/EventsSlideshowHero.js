'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import PageHero from './PageHero'; // Fallback

export default function EventsSlideshowHero() {
    const { events, loading, error } = useEvents();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    // Filter and sort events for the slideshow
    useEffect(() => {
        if (events && events.length > 0) {
            // Filter out past events (optional, depending on requirements, but usually "upcoming" implies future)
            // The context already sorts them by date.
            // Let's take the top 5.
            const now = new Date();
            const futureEvents = events.filter(e => {
                const eventDate = new Date(e.eventDate || e.datetime || e.date);
                return eventDate >= now; // Only future events
            }).slice(0, 5);

            setUpcomingEvents(futureEvents);
        }
    }, [events]);

    // Auto-advance
    useEffect(() => {
        if (upcomingEvents.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % upcomingEvents.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [upcomingEvents.length]);

    // Helper functions for event data
    const getEventData = (event) => {
        if (!event) return null;
        return {
            title: event.heading || event.Heading || event.title || 'Upcoming Event',
            date: event.eventDate || event.datetime || event.DateTime || event.date,
            location: event.location || event.Location,
            image: event.eventImage || event.EventImage || '/about-cover.png', // Fallback image
            id: event.id
        };
    };

    // Fallback to static hero if no events or loading/error
    if (loading || error || upcomingEvents.length === 0) {
        return (
            <PageHero
                title="EVENTS"
                subtitle="Join us for these life-changing events and encounters."
                bgImage="/about-cover.png"
            />
        );
    }

    const currentEvent = getEventData(upcomingEvents[currentIndex]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % upcomingEvents.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
    };

    return (
        <div className="relative w-full h-[60vh] md:h-[80vh] bg-black overflow-hidden">
            {/* Background Images - Transition Group could be used here, but simple opacity crossfade is easier for now */}
            {upcomingEvents.map((event, index) => {
                const data = getEventData(event);
                return (
                    <div
                        key={event.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <Image
                            src={data.image}
                            alt={data.title}
                            fill
                            className="object-cover opacity-60"
                            priority={index === 0}
                        />
                        {/* Dark Gradient Overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
                    </div>
                );
            })}

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
                <div className="max-w-4xl animate-fadeIn">
                    {/* Badge */}
                    <div className="inline-block bg-primary px-4 py-1 rounded-full text-white text-sm font-semibold mb-4 tracking-wide uppercase">
                        Upcoming Event
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                        {currentEvent.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-200 mb-8 text-lg">
                        {currentEvent.date && (
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                    {new Date(currentEvent.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        {currentEvent.location && (
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{currentEvent.location}</span>
                            </div>
                        )}
                    </div>

                    <Link
                        href={`/events/${currentEvent.id}`}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
                    >
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Navigation Buttons */}
            {upcomingEvents.length > 1 && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-4">
                    <button
                        onClick={prevSlide}
                        className="pointer-events-auto p-3 rounded-full bg-black/30 hover:bg-primary text-white backdrop-blur-sm transition-all transform hover:scale-110"
                        aria-label="Previous slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="pointer-events-auto p-3 rounded-full bg-black/30 hover:bg-primary text-white backdrop-blur-sm transition-all transform hover:scale-110"
                        aria-label="Next slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Indicators */}
            {upcomingEvents.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
                    {upcomingEvents.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
