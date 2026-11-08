import { backendFetch, sessionAuthorization, isTrustedOrigin, privateHeaders, sessionCheckHeaders } from '@/lib/session.server';
import { normalizeLivestreamSettings } from '@/lib/livestreamSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!isTrustedOrigin(request)) return Response.json({ message: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
    const authorization = sessionAuthorization(request);
    if (!authorization) return Response.json({ message: 'Sign in to refresh live status.' }, { status: 401, headers: privateHeaders });
    try {
        const response = await backendFetch('/api/v1/site-settings/livestream/status/refresh', {
            method: 'POST', headers: { Authorization: authorization }, signal: AbortSignal.timeout(15000),
        });
        const headers = sessionCheckHeaders(response.headers);
        if (response.status === 404) return Response.json({ message: 'Deploy the backend refresh update to enable a fresh YouTube check.' }, { status: 503, headers });
        if (!response.ok) return Response.json({ message: response.status === 403 ? 'Your role cannot refresh livestream status.' : response.status === 401 ? 'Sign in again to refresh live status.' : 'Unable to refresh live status. Please try again.' }, { status: response.status, headers });
        return Response.json(normalizeLivestreamSettings(await response.json()), { headers });
    } catch {
        return Response.json({ message: 'The live status check could not complete. Please try again.' }, { status: 503, headers: privateHeaders });
    }
}
