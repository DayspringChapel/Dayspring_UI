'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import SuperAdminDashboard from './SuperAdminDashboard';
import ChurchAdminDashboard from './ChurchAdminDashboard';
import ChurchMediaDashboard from './ChurchMediaDashboard';

function resolveRole(userData) {
    if (!userData) return 'member';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    if (name.includes('admin')) return 'churchAdmin';
    return 'member';
}

function resolveUserName(userData) {
    if (!userData) return 'Admin';
    return userData.userName || userData.UserName || userData.username || 'Admin';
}

export default function DashboardPage() {
    const router = useRouter();
    const userData = apiClient.getUserData();
    const role = resolveRole(userData);
    const userName = resolveUserName(userData);

    // There is no dashboard for a plain member yet. Content contributors (a member with a
    // contentRole) still have real work to do in the admin panel, so send them straight to it
    // instead of a broken/empty dashboard; everyone else is sent back to the public site.
    useEffect(() => {
        if (role !== 'member') return;
        const userId = userData?.id || userData?.Id;
        if (!userId) {
            router.replace('/');
            return;
        }
        apiClient.getMemberByUserId(userId)
            .then((member) => router.replace(member?.contentRole ? '/admin/media' : '/'))
            .catch(() => router.replace('/'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    if (role === 'superAdmin') return <SuperAdminDashboard userName={userName} />;
    if (role === 'churchMedia') return <ChurchMediaDashboard userName={userName} />;
    if (role === 'churchAdmin') return <ChurchAdminDashboard userName={userName} />;

    return <LoadingSpinner message="Redirecting…" minHeight="100vh" />;
}
