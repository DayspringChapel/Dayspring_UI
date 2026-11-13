import { NextResponse } from 'next/server';
import { backendFetch, cookieSettings, isTrustedOrigin, privateHeaders } from '@/lib/session.server';

const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-dayspring_viewer' : 'dayspring_viewer';

export async function liveEngagementProxy(request, context, comments = false) {
    const { videoId } = await context.params;
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return NextResponse.json({ message: 'Invalid broadcast.' }, { status: 400, headers: privateHeaders });
    if (request.method !== 'GET' && !isTrustedOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
    const existing = (request.headers.get('cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    const viewer = /^[a-f0-9]{32}$/.test(existing || '') ? existing : crypto.randomUUID().replaceAll('-', '');
    const headers = { 'X-Dayspring-Viewer': viewer, 'Content-Type': 'application/json' };
    try {
        let body;
        if (request.method !== 'GET') {
            const limit = comments ? 4096 : 1024;
            if (Number(request.headers.get('content-length')) > limit) return NextResponse.json({ message: 'The request is too large.' }, { status: 400, headers: privateHeaders });
            const raw = await request.text();
            if (new TextEncoder().encode(raw).length > limit) return NextResponse.json({ message: 'The request is too large.' }, { status: 400, headers: privateHeaders });
            const value = JSON.parse(raw);
            if (comments) {
                if (typeof value.name !== 'string' || typeof value.text !== 'string' || value.name.length > 50 || value.text.length > 500) return NextResponse.json({ message: 'Check your name and comment.' }, { status: 400, headers: privateHeaders });
                body = JSON.stringify({ videoId, name: value.name, text: value.text });
            } else {
            if (!['like', 'heart', 'amen', 'clap', 'joy'].includes(value.kind) || typeof value.active !== 'boolean') return NextResponse.json({ message: 'Choose a supported reaction.' }, { status: 400, headers: privateHeaders });
            body = JSON.stringify({ kind: value.kind, active: value.active });
            }
        }
        const upstream = await backendFetch(`/api/v1/live-engagement/${videoId}${comments ? '/comments' : ''}`, { method: request.method, headers, body, signal: AbortSignal.timeout(15000) });
        const value = await upstream.json();
        const responseHeaders = { ...privateHeaders };
        const retry = upstream.headers.get('retry-after'); if (retry) responseHeaders['Retry-After'] = retry;
        const response = NextResponse.json(value, { status: upstream.status, headers: responseHeaders });
        if (upstream.ok && viewer !== existing) response.cookies.set(COOKIE, viewer, { ...cookieSettings(), maxAge: 31536000 });
        return response;
    } catch (error) {
        return NextResponse.json({ message: error instanceof SyntaxError ? 'Invalid request.' : 'Community interactions are temporarily unavailable. Please try again.' }, { status: error instanceof SyntaxError ? 400 : 503, headers: privateHeaders });
    }
}

