'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import BirthdayWidget from '@/components/admin/widgets/BirthdayWidget';
import RoleAssignWidget from '@/components/admin/widgets/RoleAssignWidget';
import GroupLeaderSection from '@/components/admin/sections/GroupLeaderSection';
import DonutChart from '@/components/admin/charts/DonutChart';
import BarChart from '@/components/admin/charts/BarChart';
import styles from './dashboard.module.css';

// ── Purple / gold sovereign theme ───────────────────────────────────────────
const THEME = {
    '--brand':      '#7c3aed',
    '--brand-l':    '#a78bfa',
    '--brand-dark': '#5b21b6',
    '--glow-1':     'rgba(124,58,237,0.58)',
    '--glow-2':     'rgba(245,158,11,0.38)',
    '--hero-a':     '#1a0f2e',
    '--hero-b':     '#2d1b69',
};

const PIPELINE_COLORS = {
    draft:     '#94a3b8',
    inReview:  '#f59e0b',
    approved:  '#10b981',
    scheduled: '#3b82f6',
    published: '#7c3aed',
    rejected:  '#ef4444',
};

export default function SuperAdminDashboard({ userName }) {
    const router = useRouter();
    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [navigating, setNavigating] = useState(null); // path being loaded

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const [
                appointments, events, books, sermons,
                members, units, smallGroups,
                media, approvals, scheduled, albums,
            ] = await Promise.allSettled([
                apiClient.getAppointments(),
                apiClient.getEvents(),
                apiClient.getBooks(),
                apiClient.getSermons(),
                apiClient.getMembers(),
                apiClient.getUnits(),
                apiClient.getSmallGroups(),
                apiClient.getMediaContents(),
                apiClient.getAdminApprovalQueue(),
                apiClient.getAllScheduledPosts(),
                apiClient.getAlbums(),
            ]);

            const v = (r) => (r.status === 'fulfilled' ? r.value || [] : []);
            const mediaArr = v(media);

            const pipeline = {
                draft:     mediaArr.filter(m => m.workflowStatus === 0).length,
                inReview:  mediaArr.filter(m => m.workflowStatus >= 1 && m.workflowStatus <= 6).length,
                approved:  mediaArr.filter(m => m.workflowStatus === 7).length,
                scheduled: mediaArr.filter(m => m.workflowStatus === 8 || m.workflowStatus === 9).length,
                published: mediaArr.filter(m => m.workflowStatus === 10).length,
                rejected:  mediaArr.filter(m => m.workflowStatus === 12).length,
            };

            setData({
                stats: {
                    appointments: v(appointments).length,
                    events:       v(events).length,
                    books:        v(books).length,
                    sermons:      v(sermons).length,
                    members:      v(members).length,
                    units:        v(units).length,
                    smallGroups:  v(smallGroups).length,
                    media:        mediaArr.length,
                    pendingApprovals: v(approvals).length,
                    scheduledPosts:   v(scheduled).length,
                    albums:       v(albums).length,
                },
                pipeline,
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
    const { stats, pipeline } = data;

    const topStats = [
        { label: 'Total Members',      value: stats.members,          color: '#7c3aed', note: 'Church members',     icon: '👥' },
        { label: 'Pending Approvals',  value: stats.pendingApprovals, color: '#ef4444', note: 'Needs your action',  icon: '⚡', urgent: true },
        { label: 'Scheduled Posts',    value: stats.scheduledPosts,   color: '#3b82f6', note: 'Publishing queue',   icon: '📅' },
        { label: 'Media Content',      value: stats.media,            color: '#a78bfa', note: 'Total uploads',      icon: '🎬' },
        { label: 'Events',             value: stats.events,           color: '#0f766e', note: 'Active events',      icon: '📌' },
        { label: 'Sermons',            value: stats.sermons,          color: '#f59e0b', note: 'Messages available', icon: '🎙️' },
        { label: 'Appointments',       value: stats.appointments,     color: '#be123c', note: 'Pastoral requests',  icon: '📋' },
        { label: 'Small Groups',       value: stats.smallGroups,      color: '#10b981', note: 'Care groups',        icon: '🤝' },
    ];

    const pipelineSegments = [
        { label: 'Draft',     value: pipeline.draft,     color: PIPELINE_COLORS.draft },
        { label: 'In Review', value: pipeline.inReview,  color: PIPELINE_COLORS.inReview },
        { label: 'Approved',  value: pipeline.approved,  color: PIPELINE_COLORS.approved },
        { label: 'Scheduled', value: pipeline.scheduled, color: PIPELINE_COLORS.scheduled },
        { label: 'Published', value: pipeline.published, color: PIPELINE_COLORS.published },
        { label: 'Rejected',  value: pipeline.rejected,  color: PIPELINE_COLORS.rejected },
    ].filter(s => s.value > 0);

    const ministryBars = [
        { label: 'Members',  value: stats.members,     color: '#7c3aed' },
        { label: 'Units',    value: stats.units,       color: '#a78bfa' },
        { label: 'Groups',   value: stats.smallGroups, color: '#10b981' },
        { label: 'Events',   value: stats.events,      color: '#0f766e' },
        { label: 'Sermons',  value: stats.sermons,     color: '#f59e0b' },
        { label: 'Books',    value: stats.books,       color: '#3b82f6' },
        { label: 'Albums',   value: stats.albums,      color: '#be123c' },
    ];

    const quickActions = [
        { label: 'Add Member',      path: '/admin/members/create', color: '#7c3aed', icon: '👤' },
        { label: 'Approve Content', path: '/admin/approvals',      color: '#ef4444', icon: '✅' },
        { label: 'Publishing',      path: '/admin/publishing',     color: '#3b82f6', icon: '📤' },
        { label: 'Media Library',   path: '/admin/media',          color: '#a78bfa', icon: '🎬' },
        { label: 'Workflow',        path: '/admin/workflow',       color: '#0369a1', icon: '🔄' },
        { label: 'Requisitions',    path: '/admin/requisitions',   color: '#f59e0b', icon: '📝' },
        { label: 'Appointments',    path: '/admin/appointments',   color: '#be123c', icon: '📋' },
        { label: 'Content',         path: '/admin/content',        color: '#10b981', icon: '📚' },
    ];

    return (
        <>
            {navigating && <NavOverlay />}
            <div className={styles.page} style={THEME}>
                <header className={styles.hero}>
                    <div>
                        <span className={styles.badge}>Super Administrator</span>
                        <h1 className={styles.heroTitle}>Welcome, {userName}</h1>
                        <p className={styles.heroSub}>Full system oversight — every metric, every pipeline, every action.</p>
                    </div>
                    <div className={styles.heroPill}>
                        <span className={styles.heroBig}>{stats.media}</span>
                        <span className={styles.heroSmall}>Media uploads</span>
                        <span className={styles.heroSmall} style={{ color: '#c4b5fd', marginTop: '0.25rem' }}>
                            {pipeline.published} published
                        </span>
                    </div>
                </header>

                <div className={styles.grid3col}>
                    <main className={`${styles.col2} ${styles.mainStack}`}>
                        <section className={styles.statGrid}>
                            {topStats.map((s) => <StatCard key={s.label} {...s} />)}
                        </section>

                        <section className={styles.chartsRow}>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Content Pipeline</h3>
                                <p className={styles.chartSub}>Workflow status of all {stats.media} uploads</p>
                                <DonutChart
                                    segments={pipelineSegments.length ? pipelineSegments : [{ label: 'No data', value: 1, color: '#e2e8f0' }]}
                                    centerValue={stats.media}
                                    centerLabel="Total"
                                />
                            </div>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Ministry Overview</h3>
                                <p className={styles.chartSub}>Key ministry numbers at a glance</p>
                                <BarChart bars={ministryBars} height={190} />
                            </div>
                        </section>

                        <section className={styles.actionsCard}>
                            <h3 className={styles.chartTitle}>Quick Actions</h3>
                            <div className={styles.actionGrid}>
                                {quickActions.map((a) => (
                                    <ActionButton
                                        key={a.path}
                                        {...a}
                                        isNavigating={navigating === a.path}
                                        anyNavigating={!!navigating}
                                        onClick={() => navigate(a.path)}
                                    />
                                ))}
                            </div>
                        </section>

                        <div className={styles.chartCard}>
                            <GroupLeaderSection />
                        </div>
                    </main>

                    <aside className={styles.col1Sticky}>
                        <BirthdayWidget />
                        <RoleAssignWidget isSuperAdmin={true} />
                        <div className={styles.sideCard}>
                            <h4 className={styles.sideCardTitle}>System Snapshot</h4>
                            <ul className={styles.snapshotList}>
                                <SnapItem label="Departments"  value={stats.units}           color="#a78bfa" />
                                <SnapItem label="Books"        value={stats.books}           color="#3b82f6" />
                                <SnapItem label="Appointments" value={stats.appointments}    color="#be123c" />
                                <SnapItem label="Albums"       value={stats.albums}          color="#f59e0b" />
                                <SnapItem label="Rejected"     value={pipeline.rejected}     color="#ef4444" />
                            </ul>
                        </div>
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
        <div className={styles.skeleton} style={THEME}>
            <div className={styles.page}>
                <div className={styles.skeletonHero} />
                <div className={styles.skeletonGrid}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard} />
                    ))}
                </div>
            </div>
        </div>
    );
}
