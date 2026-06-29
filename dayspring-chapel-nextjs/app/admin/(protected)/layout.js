'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Sidebar from '@/components/admin/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './admin.module.css';

export default function ProtectedAdminLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const token = apiClient.getToken();

        if (!token) {
            setLoading(false);
            router.replace('/admin/login');
            return;
        }

        setLoading(false);
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
                    <h1 className={styles.pageTitle}>Admin Dashboard</h1>
                </header>
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
