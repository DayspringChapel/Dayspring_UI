import { backendFetch, sessionAuthorization, isTrustedOrigin, privateHeaders, sessionCheckHeaders } from '@/lib/session.server';
import { normalizeLivestreamSettings } from '@/lib/livestreamSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMPTY_SETTINGS = {
    youtube: { active: false, url: '', description: '' },
    facebook: { active: false, url: '', description: '' },
    instagram: { active: false, url: '', description: '' },
    imageUrl: '',
    hideWatchOnline: false,
    social: { whatsAppNumber: '', facebookPageUrl: '', instagramPageUrl: '', youTubeChannelId: '' },
};

export async function GET() {
    try {
        const response = await backendFetch('/api/v1/site-settings/livestream');
        if (!response.ok) return Response.json(EMPTY_SETTINGS, { headers: privateHeaders });
        return Response.json(normalizeLivestreamSettings(await response.json()), { headers: privateHeaders });
    } catch {
        return Response.json(EMPTY_SETTINGS, { headers: privateHeaders });
    }
}

export async function POST(request) {
    if (!isTrustedOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
    const authorization = sessionAuthorization(request);
    if (!authorization) return Response.json({ error: 'Forbidden' }, { status: 403, headers: privateHeaders });

    let body;
    try { body = await request.json(); }
    catch { return Response.json({ error: 'Invalid JSON body.' }, { status: 400, headers: privateHeaders }); }
    try {
        const response = await backendFetch('/api/v1/site-settings/livestream', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: authorization },
            body: JSON.stringify(body),
            cache: 'no-store',
        });
        const data = await response.json().catch(() => ({}));
        return Response.json(data, { status: response.status, headers: sessionCheckHeaders(response.headers) });
    } catch {
        return Response.json({ error: 'Unable to save livestream settings.' }, { status: 503, headers: privateHeaders });
    }
}
