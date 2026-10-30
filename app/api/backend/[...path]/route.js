import { sessionAuthorization, selectedChurchHeader, isTrustedOrigin, privateHeaders, backendFetch } from '@/lib/session.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request, context) {
    const { path } = await context.params;
    // Fixed upstream, encoded path segments, no redirects or caller-supplied credentials.
    if (path.length < 3 || path[0] !== 'api' || !/^v\d+$/.test(path[1]) ||
        path.some((part) => !part || part === '.' || part === '..' || /[\\/\x00-\x1f]/.test(part)) ||
        (path[2].toLowerCase() === 'users' && /^(login|refresh-token|revoke-token|browser-session)$/i.test(path[3] || ''))) {
        return Response.json({ message: 'Unknown API route.' }, { status: 404, headers: privateHeaders });
    }
    const method = request.method.toUpperCase();
    const read = method === 'GET' || method === 'HEAD';
    if (!read && !isTrustedOrigin(request)) return Response.json({ message: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
    const headers = new Headers();
    for (const name of ['content-type', 'idempotency-key', 'if-match', 'accept']) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }
    const authorization = sessionAuthorization(request);
    if (authorization) headers.set('Authorization', authorization);
    if (authorization) for (const [key, value] of Object.entries(selectedChurchHeader(request))) headers.set(key, value);
    try {
        const upstream = await backendFetch(`/${path.map(encodeURIComponent).join('/')}${new URL(request.url).search}`, {
            method, headers, ...(!read ? { body: request.body, duplex: 'half' } : {}),
        });
        if (upstream.status >= 300 && upstream.status < 400) throw new Error('Unexpected redirect');
        const responseHeaders = new Headers(privateHeaders);
        // Service-worker caching requires proof that no session credential went upstream.
        // This flag is never trusted from the browser or copied from arbitrary API responses.
        if (!authorization && method === 'GET' && /^(Sermons|Series|Events|ChurchPrograms|CalendarYears|Books|Albums|Images)$/i.test(path[2]))
            responseHeaders.set('X-Dayspring-Public', 'true');
        for (const name of ['content-type', 'content-disposition', 'retry-after', 'etag', 'idempotency-replayed', 'x-correlation-id']) {
            const value = upstream.headers.get(name);
            if (value) responseHeaders.set(name, value);
        }
        return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    } catch {
        return Response.json({ message: read ? 'The service is unavailable.' : 'The result could not be confirmed. Check the record before trying again.' },
            { status: 502, headers: privateHeaders });
    }
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
