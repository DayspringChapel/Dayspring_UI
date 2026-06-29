'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import BirthdayWidget from '@/components/admin/widgets/BirthdayWidget';
import DonutChart from '@/components/admin/charts/DonutChart';
import BarChart from '@/components/admin/charts/BarChart';
import styles from './dashboard.module.css';

// ── Teal / emerald executive theme ──────────────────────────────────────────
const THEME = {
    '--brand':      '#0d9488',
    '--brand-l':    '#2dd4bf',
    '--brand-dark': '#0f766e',
    '--glow-1':     'rgba(13,148,136,0.55)',
    '--glow-2':     'rgba(34,197,94,0.32)',
    '--hero-a':     '#061c1b',
    '--hero-b':     '#092b28',
};

// Appointment status: 0=Pending, 1=Confirmed, 2=Cancelled
// Requisition status: 0=Pending, 1=Approved, 2=Rejected

export default function ChurchAdminDashboard({ userName }) {
    const router = useRouter();
    const [data, setData]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [navigating, setNavigating] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const [
                appts, events, members, units,
                smallGroups, requisitions, givings,
            ] = await Promise.allSettled([
                apiClient.getAppointments(),
                apiClient.getEvents(),
                apiClient.getMembers(),
                apiClient.getUnits(),
                apiClient.getSmallGroups(),
                apiClient.getRequisitions(),
                apiClient.getGivings(),
            ]);

            const v = (r) => (r.status === 'fulfilled' ? r.value || [] : []);
            const apptsArr = v(appts);
            const reqArr   = v(requisitions);
            const givArr   = Array.isArray(v(givings)) ? v(givings) : [];

            const apptStatus = {
                pending:   apptsArr.filter(a => (a.status ?? 0) === 0).length,
                confirmed: apptsArr.filter(a => (a.status ?? 0) === 1).length,
                cancelled: apptsArr.filter(a => (a.status ?? 0) === 2).length,
            };

            const reqStatus = {
                pending:  reqArr.filter(r => (r.status ?? 0) === 0).length,
                approved: reqArr.filter(r => (r.status ?? 0) === 1).length,
                rejected: reqArr.filter(r => (r.status ?? 0) === 2).length,
            };

            setData({
                stats: {
                    appointments: apptsArr.length,
                    events:       v(events).length,
                    members:      v(members).length,
                    units:        v(units).length,
                    smallGroups:  v(smallGroups).length,
                    requisitions: reqArr.length,
                    givings:      givArr.length,
                    pendingAppts: apptStatus.pending,
                    pendingReqs:  reqStatus.pending,
                },
                apptStatus,
                reqStatus,
            });
        } finally {
            setLoading(false);
        }
    };

    const navigate = useCallback((path) => {
        setNavigating(path);
        router.push(path);
    }, [router]);

    if (loading) return <DashSkeleton />;
    const { stats, apptStatus, reqStatus } = data;

    const topStats = [
        { label: 'Members',              value: stats.members,      color: '#0d9488', note: 'Church members',     icon: '👥' },
        { label: 'Pending Appointments', value: stats.pendingAppts, color: '#ef4444', note: 'Awaiting action',    icon: '⚡', urgent: true },
        { label: 'Pending Requisitions', value: stats.pendingReqs,  color: '#f59e0b', note: 'Needs review',       icon: '📝', urgent: stats.pendingReqs > 0 },
        { label: 'Events',               value: stats.events,       color: '#2dd4bf', note: 'Active events',      icon: '📌' },
        { label: 'Small Groups',         value: stats.smallGroups,  color: '#10b981', note: 'Care groups',        icon: '🤝' },
        { label: 'Departments',          value: stats.units,        color: '#6366f1', note: 'Ministry units',     icon: '🏛️' },
        { label: 'Total Appointments',   value: stats.appointments, color: '#be123c', note: 'All time',           icon: '📋' },
        { label: 'Givings Recorded',     value: stats.givings,      color: '#3b82f6', note: 'Financial records',  icon: '💰' },
    ];

    const apptSegments = [
        { label: 'Pending',   value: apptStatus.pending,   color: '#f59e0b' },
        { label: 'Confirmed', value: apptStatus.confirmed, color: '#10b981' },
        { label: 'Cancelled', value: apptStatus.cancelled, color: '#ef4444' },
    ].filter(s => s.value > 0);

    const reqSegments = [
        { label: 'Pending',  value: reqStatus.pending,  color: '#f59e0b' },
        { label: 'Approved', value: reqStatus.approved, color: '#10b981' },
        { label: 'Rejected', value: reqStatus.rejected, color: '#ef4444' },
    ].filter(s => s.value > 0);

    const ministryBars = [
        { label: 'Members', value: stats.members,      color: '#0d9488' },
        { label: 'Appts',   value: stats.appointments, color: '#be123c' },
        { label: 'Events',  value: stats.events,       color: '#2dd4bf' },
        { label: 'Groups',  value: stats.smallGroups,  color: '#10b981' },
        { label: 'Units',   value: stats.units,        color: '#6366f1' },
        { label: 'Reqs',    value: stats.requisitions, color: '#f59e0b' },
    ];

    const quickActions = [
        { label: 'Add Member',   path: '/admin/members/create', color: '#0d9488', icon: '👤' },
        { label: 'Appointments', path: '/admin/appointments',   color: '#be123c', icon: '📋' },
        { label: 'Requisitions', path: '/admin/requisitions',   color: '#f59e0b', icon: '📝' },
        { label: 'Small Groups', path: '/admin/small-groups',   color: '#10b981', icon: '🤝' },
        { label: 'Events',       path: '/admin/content',        color: '#2dd4bf', icon: '📌' },
        { label: 'Departments',  path: '/admin/units',          color: '#6366f1', icon: '🏛️' },
    ];

    return (
        <>
            {navigating && <NavOverlay />}
            <div className={styles.page} style={THEME}>
                <header className={styles.hero}>
                    <div>
                        <span className={styles.badge}>Church Administrator</span>
                        <h1 className={styles.heroTitle}>Welcome, {userName}</h1>
                        <p className={styles.heroSub}>Oversee pastoral appointments, members, departments, and resources.</p>
                    </div>
                    <div className={styles.heroPill}>
                        <span className={styles.heroBig}>{stats.members}</span>
                        <span className={styles.heroSmall}>Church members</span>
                        {stats.pendingAppts > 0 && (
                            <span className={styles.urgentPill}>{stats.pendingAppts} appts pending</span>
                        )}
                    </div>
                </header>

                <div className={styles.grid3col}>
                    <main className={`${styles.col2} ${styles.mainStack}`}>
                        <section className={styles.statGrid}>
                            {topStats.map((s) => <StatCard key={s.label} {...s} />)}
                        </section>

                        <section className={styles.chartsRow}>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Appointment Status</h3>
                                <p className={styles.chartSub}>{stats.appointments} total pastoral requests</p>
                                <DonutChart
                                    segments={apptSegments.length ? apptSegments : [{ label: 'None yet', value: 1, color: '#e2e8f0' }]}
                                    centerValue={stats.appointments}
                                    centerLabel="Total"
                                />
                            </div>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Requisition Status</h3>
                                <p className={styles.chartSub}>{stats.pendingReqs} pending review</p>
                                <DonutChart
                                    segments={reqSegments.length ? reqSegments : [{ label: 'None yet', value: 1, color: '#e2e8f0' }]}
                                    centerValue={stats.requisitions}
                                    centerLabel="Total"
                                />
                            </div>
                        </section>

                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Ministry Numbers</h3>
                            <p className={styles.chartSub}>Key ministry metrics side by side</p>
                            <BarChart bars={ministryBars} height={190} />
                        </div>

                        <section className={styles.bottomPair}>
                            <div className={styles.sideCard}>
                                <h4 className={styles.sideCardTitle}>Quick Actions</h4>
                                <div className={styles.actionRowWrap}>
                                    {quickActions.map((a) => (
                                        <ActionButtonRow
                                            key={a.path}
                                            {...a}
                                            isNavigating={navigating === a.path}
                                            anyNavigating={!!navigating}
                                            onClick={() => navigate(a.path)}
                                        />
                                    ))}
                                </div>
                            </div>
                            {stats.pendingAppts > 0 && (
                                <div className={styles.sideCard} style={{ borderLeft: '3px solid #f59e0b' }}>
                                    <h4 className={styles.sideCardTitle}>Pending Actions</h4>
                                    <ul className={styles.snapshotList}>
                                        <SnapItem label="Appointments to confirm" value={apptStatus.pending}   color="#f59e0b" />
                                        <SnapItem label="Requisitions to review"  value={reqStatus.pending}    color="#ef4444" />
                                        <SnapItem label="Confirmed appointments"  value={apptStatus.confirmed} color="#10b981" />
                                    </ul>
                                </div>
                            )}
                        </section>
                    </main>

                    <aside className={styles.col1Sticky}>
                        <BirthdayWidget />
                    </aside>
                </div>
            </div>
        </>
    );
}

