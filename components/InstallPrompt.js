'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useInstallApp } from '@/lib/useInstallApp';

const STORAGE_KEY = 'dayspring_install_prompt';
const SHOW_AFTER_MS = 20000;
// Days to wait after each dismissal; the last value repeats, so the reminder never stops entirely
// (until the app is installed) but becomes rare.
const SNOOZE_DAYS = [3, 7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

function readState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return { dismissals: Number(saved.dismissals) || 0, nextAt: Number(saved.nextAt) || 0 };
    } catch {
        return { dismissals: 0, nextAt: 0 };
    }
}

function snooze() {
    const { dismissals } = readState();
    const days = SNOOZE_DAYS[Math.min(dismissals, SNOOZE_DAYS.length - 1)];
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissals: dismissals + 1, nextAt: Date.now() + days * DAY_MS }));
    } catch { /* storage unavailable: the prompt just may reappear sooner */ }
}

/**
 * A friendly "install the app" banner on the public site. It appears a little while into a visit,
 * and when dismissed comes back later (3, 7, 14, then every 30 days). Never shown once installed,
 * and never in the staff area, where guided tours already use the screen.
 */
export default function InstallPrompt() {
    const pathname = usePathname();
    const { canInstall, canPrompt, promptInstall } = useInstallApp();
    const [visible, setVisible] = useState(false);

    const eligible = canInstall && !pathname?.startsWith('/admin');

    useEffect(() => {
        if (!eligible) return;
        if (Date.now() < readState().nextAt) return;
        const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
        return () => clearTimeout(timer);
    }, [eligible]);

    if (!eligible || !visible) return null;

    function dismiss() {
        snooze();
        setVisible(false);
    }

    async function install() {
        const outcome = await promptInstall();
        if (outcome === 'accepted') setVisible(false);
        else dismiss();
    }

    return (
        <div role="dialog" aria-label="Install the DaySpring Chapel app"
            className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10 md:left-auto md:right-6">
            <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200" />
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">Install DaySpring Chapel</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                        {canPrompt
                            ? 'Open sermons, events and giving in one tap, right from your home screen.'
                            : 'On iPhone or iPad: tap the Share button in Safari, then choose “Add to Home Screen”.'}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={dismiss}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    {canPrompt ? 'Not now' : 'Got it'}
                </button>
                {canPrompt && (
                    <button type="button" onClick={install}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark">
                        Install
                    </button>
                )}
            </div>
        </div>
    );
}
