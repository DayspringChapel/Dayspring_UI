'use client';

import { useCallback, useEffect, useState } from 'react';

// Chrome, Edge and Android fire `beforeinstallprompt` once, possibly before any component has
// mounted, so it is captured here at module level and shared by everything that offers installing.
let deferredPrompt = null;
const subscribers = new Set();
const notify = () => subscribers.forEach((update) => update());
const INSTALLED_KEY = 'dayspring_app_installed';
let installedThisVisit = false;
function rememberInstalled() {
    installedThisVisit = true;
    deferredPrompt = null;
    try { localStorage.setItem(INSTALLED_KEY, '1'); } catch { /* Session memory remains available. */ }
    notify();
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        notify();
    });
    window.addEventListener('appinstalled', () => {
        rememberInstalled();
    });
    window.addEventListener('storage', (event) => { if (event.key === INSTALLED_KEY) notify(); });
}

function read() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    let remembered = installedThisVisit;
    try { remembered ||= localStorage.getItem(INSTALLED_KEY) === '1'; } catch { /* Storage may be disabled. */ }
    if (standalone) {
        installedThisVisit = true;
        try { localStorage.setItem(INSTALLED_KEY, '1'); } catch { /* Ignore unavailable storage. */ }
    }
    return {
        ready: true,
        installed: standalone || remembered,
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
        const display = window.matchMedia('(display-mode: standalone)');
        display.addEventListener('change', update);
        window.addEventListener('pageshow', update);
        return () => { subscribers.delete(update); display.removeEventListener('change', update); window.removeEventListener('pageshow', update); };
    }, []);

    // Resolves to 'accepted', 'dismissed', or null when there is nothing to prompt.
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return null;
        const event = deferredPrompt;
        deferredPrompt = null;
        notify();
        event.prompt();
        const { outcome } = await event.userChoice;
        if (outcome === 'accepted') rememberInstalled();
        return outcome;
    }, []);

    const canInstall = state.ready && !state.installed && (state.canPrompt || state.isIos);
    return { ...state, canInstall, promptInstall, markInstalled: rememberInstalled };
}
