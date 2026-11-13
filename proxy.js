import { NextResponse } from 'next/server';

export function proxy(request) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const development = process.env.NODE_ENV === 'development';
    const policy = [
        "default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:", "media-src 'self' blob: https:",
        `connect-src 'self' https:${development ? ' ws: wss:' : ''}`, "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://www.google.com",
        "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
    ].join('; ');
    const headers = new Headers(request.headers); headers.set('x-nonce', nonce); headers.set('Content-Security-Policy', policy);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set('Content-Security-Policy', policy);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
}
export const config = { matcher: ['/((?!api/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|woff2?|mp4|mp3)$).*)'] };
