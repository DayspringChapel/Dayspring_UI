'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Sidebar from '@/components/admin/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProfileBadge from '@/components/admin/ProfileBadge';
import styles from './admin.module.css';

export default function ProtectedAdminLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
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
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
