'use client';

import apiClient from '@/lib/apiClient';
import SuperAdminDashboard from './SuperAdminDashboard';
import ChurchAdminDashboard from './ChurchAdminDashboard';
import ChurchMediaDashboard from './ChurchMediaDashboard';

function resolveRole(userData) {
    if (!userData) return 'churchAdmin';
    const r = userData.role || userData.Role || {};
    const name = (typeof r === 'string' ? r : r.name || r.Name || '').toLowerCase();
    if (name.includes('super')) return 'superAdmin';
    if (name.includes('media')) return 'churchMedia';
    return 'churchAdmin';
}

function resolveUserName(userData) {
    if (!userData) return 'Admin';
    return userData.userName || userData.UserName || userData.username || 'Admin';
}

export default function DashboardPage() {
    const userData = apiClient.getUserData();
    const role = resolveRole(userData);
    const userName = resolveUserName(userData);

    if (role === 'superAdmin') return <SuperAdminDashboard userName={userName} />;
    if (role === 'churchMedia') return <ChurchMediaDashboard userName={userName} />;
    return <ChurchAdminDashboard userName={userName} />;
}
