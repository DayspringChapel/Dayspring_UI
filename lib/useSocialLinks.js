'use client';

import { useEffect, useState } from 'react';
import { CHURCH_SOCIAL_PROFILES } from './branding.js';

const DEFAULTS = { whatsAppNumber: '', ...CHURCH_SOCIAL_PROFILES, youTubeChannelId: '' };

// Fetches the admin-configured social/contact links (footer icons, the
// floating WhatsApp button, and the YouTube feed all key off this) from the
// public `/api/livestream` proxy, which already forwards the backend's
// site-settings response including the `social` block.
export function useSocialLinks() {
    const [social, setSocial] = useState(DEFAULTS);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/livestream')
            .then((r) => r.json())
            .then((d) => {
                if (cancelled) return;
                const saved = d.social || {};
                setSocial({
                    ...DEFAULTS, ...saved,
                    facebookPageUrl: saved.facebookPageUrl?.trim() || DEFAULTS.facebookPageUrl,
                    instagramPageUrl: saved.instagramPageUrl?.trim() || DEFAULTS.instagramPageUrl,
                    youTubeChannelUrl: saved.youTubeChannelUrl?.trim() || DEFAULTS.youTubeChannelUrl,
                });
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    return social;
}

export function whatsAppLink(number, message) {
    const digits = (number || '').replace(/[^\d]/g, '');
    if (!digits) return null;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${digits}${text}`;
}
