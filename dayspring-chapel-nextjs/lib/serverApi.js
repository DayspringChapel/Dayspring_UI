const API_BASE = (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    'https://dayspring-backend-4ar8.onrender.com'
).replace(/\/$/, '');

export async function fetchEventsServer() {
    try {
        const res = await fetch(`${API_BASE}/api/v1/Events`, {
            next: { revalidate: 120 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const arr = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];
        return arr.sort((a, b) => {
            const da = new Date(a.eventDate || a.datetime || 0);
            const db = new Date(b.eventDate || b.datetime || 0);
            return da - db;
        });
    } catch {
        return [];
    }
}
