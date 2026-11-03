'use client';
import apiClient from '@/lib/apiClient';
import SuperAdminDashboard from './SuperAdminDashboard';
import ChurchAdminDashboard from './ChurchAdminDashboard';
import ChurchMediaDashboard from './ChurchMediaDashboard';
import OsOverview from '@/components/admin/OsOverview';
import ConfiguredDashboard from '@/components/admin/ConfiguredDashboard';
export default function DashboardPage() {
    const user = apiClient.getUserData(); const role = user?.role?.name || user?.role || ''; const name = user?.userName || 'User';
    if (user?.access?.configured || !['superAdmin', 'churchAdmin', 'churchMedia'].includes(role)) return <ConfiguredDashboard />;
    if (user?.legacyChurch === false) return <OsOverview />;
    if (role === 'superAdmin') return <><SuperAdminDashboard userName={name} /><OsOverview /></>;
    if (role === 'churchAdmin') return <><ChurchAdminDashboard userName={name} /><OsOverview /></>;
    return <ChurchMediaDashboard userName={name} />;
}