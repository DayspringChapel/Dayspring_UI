'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import useLiveStatus from '@/lib/useLiveStatus';
import { useSocialLinks, whatsAppLink } from '@/lib/useSocialLinks';
import { FacebookIcon, InstagramIcon, YouTubeIcon, WhatsAppIcon } from '@/components/icons/SocialIcons';
import styles from './MobileNav.module.css';
import EventsNavLink from './EventsNavLink';
const LINKS = [['/', 'Home'], ['/about', 'About'], ['/library', 'Library'], ['/donate', 'Giving'], ['/live', 'Watch live'], ['/events', 'Events'], ['/gallery', 'Gallery'], ['/appointment', 'Appointment']];
export default function MobileNav({ isOpen, onClose, upcomingEvent }) {
    const social = useSocialLinks(); const live = useLiveStatus(); const panel = useRef(null);
    useEffect(() => {
        if (!isOpen) return;
        const dismiss = (event) => {
            if (event.type === 'keydown') { if (event.key === 'Escape') { onClose(); document.querySelector('[aria-controls="mobile-menu"]')?.focus(); } }
            else if (!panel.current?.contains(event.target) && !event.target.closest('[aria-controls="mobile-menu"]')) onClose();
        };
        document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', dismiss);
        return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', dismiss); };
    }, [isOpen, onClose]);
    const items = [[social.facebookPageUrl,'Facebook',FacebookIcon], [social.instagramPageUrl,'Instagram',InstagramIcon], [social.youTubeChannelUrl,'YouTube',YouTubeIcon], [whatsAppLink(social.whatsAppNumber, "Hi DaySpring Chapel, I'd like to chat."),'WhatsApp',WhatsAppIcon]];
    if (!isOpen) return null;
    return <nav id="mobile-menu" ref={panel} className={styles.panel} aria-label="Mobile navigation">
        <header><strong>Explore Dayspring</strong><button type="button" onClick={onClose} aria-label="Close mobile menu">×</button></header>
        <ul className={styles.links}>{LINKS.map(([href,label]) => <li key={href} style={href === '/events' && upcomingEvent ? { gridColumn: '1 / -1' } : undefined}>{href === '/events' ? <EventsNavLink event={upcomingEvent} onNavigate={onClose} mobile /> : <Link href={href} onClick={onClose} className={href === '/live' && live ? 'watch-live-active' : ''}>{label}<span aria-hidden="true">↗</span></Link>}</li>)}</ul>
        <div className={styles.social}>{items.filter(([url]) => url).map(([url,label,Icon]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${label}`}><Icon width={22} height={22}/></a>)}</div>
        <Link className={styles.staff} href="/admin/login" onClick={onClose}>Admin sign in <span aria-hidden="true">↗</span></Link>
    </nav>;
}
