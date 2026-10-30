import { fetchChatbotConfigServer } from '@/lib/serverApi';
import { sessionAuthorization, isTrustedOrigin } from '@/lib/session.server';

const API_BASE = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    'https://dayspring-backend-4ar8.onrender.com'
).replace(/\/$/, '');

export async function GET() {
    return Response.json(await fetchChatbotConfigServer());
}

// Persisted in the backend (SiteSettings) so it survives restarts and is shared by every
// server instance. The backend enforces the CanManageChatbot permission.
export async function POST(request) {
    if (!isTrustedOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    const authorization = sessionAuthorization(request);
    if (!authorization) return Response.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const body = await request.json();
        const response = await fetch(`${API_BASE}/api/v1/site-settings/chatbot`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: authorization },
            body: JSON.stringify({ additionalInfo: typeof body.additionalInfo === 'string' ? body.additionalInfo : '' }),
            cache: 'no-store',
        });
        const data = await response.json().catch(() => ({}));
        return Response.json(data, { status: response.status });
    } catch {
        return Response.json({ error: 'Invalid body' }, { status: 400 });
    }
}
