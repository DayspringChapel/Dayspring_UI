'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

const EventContext = createContext();

export function EventProvider({ children, initialEvents = [] }) {
    const [events, setEvents] = useState(initialEvents);
    const [loading, setLoading] = useState(initialEvents.length === 0);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(initialEvents.length > 0 ? Date.now() : 0);

    const fetchEvents = useCallback(async (force = false) => {
        const now = Date.now();
        const cacheDuration = 5 * 60 * 1000;

        if (!force && events.length > 0 && (now - lastFetched < cacheDuration)) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.getEvents();
            const eventsData = response?.data || response || [];

            const sortedEvents = Array.isArray(eventsData)
                ? eventsData.sort((a, b) => {
                    const dateA = new Date(a.eventDate || a.datetime || 0);
                    const dateB = new Date(b.eventDate || b.datetime || 0);
                    return dateA - dateB;
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

    // Skip initial fetch if server already provided events
    useEffect(() => {
        if (events.length === 0) {
            fetchEvents();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
