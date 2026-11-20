'use client';
import { useEffect, useState } from 'react';
import apiClient from './apiClient';
import { nextImminentEvent } from './upcomingEvents';

export default function useUpcomingEvent() {
    const [event, setEvent] = useState(null);
    useEffect(() => {
        let active = true, events = [], lastFetch = 0, pending = false;
        const refresh = async () => {
            if (document.hidden || pending) return;
            if (!lastFetch || Date.now() - lastFetch >= 300000) {
                pending = true;
                try { events = await apiClient.getEvents(); lastFetch = Date.now(); }
                catch { /* Keep the last known public events during a temporary connection failure. */ }
                finally { pending = false; }
            }
            if (active) setEvent(nextImminentEvent(Array.isArray(events) ? events : []));
        };
        refresh();
        const timer = setInterval(refresh, 30000);
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => { active = false; clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, []);
    return event;
}
