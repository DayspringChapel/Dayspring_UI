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
    if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
    const actual = normalizeOrigin(request.headers.get('origin'));
    if (!actual) return false;
    const configured = [process.env.APP_ORIGIN, ...(process.env.APP_ORIGINS || '').split(',')].filter((value) => value?.trim());
    // An explicit allowlist is authoritative. Otherwise use only hostnames supplied by
    // Vercel's server environment, never caller-controlled Host/X-Forwarded-Host headers.
    const candidates = configured.length ? configured : process.env.VERCEL === '1' ?
        [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map((host) => `https://${host}`) :
        process.env.NODE_ENV !== 'production' ? [new URL(request.url).origin] : [];
    return candidates.some((value) => normalizeOrigin(value) === actual);
}

function normalizeOrigin(value) {
    if (typeof value !== 'string' || !value.trim() || value.trim() === 'null') return null;
    try {
        const url = new URL(value.trim());
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
        return url.origin;
    } catch { return null; }
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

// Preserve rate-limit guidance and a request identifier without forwarding upstream cookies.
export function sessionCheckHeaders(upstreamHeaders) {
    const headers = new Headers(privateHeaders);
    headers.set('X-Dayspring-Session-Source', 'backend');
    for (const name of ['retry-after', 'x-correlation-id']) {
        const value = upstreamHeaders.get(name);
        if (value) headers.set(name, value);
    }
    return headers;
}
