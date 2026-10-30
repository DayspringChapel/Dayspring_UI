import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionAuthorization, selectedChurchHeader, isTrustedOrigin, cookieSettings, privateHeaders, backendFetch } from '@/lib/session.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clearSession(response) {
    response.cookies.set(SESSION_COOKIE, '', { ...cookieSettings(), maxAge: 0 });
    return response;
}

export async function GET(request) {
    const authorization = sessionAuthorization(request);
    if (!authorization) return clearSession(NextResponse.json({ message: 'Sign in to continue.' }, { status: 401, headers: privateHeaders }));
    try {
        const upstream = await backendFetch('/api/v1/Users/me', { headers: { Authorization: authorization, ...selectedChurchHeader(request) } });
        const data = await upstream.json().catch(() => ({}));
        const response = NextResponse.json(data, { status: upstream.status, headers: privateHeaders });
        return upstream.status === 401 ? clearSession(response) : response;
    } catch {
        return NextResponse.json({ message: 'Unable to check your session. Please try again.' }, { status: 503, headers: privateHeaders });
    }
}

export async function POST(request) {
    if (!isTrustedOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
    let body;
    try { body = await request.json(); } catch {
        return NextResponse.json({ message: 'Invalid sign-in request.' }, { status: 400, headers: privateHeaders });
    }
    if (typeof body.userNameOrEmail !== 'string' || typeof body.password !== 'string' ||
        body.userNameOrEmail.length > 254 || body.password.length > 1024) {
        return NextResponse.json({ message: 'Email and password are required.' }, { status: 400, headers: privateHeaders });
    }
    try {
        const upstream = await backendFetch('/api/v1/Users/browser-session', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userNameOrEmail: body.userNameOrEmail, password: body.password, remember: body.remember === true }),
        });
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) return NextResponse.json({ message: data.message || 'Sign-in failed.' }, { status: upstream.status, headers: privateHeaders });
        if (!/^[a-f0-9]{64}$/i.test(data.sessionToken || '')) throw new Error('Invalid upstream session');
        const response = NextResponse.json({ success: true, user: data.user }, { headers: privateHeaders });
        response.cookies.set(SESSION_COOKIE, data.sessionToken, {
            ...cookieSettings(), ...(body.remember === true ? { expires: new Date(data.expiresAt) } : {}),
        });
        response.cookies.set('dayspring_church', '', { path: '/', maxAge: 0, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        return response;
    } catch {
        return NextResponse.json({ message: 'The sign-in service is unavailable.' }, { status: 503, headers: privateHeaders });
    }
}

export async function DELETE(request) {
    if (!isTrustedOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
    const authorization = sessionAuthorization(request);
    try {
        if (authorization) {
            const upstream = await backendFetch('/api/v1/Users/browser-session', { method: 'DELETE', headers: { Authorization: authorization } });
            if (!upstream.ok && upstream.status !== 401) throw new Error('Revocation unavailable');
        }
        return clearSession(new NextResponse(null, { status: 204, headers: privateHeaders }));
    } catch {
        // Keep the cookie until revocation succeeds so logout can be retried accurately.
        return NextResponse.json({ message: 'Sign-out could not be confirmed. Please try again.' }, { status: 503, headers: privateHeaders });
    }
}
