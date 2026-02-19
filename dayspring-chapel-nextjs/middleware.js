    import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if the request is for admin routes (except login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        // Check for token in cookies or handle client-side
        // Since we're using localStorage, we'll handle this on the client side
        // This middleware just ensures the route exists
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
