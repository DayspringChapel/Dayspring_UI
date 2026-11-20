export function nextImminentEvent(events, now = Date.now()) {
    const cutoff = now + 7 * 86400000;
    return events.filter(event => {
        const start = Date.parse(event.eventDate || event.datetime || '');
        return event.isPublished === true && !event.isArchived && start >= now && start <= cutoff;
    }).sort((a, b) => Date.parse(a.eventDate || a.datetime) - Date.parse(b.eventDate || b.datetime))[0] || null;
}

export function eventCountdown(date, now = Date.now()) {
    const seconds = Math.max(0, Math.floor((Date.parse(date) - now) / 1000));
    if (!Number.isFinite(seconds)) return '';
    if (!seconds) return 'Starting now';
    return `${Math.floor(seconds / 86400)}d ${Math.floor(seconds % 86400 / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s`;
}
