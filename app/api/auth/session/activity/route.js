import { sessionAuthorization, isTrustedOrigin, privateHeaders, backendFetch, sessionCheckHeaders } from '@/lib/session.server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request) {
    if (!isTrustedOrigin(request)) return Response.json({ message:'Invalid request origin.' }, { status:403, headers:privateHeaders });
    const authorization = sessionAuthorization(request);
    if (!authorization) return new Response(null, { status:401, headers:privateHeaders });
    try {
        const upstream = await backendFetch('/api/v1/Users/browser-session/activity', { method:'POST', headers:{ Authorization:authorization } });
        return new Response(null, { status:upstream.status, headers:sessionCheckHeaders(upstream.headers) });
    } catch { return new Response(null, { status:503, headers:privateHeaders }); }
}
