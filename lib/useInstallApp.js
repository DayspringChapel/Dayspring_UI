'use client';

import { useCallback, useEffect, useState } from 'react';

// Chrome, Edge and Android fire `beforeinstallprompt` once, possibly before any component has
// mounted, so it is captured here at module level and shared by everything that offers installing.
let deferredPrompt = null;
const subscribers = new Set();
const notify = () => subscribers.forEach((update) => update());

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        notify();
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        notify();
    });
}

function read() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    return {
        ready: true,
        installed: standalone,
        canPrompt: deferredPrompt !== null,
        // iPhone/iPad Safari has no install event; people have to use Share, then Add to Home Screen.
        isIos: /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream,
    };
}

export function useInstallApp() {
    const [state, setState] = useState({ ready: false, installed: false, canPrompt: false, isIos: false });

    useEffect(() => {
        const update = () => setState(read());
        subscribers.add(update);
        Promise.resolve().then(update);
        return () => { subscribers.delete(update); };
    }, []);

    // Resolves to 'accepted', 'dismissed', or null when there is nothing to prompt.
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return null;
        const event = deferredPrompt;
        deferredPrompt = null;
        notify();
        event.prompt();
        const { outcome } = await event.userChoice;
        return outcome;
    }, []);

    const canInstall = state.ready && !state.installed && (state.canPrompt || state.isIos);
    return { ...state, canInstall, promptInstall };
}
