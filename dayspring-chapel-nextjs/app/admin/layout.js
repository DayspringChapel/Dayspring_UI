'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Sidebar from '@/components/admin/Sidebar';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        // Skip auth check on login page
        if (pathname === '/admin/login') {
            setLoading(false);
            return;
        }

        // Check if user is authenticated
        const token = apiClient.getToken();
        if (!token) {
            router.push('/admin/login');
        } else {
            setLoading(false);
        }
    }, [pathname, router]);

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
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
                    <h1 className={styles.pageTitle}>Admin Dashboard</h1>
                </header>
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
