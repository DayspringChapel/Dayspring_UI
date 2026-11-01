'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { accessRuleFor } from '@/lib/routePermissions';
import { canAccessPath, landingPath } from '@/lib/access';
import { canSeeItem } from '@/lib/permissionTiles';
import NoAccess from '@/components/admin/NoAccess';
import Sidebar from '@/components/admin/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfileBadge from '@/components/admin/ProfileBadge';
import PageGuide from '@/components/admin/PageGuide';
import styles from './admin.module.css';
import { PLATFORM_BRANDING } from '@/lib/branding';

export default function ProtectedAdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(() => apiClient.getCurrentPermissions());
    const [permissionsCheck, setPermissionsCheck] = useState('pending');

    useEffect(() => {
        let active = true;
        const check = () => apiClient.restoreSession()
            .then((user) => {
                if (!active) return;
                if (!user) router.replace('/admin/login');
                else if (pathname === '/admin/dashboard' && !canAccessPath(user, pathname)) {
                    const destination = landingPath(user, (path) => { const rule = accessRuleFor(path); return !rule || canSeeItem(rule, (permission) => apiClient.hasPermission(permission)); });
                    if (destination) router.replace(destination);
                }
                setPermissions(apiClient.getCurrentPermissions());
                setPermissionsCheck('done');
                setLoading(false);
            })
            .catch(() => { if (active) { setPermissionsCheck('failed'); setLoading(false); } });
        const sync = () => setPermissions(apiClient.getCurrentPermissions());
        check();
        const interval = setInterval(check, 60000);
        window.addEventListener('focus', check);
        window.addEventListener('dayspring:permissions', sync);
        return () => {
            active = false;
            clearInterval(interval);
            window.removeEventListener('focus', check);
            window.removeEventListener('dayspring:permissions', sync);
        };
    }, [pathname, router]);
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading) {
        return <LoadingSpinner message={`Preparing ${PLATFORM_BRANDING.name}`} minHeight="100vh" />;
    }
    if (permissionsCheck === 'failed') return <div role="alert" style={{ padding: '2rem' }}>
        <p>Your session could not be verified. Check your connection and try again.</p>
        <button onClick={() => window.location.reload()}>Try again</button>
    </div>;
    if (!apiClient.hasSession()) return null;

    // Is this page open to the signed-in user? Deny only once the permissions are fresh, so a stale
    // stored list never shows a false "no access".
    const rule = accessRuleFor(pathname);
    const allowedNow = canAccessPath(apiClient.getUserData(), pathname) && (!rule || canSeeItem(rule, (p) => permissions.includes(p)));
    const access = permissionsCheck === 'pending' ? 'checking' : allowedNow ? 'allowed' : 'denied';

    return (
        <div className={styles.adminLayout}>
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className={`${styles.mainContent} ${!sidebarOpen ? styles.expanded : ''}`}>
                <header className={styles.header}>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 12H21M3 6H21M3 18H21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                    <h1 className={styles.pageTitle}>{PLATFORM_BRANDING.name}</h1>
                    <div style={{ marginLeft: 'auto' }}>
                        <ProfileBadge />
                    </div>
                </header>
                <main className={styles.content}>
                    {access === 'denied' ? <NoAccess /> : access === 'checking' ? <LoadingSpinner message="Checking access" /> : children}
                </main>
                <PageGuide />
            </div>
        </div>
    );
}
