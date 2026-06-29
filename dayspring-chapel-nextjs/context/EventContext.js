'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

const EventContext = createContext();

export function EventProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(0);

    // Fetch events function with caching logic
    const fetchEvents = useCallback(async (force = false) => {
        const now = Date.now();
        const cacheDuration = 5 * 60 * 1000; // 5 minutes cache

        // If not forced and data is fresh, don't fetch
        if (!force && events.length > 0 && (now - lastFetched < cacheDuration)) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.getEvents();
            const eventsData = response?.data || response || [];

            // Sort events by date (closest first)
            const sortedEvents = Array.isArray(eventsData)
                ? eventsData.sort((a, b) => {
                    const dateA = new Date(a.eventDate || a.datetime || 0);
                    const dateB = new Date(b.eventDate || b.datetime || 0);
                    return dateA - dateB; // Ascending order (closest date first)
                })
                : [];

            setEvents(sortedEvents);
            setLastFetched(now);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events.');
        } finally {
            setLoading(false);
        }
    }, [events.length, lastFetched]);

    // Initial fetch
    useEffect(() => {
        // Only fetch if we haven't fetched yet (or extremely stale)
        if (events.length === 0) {
            fetchEvents();
        }
    }, [fetchEvents, events.length]);

    const refreshEvents = () => fetchEvents(true);

    return (
        <EventContext.Provider value={{ events, loading, error, fetchEvents, refreshEvents }}>
            {children}
        </EventContext.Provider>
    );
}

export function useEvents() {
    const ctx = useContext(EventContext);
    if (!ctx) throw new Error('useEvents must be used inside <EventProvider>');
    return ctx;
}
