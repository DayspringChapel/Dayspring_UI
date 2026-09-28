'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

const REFRESH_MS = 60000;

function isToday(dateString) {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

// Pending/actionable counts shown as sidebar badges. Each fetch is best-effort:
// a role without the underlying permission gets a 403 (or the item isn't shown
// at all), so every branch swallows its own error rather than failing the rest.
export default function useSidebarCounts(role) {
    const [counts, setCounts] = useState({ appointments: 0, requisitions: 0, approvals: 0, birthdays: 0 });

    useEffect(() => {
        let cancelled = false;
        const canManage = role === 'superAdmin' || role === 'churchAdmin';

        async function load() {
            const [appointments, requisitions, approvals, birthdays] = await Promise.all([
                canManage ? apiClient.getAppointments().catch(() => []) : Promise.resolve([]),
                canManage ? apiClient.getRequisitions().catch(() => []) : Promise.resolve([]),
                canManage
                    ? (role === 'superAdmin' ? apiClient.getSuperAdminApprovalQueue() : apiClient.getAdminApprovalQueue()).catch(() => [])
                    : Promise.resolve([]),
                apiClient.getBirthdays().catch(() => []),
            ]);
            if (cancelled) return;

            setCounts({
                appointments: appointments.filter((a) => (a.status ?? 0) === 0).length,
                requisitions: requisitions.filter((r) => (r.status ?? 0) === 0).length,
                approvals: approvals.length,
                birthdays: birthdays.filter((b) => isToday(b.dateOfBirth)).length,
            });
        }

        load();
        const id = setInterval(load, REFRESH_MS);
        return () => { cancelled = true; clearInterval(id); };
    }, [role]);

    return counts;
}
