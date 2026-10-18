'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

// Content roles a media-unit member can hold (matches the backend's ContentPersonnelRole).
export const CONTENT_ROLE = { MEDIA: 1, GRAPHICS: 2, SOCIAL_MEDIA: 3 };

/**
 * The signed-in user's content role, read from their member record: { loaded, role }.
 * `role` is null when they have none. Cosmetic only; the API enforces who may do what.
 */
export function useContentRole() {
    const [state, setState] = useState({ loaded: false, role: null });

    useEffect(() => {
        let cancelled = false;
        const finish = (role) => { if (!cancelled) setState({ loaded: true, role }); };

        const me = apiClient.getUserData();
        const userId = me?.id || me?.Id;
        if (!userId) {
            Promise.resolve().then(() => finish(null));
        } else {
            apiClient.getMemberByUserId(userId)
                .then((member) => finish(member?.contentRole ?? null))
                .catch(() => finish(null));
        }
        return () => { cancelled = true; };
    }, []);

    return state;
}
