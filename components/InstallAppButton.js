'use client';

import { useEffect, useState } from 'react';

// "Install app" button. Chrome, Edge and Android offer installing through a browser event, which
// this button triggers. iPhone/iPad Safari has no such event, so there it shows the manual steps.
// Hidden when the site is already running as an installed app.
export default function InstallAppButton() {
    const [installEvent, setInstallEvent] = useState(null);
    const [isIos, setIsIos] = useState(false);
    const [installed, setInstalled] = useState(false);
    const [showIosHelp, setShowIosHelp] = useState(false);

    useEffect(() => {
        Promise.resolve().then(() => {
            setInstalled(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
            setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream);
        });

        const onPrompt = (event) => { event.preventDefault(); setInstallEvent(event); };
        const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    if (installed || (!installEvent && !isIos)) return null;

    async function install() {
        if (installEvent) {
            installEvent.prompt();
            await installEvent.userChoice;
            setInstallEvent(null);
        } else {
            setShowIosHelp((open) => !open);
        }
    }

    return (
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <button type="button" onClick={install}
                className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Install the DaySpring app
            </button>
            {showIosHelp && (
                <p className="max-w-xs text-xs text-white/70">
                    On iPhone or iPad: tap the Share button in Safari, then choose &ldquo;Add to Home Screen&rdquo;.
                </p>
            )}
        </div>
    );
}
