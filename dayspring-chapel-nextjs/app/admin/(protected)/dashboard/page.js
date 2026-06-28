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
        units: 0,
        smallGroups: 0,
        media: 0,
        pendingApprovals: 0,
        scheduledPosts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [
                appointmentsRes, eventsRes, booksRes, sermonsRes,
                requisitionsRes, unitsRes, smallGroupsRes,
                mediaRes, approvalsRes, scheduledRes,
            ] = await Promise.all([
                apiClient.getAppointments().catch(() => []),
                apiClient.getEvents().catch(() => []),
                apiClient.getBooks().catch(() => []),
                apiClient.getSermons().catch(() => []),
                apiClient.getRequisitions().catch(() => []),
                apiClient.getUnits().catch(() => []),
                apiClient.getSmallGroups().catch(() => []),
                apiClient.getMediaContents().catch(() => []),
                apiClient.getAdminApprovalQueue().catch(() => []),
                apiClient.getAllScheduledPosts().catch(() => []),
            ]);

            const getCount = (response) => {
                const data = response?.data || response || [];
                return Array.isArray(data) ? data.length : 0;
            };

            setStats({
                appointments: getCount(appointmentsRes),
                events: getCount(eventsRes),
                books: getCount(booksRes),
                sermons: getCount(sermonsRes),
                requisitions: getCount(requisitionsRes),
                units: getCount(unitsRes),
                smallGroups: getCount(smallGroupsRes),
                media: getCount(mediaRes),
                pendingApprovals: getCount(approvalsRes),
                scheduledPosts: getCount(scheduledRes),
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { title: 'Manage Content', description: 'Add or edit events, sermons, books, and albums', icon: 'CM', path: '/admin/content', color: '#D9752C' },
        { title: 'Appointments', description: 'View and manage appointment requests', icon: 'AP', path: '/admin/appointments', color: '#0f766e' },
        { title: 'Requisitions', description: 'Review and approve requisition requests', icon: 'RQ', path: '/admin/requisitions', color: '#b45309' },
        { title: 'Members', description: 'Manage member profiles and birthdays', icon: 'MB', path: '/admin/members', color: '#be123c' },
        { title: 'Media Library', description: 'Upload and manage media content files', icon: 'ML', path: '/admin/media', color: '#7c3aed' },
        { title: 'Workflow', description: 'Route content through the approval pipeline', icon: 'WF', path: '/admin/workflow', color: '#0369a1' },
        { title: 'Approvals', description: 'Approve or reject pending content submissions', icon: 'AV', path: '/admin/approvals', color: '#15803d' },
        { title: 'Publishing', description: 'Schedule and track publishing across platforms', icon: 'PB', path: '/admin/publishing', color: '#9f1239' },
    ];

    const statCards = [
        { title: 'Appointments', value: stats.appointments, icon: 'AP', color: '#D9752C', note: 'Pastoral requests' },
        { title: 'Events', value: stats.events, icon: 'EV', color: '#0f766e', note: 'Upcoming moments' },
        { title: 'Books', value: stats.books, icon: 'BK', color: '#b45309', note: 'Library resources' },
        { title: 'Sermons', value: stats.sermons, icon: 'SR', color: '#be123c', note: 'Messages available' },
        { title: 'Requisitions', value: stats.requisitions, icon: 'RQ', color: '#2563eb', note: 'Requests to review' },
        { title: 'Units', value: stats.units, icon: 'UN', color: '#4f46e5', note: 'Departments' },
        { title: 'Small Groups', value: stats.smallGroups, icon: 'SG', color: '#15803d', note: 'Care groups' },
        { title: 'Media Content', value: stats.media, icon: 'MD', color: '#7c3aed', note: 'Content uploads' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: 'PA', color: '#b91c1c', note: 'Awaiting review' },
        { title: 'Scheduled Posts', value: stats.scheduledPosts, icon: 'SP', color: '#0369a1', note: 'Publishing queue' },
    ];

    const totalRecords = Object.values(stats).reduce((sum, value) => sum + value, 0);

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
            <section className={styles.welcomeSection}>
                <div>
                    <span className={styles.eyebrow}>Dayspring Admin Center</span>
                    <h1>Welcome back, Admin</h1>
                    <p>A clear overview of church activity, content, people, and pending requests.</p>
                </div>
                <div className={styles.heroMetric}>
                    <span>{totalRecords}</span>
                    <small>Total dashboard records</small>
                </div>
            </section>

            <div className={styles.dashboardGrid}>
                <main className={styles.mainContent}>
                    <section className={styles.statsGrid} aria-label="Dashboard statistics">
                        {statCards.map((stat) => (
                            <article
                                key={stat.title}
                                className={styles.statCard}
                                style={{ '--accent-color': stat.color }}
                            >
                                <div className={styles.statIcon}>{stat.icon}</div>
                                <div className={styles.statContent}>
                                    <h3>{stat.title}</h3>
                                    <p className={styles.statValue}>{stat.value}</p>
                                    <span>{stat.note}</span>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className={styles.quickActionsSection}>
                        <div className={styles.sectionHeader}>
                            <span>Move Quickly</span>
                            <h2>Quick Actions</h2>
                        </div>
                        <div className={styles.actionsGrid}>
                            {quickActions.map((action) => (
                                <button
                                    key={action.path}
                                    className={styles.actionCard}
                                    onClick={() => router.push(action.path)}
                                    style={{ '--action-color': action.color }}
                                >
                                    <div className={styles.actionIcon}>{action.icon}</div>
                                    <div>
                                        <h3>{action.title}</h3>
                                        <p>{action.description}</p>
                                    </div>
                                    <div className={styles.actionArrow}>Open</div>
                                </button>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sidebarContent}>
                    <BirthdayWidget />
                </aside>
            </div>
        </div>
    );
}
