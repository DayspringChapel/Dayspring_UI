'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { accessRuleFor } from '@/lib/routePermissions';
import { canSeeItem } from '@/lib/permissionTiles';
import NoAccess from '@/components/admin/NoAccess';
import Sidebar from '@/components/admin/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfileBadge from '@/components/admin/ProfileBadge';
import PageGuide from '@/components/admin/PageGuide';
import styles from './admin.module.css';

export default function ProtectedAdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(() => apiClient.getCurrentPermissions());
    // 'pending' until the permissions have been re-read from the server, so a role change takes effect
    // without a fresh login; 'failed' (e.g. offline) falls back to what is stored, and the API still enforces access.
    const [permissionsCheck, setPermissionsCheck] = useState('pending');

    useEffect(() => {
        apiClient.refreshCurrentUserPermissions()
            .then(() => { setPermissions(apiClient.getCurrentPermissions()); setPermissionsCheck('done'); })
            .catch(() => setPermissionsCheck('failed'));
    }, []);
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

    useEffect(() => {
        const token = apiClient.getToken();

        if (!token) {
            router.replace('/admin/login');
            Promise.resolve().then(() => setLoading(false));
            return;
        }

        Promise.resolve().then(() => setLoading(false));
    }, [router]);

    const token = typeof window !== 'undefined' ? apiClient.getToken() : null;

    if (!loading && !token) {
        return null;
    }

    if (loading) {
        return <LoadingSpinner message="Preparing your dashboard" minHeight="100vh" />;
    }

    // Is this page open to the signed-in user? Deny only once the permissions are fresh, so a stale
    // stored list never shows a false "no access".
    const rule = accessRuleFor(pathname);
    const allowedNow = !rule || canSeeItem(rule, (p) => permissions.includes(p));
    const access = allowedNow || permissionsCheck === 'failed' ? 'allowed' : permissionsCheck === 'pending' ? 'checking' : 'denied';

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
                    <h1 className={styles.pageTitle}>DaySpring Chapel CMS</h1>
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
