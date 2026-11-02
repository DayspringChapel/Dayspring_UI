'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { accessRuleFor } from '@/lib/routePermissions';
import { canAccessPath, landingPath } from '@/lib/access';
import { canSeeItem } from '@/lib/permissionTiles';
import NoAccess from '@/components/admin/NoAccess';
import SessionRecovery from '@/components/admin/SessionRecovery';
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
    const [sessionError, setSessionError] = useState(null);
    const [retryVersion, setRetryVersion] = useState(0);

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
                setSessionError(null);
                setPermissionsCheck('done');
                setLoading(false);
            })
            .catch((error) => { if (active) { setSessionError(error); setPermissionsCheck('failed'); setLoading(false); } });
        const sync = () => setPermissions(apiClient.getCurrentPermissions());
        let resumeTimer;
        const resume = () => { clearTimeout(resumeTimer); resumeTimer = setTimeout(check, 250); };
        const visible = () => { if (document.visibilityState === 'visible') resume(); };
        check();
        const interval = setInterval(() => { if (document.visibilityState !== 'hidden') check(); }, 60000);
        window.addEventListener('focus', resume);
        window.addEventListener('online', resume);
        document.addEventListener('visibilitychange', visible);
        window.addEventListener('dayspring:permissions', sync);
        return () => {
            active = false;
            clearInterval(interval);
            clearTimeout(resumeTimer);
            window.removeEventListener('focus', resume);
            window.removeEventListener('online', resume);
            document.removeEventListener('visibilitychange', visible);
            window.removeEventListener('dayspring:permissions', sync);
        };
    }, [pathname, router, retryVersion]);
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
    if (permissionsCheck === 'failed') return <SessionRecovery error={sessionError}
        onRetry={() => { setLoading(true); setPermissionsCheck('pending'); setRetryVersion((value) => value + 1); }}
        onSignIn={() => router.replace('/admin/login')} />;
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
