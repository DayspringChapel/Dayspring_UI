const API_BASE = (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    'https://dayspring-backend-4ar8.onrender.com'
).replace(/\/$/, '');

function toHttps(url) {
    if (!url || typeof url !== 'string') return url;
    return url.replace(/^http:\/\//i, 'https://');
}

export async function fetchEventByIdServer(id) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/Events/${id}/event`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const e = data?.data || data;
        if (!e) return null;
        return {
            ...e,
            id: e.id || e.Id,
            heading: e.heading || e.Heading || '',
            description: e.description || e.Description || '',
            eventDate: e.eventDate || e.EventDate || null,
            eventImage: toHttps(e.eventImage || e.EventImage || e.eventImageUrl || e.EventImageUrl || null),
            location: e.location || e.Location || null,
        };
    } catch {
        return null;
    }
}

export async function fetchSermonByIdServer(id) {
    try {
        const res = await fetch(`${API_BASE}/api/v1/Sermons/${id}/sermon`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const s = data?.data || data;
        if (!s) return null;
        return {
            ...s,
            id: s.id || s.Id || s.sermonId || s.SermonId,
            title: s.title || s.Title || '',
            preacherName: s.preacherName || s.PreacherName || '',
            sermonDate: s.sermonDate || s.SermonDate || '',
            seriesTitle: s.seriesTitle || s.SeriesTitle || '',
            audioLink: toHttps(s.audioFile || s.AudioFile || s.audioLink || s.AudioLink || s.link || null),
            imageUrl: toHttps(s.imageUrl || s.ImageUrl || s.image || s.Image || null),
        };
    } catch {
        return null;
    }
}

export async function fetchEventsServer() {
    try {
        const res = await fetch(`${API_BASE}/api/v1/Events`, {
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = await res.json();
        const arr = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];
        return arr
            .map((e) => ({
                ...e,
                eventImage: e.eventImage ? e.eventImage.replace(/^http:\/\//i, 'https://') : e.eventImage,
            }))
            .sort((a, b) => {
                const da = new Date(a.eventDate || a.datetime || 0);
                const db = new Date(b.eventDate || b.datetime || 0);
                return da - db;
            });
    } catch {
        return [];
    }
}
