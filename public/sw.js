// DaySpring service worker.
//
// What it does:
//  - Hashed build files (/_next/static) and site images: cached after first load, so repeat visits are fast.
//  - Public pages you have already opened: always fetched fresh when online; the last copy is shown offline.
//  - Public content API (sermons, events, books, albums...): fetched fresh when online; last copy offline.
//  - Anything else offline: a friendly "you're offline" page.
//
// What it never does: cache the /admin area, any request carrying a login token, or any non-GET request.
// Pages and data are network-first, so a new deploy or new content is never hidden behind a stale copy.
// Bump VERSION to drop every old cache.
const VERSION = 'v2';
const SHELL = `dayspring-shell-${VERSION}`;
const STATIC = `dayspring-static-${VERSION}`;
const PAGES = `dayspring-pages-${VERSION}`;
const DATA = `dayspring-data-${VERSION}`;
const CURRENT = [SHELL, STATIC, PAGES, DATA];

const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png'];

const MAX_ENTRIES = { [STATIC]: 150, [PAGES]: 30, [DATA]: 60 };

// Read-only public content. Everything else on the API (users, members, appointments, comments,
// settings, reports...) is left alone.
const PUBLIC_API = /^\/api\/v1\/(Sermons|Series|Events|ChurchPrograms|CalendarYears|Books|Albums|Images)(\/|$)/i;
const IMAGE_OR_FONT = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf)$/i;

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => !CURRENT.includes(key)).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const sameOrigin = url.origin === self.location.origin;

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request, url));
        return;
    }

    // Never cache anything that carries a login token.
    if (request.headers.has('Authorization')) return;

    if (sameOrigin) {
        if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/')) return;
        if (url.pathname.startsWith('/_next/static/')) {
            event.respondWith(cacheFirst(request, STATIC));
        } else if (IMAGE_OR_FONT.test(url.pathname)) {
            event.respondWith(staleWhileRevalidate(request, STATIC));
        }
        return;
    }

    if (PUBLIC_API.test(url.pathname)) {
        event.respondWith(networkFirst(request, DATA));
    }
});

async function handleNavigation(request, url) {
    const isStaffArea = url.pathname.startsWith('/admin');
    try {
        const response = await fetch(request);
        if (!isStaffArea && response.ok && !response.redirected) {
            await put(PAGES, request, response.clone());
        }
        return response;
    } catch {
        if (!isStaffArea) {
            const cached = await caches.match(request, { cacheName: PAGES });
            if (cached) return cached;
        }
        const offline = await caches.match(OFFLINE_URL, { cacheName: SHELL });
        return offline || Response.error();
    }
}

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request, { cacheName });
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await put(cacheName, request, response.clone());
    return response;
}

async function staleWhileRevalidate(request, cacheName) {
    const cached = await caches.match(request, { cacheName });
    const refresh = fetch(request)
        .then(async (response) => {
            if (response.ok) await put(cacheName, request, response.clone());
            return response;
        })
        .catch(() => null);
    return cached || (await refresh) || Response.error();
}

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) await put(cacheName, request, response.clone());
        return response;
    } catch {
        const cached = await caches.match(request, { cacheName });
        return cached || Response.error();
    }
}

async function put(cacheName, request, response) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    const max = MAX_ENTRIES[cacheName];
    if (!max) return;
    const keys = await cache.keys();
    if (keys.length > max) {
        await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)));
    }
}