function StatCard({ label, value, color, note, icon, urgent }) {
    return (
        <article
            className={`${styles.statCard} ${urgent ? styles.statUrgent : ''}`}
            style={{ '--accent': color }}
        >
            <div className={styles.statTop}>
                <span className={styles.statIcon}>{icon}</span>
                {urgent && <span className={styles.urgentBadge}>Action needed</span>}
            </div>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
            <span className={styles.statNote}>{note}</span>
        </article>
    );
}

function ActionButton({ label, color, icon, onClick, isNavigating, anyNavigating }) {
    return (
        <button
            className={`${styles.actionBtn} ${isNavigating ? styles.navigating : ''}`}
            style={{ '--ac': color }}
            onClick={onClick}
            disabled={anyNavigating}
        >
            {isNavigating ? (
                <>
                    <span className={styles.btnSpinner} />
                    <span className={styles.actionLabel}>{label}</span>
                </>
            ) : (
                <>
                    <span className={styles.actionIcon}>{icon}</span>
                    <span className={styles.actionLabel}>{label}</span>
                </>
            )}
        </button>
    );
}

function ActionButtonRow({ label, color, icon, onClick, isNavigating, anyNavigating }) {
    return (
        <button
            className={`${styles.actionBtn} ${styles.actionBtnRow} ${isNavigating ? styles.navigating : ''}`}
            style={{ '--ac': color }}
            onClick={onClick}
            disabled={anyNavigating}
        >
            {isNavigating ? (
                <>
                    <span className={styles.btnSpinner} />
                    <span className={styles.actionLabelRow}>{label}</span>
                </>
            ) : (
                <>
                    <span className={styles.actionIconRow}>{icon}</span>
                    <span className={styles.actionLabelRow}>{label}</span>
                </>
            )}
        </button>
    );
}

function SnapItem({ label, value, color }) {
    return (
        <li className={styles.snapItem}>
            <span className={styles.snapDot} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <span className={styles.snapLabel}>{label}</span>
            <span className={styles.snapValue}>{value}</span>
        </li>
    );
}

function NavOverlay() {
    return (
        <div className={styles.navOverlay}>
            <div className={styles.navOverlayRing} />
            <p className={styles.navOverlayText}>Loading…</p>
        </div>
    );
}

function DashSkeleton() {
    return (
        <div style={THEME}>
            <div className={styles.page}>
                <div className={styles.skeleton}>
                    <div className={styles.skeletonHero} />
                    <div className={styles.skeletonGrid}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={styles.skeletonCard} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
