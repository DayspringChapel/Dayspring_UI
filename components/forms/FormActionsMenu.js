'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/app/admin/(protected)/forms/forms.module.css';

export default function FormActionsMenu({ label, children }) {
    const [position, setPosition] = useState(null); const trigger = useRef(null); const menu = useRef(null);
    useEffect(() => {
        if (!position) return;
        const close = (e) => { if (!menu.current?.contains(e.target) && !trigger.current?.contains(e.target)) setPosition(null); };
        const key = (e) => { if (e.key === 'Escape') { setPosition(null); trigger.current?.focus(); } };
        const moved = () => setPosition(null);
        document.addEventListener('pointerdown', close); document.addEventListener('keydown', key); window.addEventListener('resize', moved); window.addEventListener('scroll', moved, true);
        menu.current?.querySelector('a,button')?.focus({ preventScroll: true });
        return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key); window.removeEventListener('resize', moved); window.removeEventListener('scroll', moved, true); };
    }, [position]);
    return <><button type="button" ref={trigger} className={styles.menuTrigger} aria-label={label} aria-expanded={!!position} onClick={() => {
        if (position) { setPosition(null); return; }
        const r = trigger.current.getBoundingClientRect(); setPosition({ left: Math.max(12, Math.min(window.innerWidth - 220, r.right - 205)), top: r.bottom + 6, bottom: window.innerHeight - r.top + 6, above: window.innerHeight - r.bottom < 350 });
    }}>•••</button>{position && createPortal(<div ref={menu} className={styles.menuItems} style={{ position: 'fixed', left: position.left, right: 'auto', top: position.above ? 'auto' : position.top, bottom: position.above ? position.bottom : 'auto', zIndex: 1000, maxHeight: '70vh', overflowY: 'auto' }} role="group" aria-label={label} onClick={() => setPosition(null)}>{children}</div>, document.body)}</>;
}
