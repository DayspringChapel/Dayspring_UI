'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { fetchSidebarCounts } from '@/lib/sidebarCounts';
export default function useSidebarCounts(permissions = []) {
    const [counts, setCounts] = useState({ appointments:0, requisitions:0, approvals:0, birthdays:0, comments:0 });
    const permissionKey = [...permissions].sort().join('|');
    useEffect(() => {
        let cancelled = false;
        const granted = permissionKey.split('|');
        async function load() { const next = await fetchSidebarCounts(apiClient, granted); if (!cancelled) setCounts(next); }
        const visible = () => { if (document.visibilityState !== 'hidden') load(); };
        load();
        const timer = setInterval(visible, 30000);
        window.addEventListener('focus', visible);
        window.addEventListener('dayspring:workflow-changed',visible);
        return () => { cancelled = true; clearInterval(timer); window.removeEventListener('focus', visible);window.removeEventListener('dayspring:workflow-changed',visible); };
    }, [permissionKey]);
    return counts;
}
