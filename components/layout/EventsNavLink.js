'use client';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { eventCountdown } from '@/lib/upcomingEvents';
import styles from './EventsNavLink.module.css';

export default function EventsNavLink({ event, current, onNavigate, mobile = false }) {
    const [open, setOpen] = useState(false);
    const [now, setNow] = useState(null);
    const id = useId();
    useEffect(() => {
        if (!open) return;
        const tick = () => setNow(Date.now());
        tick(); const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [open]);
    const date = event?.eventDate || event?.datetime;
    const label = date ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Lagos' }).format(new Date(date)) : '';
    return <div className={`${styles.root} ${mobile ? styles.mobile : ''}`} onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setOpen(true); }} onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setOpen(false); }} onFocus={e => { if (e.target.tagName !== 'BUTTON') setOpen(true); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); e.stopPropagation(); } }}>
        <div className={styles.row}>
            <Link href="/events" onClick={onNavigate} aria-current={current ? 'page' : undefined} className={`${event ? styles.imminent : ''} ${current ? 'text-primary' : ''}`}>Events</Link>
            {event && <button type="button" className={styles.toggle} aria-label="Upcoming event details" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>ⓘ</button>}
        </div>
        {event && open && <div id={id} className={styles.preview}>
            <p className={styles.eyebrow}>Coming up this week</p>
            <strong>{event.heading || event.title || 'Upcoming event'}</strong>
            <time dateTime={date}>{label} WAT</time>
            {event.description && <p className={styles.description}>{event.description}</p>}
            <p className={styles.countdown} aria-label="Event countdown">Starts in {now ? eventCountdown(date, now) : '…'}</p>
            <Link href={event.id ? `/content/event/${event.id}` : '/events'} onClick={onNavigate}>View event <span aria-hidden="true">→</span></Link>
        </div>}
    </div>;
}
