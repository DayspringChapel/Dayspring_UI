'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import styles from './CalendarView.module.css';

export default function CalendarView() {
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selected, setSelected] = useState(() => new Date().getDate());
    const [items, setItems] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [reload, setReload] = useState(0);
    useEffect(() => { const controller = new AbortController(); apiClient.request('/api/v1/event-programs', { signal: controller.signal }).then((data) => { setItems(data.items); setError(''); }).catch((e) => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [reload]);
    const year = month.getFullYear(); const index = month.getMonth(); const days = new Date(year, index + 1, 0).getDate(); const first = month.getDay();
    const monthItems = items.filter((item) => { const d = new Date(item.date); return d.getFullYear() === year && d.getMonth() === index; });
    const dayItems = monthItems.filter((item) => new Date(item.date).getDate() === selected);
    const today = new Date();
    function move(offset) { setMonth(new Date(year, index + offset, 1)); setSelected(1); }
    return <section className={styles.calendar} aria-label="Events and programs calendar">
        <header className={styles.toolbar}><div><p>CHURCH CALENDAR</p><h2>{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</h2><span>{monthItems.length} events & programs this month</span></div><div className={styles.controls}><label>Jump to month<input type="month" aria-label="Jump to month" value={`${year}-${String(index + 1).padStart(2, '0')}`} onChange={(event) => { const [y,m] = event.target.value.split('-').map(Number); if (y && m) { setMonth(new Date(y,m-1,1)); setSelected(1); } }} /></label><button onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today.getDate()); }}>Today</button><button aria-label="Previous month" onClick={() => move(-1)}>‹</button><button aria-label="Next month" onClick={() => move(1)}>›</button></div></header>
        {error && <p className={styles.error} role="alert">{error} <button onClick={() => setReload((v) => v + 1)}>Try again</button></p>}
        <div className={styles.layout}><div><div className={styles.weekdays}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <span key={day}>{day}</span>)}</div><div className={styles.days}>
            {Array.from({ length: first }, (_, i) => <div key={`blank-${i}`} className={styles.blank} />)}
            {Array.from({ length: days }, (_, i) => { const day = i + 1; const events = monthItems.filter((item) => new Date(item.date).getDate() === day); const isToday = day === today.getDate() && index === today.getMonth() && year === today.getFullYear(); return <button key={day} aria-pressed={selected === day} aria-label={`${day} ${month.toLocaleDateString([], { month: 'long' })}, ${events.length} programs`} className={`${styles.day} ${isToday ? styles.today : ''}`} onClick={() => setSelected(day)}><span>{day}</span>{events.slice(0, 2).map((item) => <small key={item.id}>{item.title}</small>)}{events.length > 2 && <small>+{events.length - 2} more</small>}</button>; })}
        </div></div><aside className={styles.agenda}><p>DAY AGENDA</p><h3>{new Date(year, index, selected).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</h3>{loading ? <p>Loading calendar…</p> : dayItems.length ? dayItems.map((item) => <article key={item.id}><span className={styles.status}>{item.isPublished ? 'Published' : 'Planning'}</span><h4>{item.title}</h4><p>{new Date(item.date).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}</p><p>{item.description}</p></article>) : <div className={styles.empty}><span>◇</span><h4>A little breathing room</h4><p>No events or programs scheduled for this day.</p></div>}</aside></div>
        <footer>Select a day to see its programs. Approved flyers can be published from the media workspace.</footer>
    </section>;
}
