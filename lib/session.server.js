// Server-only helpers. Never import this module into a client component.
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-dayspring_session' : 'dayspring_session';
export const BACKEND_API_URL = (
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    'https://dayspring-backend-4ar8.onrender.com'
).replace(/\/$/, '');

export function sessionAuthorization(request) {
    const raw = request.headers.get('cookie') || '';
    const value = raw.split(';').map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
    return value && /^[a-f0-9]{64}$/i.test(value) ? `Session ${value}` : null;
}

export function selectedChurchHeader(request) {
    const value = (request.headers.get('cookie') || '').split(';').map((p) => p.trim()).find((p) => p.startsWith('dayspring_church='))?.slice('dayspring_church='.length);
    return value && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value) ? { 'X-Church-Id': value } : {};
}

export function isTrustedOrigin(request) {
    const expected = process.env.APP_ORIGIN || (process.env.NODE_ENV !== 'production' ? new URL(request.url).origin : null);
    return !!expected && request.headers.get('origin') === expected &&
        request.headers.get('sec-fetch-site') !== 'cross-site';
}

export function cookieSettings() {
    return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' };
}

export const privateHeaders = { 'Cache-Control': 'no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };

export async function backendFetch(path, options = {}) {
    return fetch(`${BACKEND_API_URL}${path}`, {
        ...options, cache: 'no-store', redirect: 'manual',
        signal: options.signal || AbortSignal.timeout(120000),
    });
}
