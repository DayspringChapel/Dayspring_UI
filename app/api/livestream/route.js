const API_BASE = (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    'https://dayspring-backend-4ar8.onrender.com'
).replace(/\/$/, '');

const EMPTY_SETTINGS = {
    youtube: { active: false, url: '', description: '' },
    facebook: { active: false, url: '', description: '' },
    instagram: { active: false, url: '', description: '' },
    imageUrl: '',
    hideWatchOnline: false,
};

export async function GET() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/site-settings/livestream`, { cache: 'no-store' });
        if (!response.ok) return Response.json(EMPTY_SETTINGS);
        return Response.json(await response.json());
    } catch {
        return Response.json(EMPTY_SETTINGS);
    }
}

export async function POST(request) {
    const authorization = request.headers.get('authorization');
    if (!authorization) return Response.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const body = await request.json();
        const response = await fetch(`${API_BASE}/api/v1/site-settings/livestream`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: authorization },
            body: JSON.stringify(body),
            cache: 'no-store',
        });
        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch {
        return Response.json({ error: 'Invalid body' }, { status: 400 });
    }
}
