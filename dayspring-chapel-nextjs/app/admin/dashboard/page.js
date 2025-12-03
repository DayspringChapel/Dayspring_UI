'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import BirthdayWidget from '@/components/admin/widgets/BirthdayWidget';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        appointments: 0,
        events: 0,
        books: 0,
        sermons: 0,
        requisitions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [appointments, events, books, sermons, requisitions] =
                await Promise.all([
                    apiClient.getAppointments().catch(() => []),
                    apiClient.getEvents().catch(() => []),
                    apiClient.getBooks().catch(() => []),
                    apiClient.getSermons().catch(() => []),
                    apiClient.getRequisitions().catch(() => []),
                ]);

            setStats({
                appointments: Array.isArray(appointments) ? appointments.length : 0,
                events: Array.isArray(events) ? events.length : 0,
                books: Array.isArray(books) ? books.length : 0,
                sermons: Array.isArray(sermons) ? sermons.length : 0,
                requisitions: Array.isArray(requisitions) ? requisitions.length : 0,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Manage Content',
            description: 'Add or edit events, sermons, books, and albums',
            icon: '📝',
            path: '/admin/content',
            color: '#D9752C', // Brand orange
        },
        {
            title: 'Appointments',
            description: 'View and manage appointment requests',
            icon: '📅',
            path: '/admin/appointments',
            color: '#6ee7b7', // Soft mint
        },
        {
            title: 'Requisitions',
            description: 'Review and approve requisition requests',
            icon: '📋',
            path: '/admin/requisitions',
            color: '#fbbf24', // Soft amber
        },
        {
            title: 'Members',
            description: 'Manage member profiles and birthdays',
            icon: '👥',
            path: '/admin/members',
            color: '#f9a8d4', // Soft pink
        },
    ];

    const statCards = [
        {
            title: 'Appointments',
            value: stats.appointments,
            icon: '📅',
            color: '#D9752C', // Brand orange
        },
        {
            title: 'Events',
            value: stats.events,
            icon: '🎉',
            color: '#6ee7b7', // Soft mint
        },
        {
            title: 'Books',
            value: stats.books,
            icon: '📚',
            color: '#fbbf24', // Soft amber
        },
        {
            title: 'Sermons',
            value: stats.sermons,
            icon: '🎤',
            color: '#f9a8d4', // Soft pink
        },
        {
            title: 'Requisitions',
            value: stats.requisitions,
            icon: '📋',
            color: '#93c5fd', // Soft blue
        },
    ];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcomeSection}>
                <h1>Welcome back! 👋</h1>
                <p>Here's what's happening with your church today.</p>
            </div>

            <div className={styles.dashboardGrid}>
                <div className={styles.mainContent}>
                    <div className={styles.statsGrid}>
                        {statCards.map((stat) => (
                            <div
                                key={stat.title}
                                className={styles.statCard}
                                style={{ '--accent-color': stat.color }}
                            >
                                <div className={styles.statIcon}>{stat.icon}</div>
                                <div className={styles.statContent}>
                                    <h3>{stat.title}</h3>
                                    <p className={styles.statValue}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.quickActionsSection}>
                        <h2>Quick Actions</h2>
                        <div className={styles.actionsGrid}>
                            {quickActions.map((action) => (
                                <button
                                    key={action.path}
                                    className={styles.actionCard}
                                    onClick={() => router.push(action.path)}
                                    style={{ '--action-color': action.color }}
                                >
                                    <div className={styles.actionIcon}>{action.icon}</div>
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                    <div className={styles.actionArrow}>→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.sidebarContent}>
                    <BirthdayWidget />
                </div>
            </div>
        </div>
    );
}
