'use client';

import { useState } from 'react';
import { useInstallApp } from '@/lib/useInstallApp';

// Always-available "Install app" button (footer). Chrome, Edge and Android open the install
// prompt; iPhone/iPad Safari shows the manual steps. Hidden once the app is installed.
export default function InstallAppButton() {
    const { canInstall, canPrompt, promptInstall } = useInstallApp();
    const [showIosHelp, setShowIosHelp] = useState(false);

    if (!canInstall) return null;

    return (
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <button type="button"
                onClick={() => (canPrompt ? promptInstall() : setShowIosHelp((open) => !open))}
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
