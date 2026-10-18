'use client';

import { useEffect } from 'react';

// Registers the service worker (public/sw.js). Production only, so local development never
// gets a service worker in the way. `updateViaCache: 'none'` makes the browser re-check sw.js
// on every visit, so a new version is picked up straight after a deploy.
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((error) => {
            console.error('Service worker registration failed:', error);
        });
    }, []);

    return null;
}
