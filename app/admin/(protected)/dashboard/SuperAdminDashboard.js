'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import BirthdayWidget from '@/components/admin/widgets/BirthdayWidget';
import QuickGuideWidget from '@/components/admin/widgets/QuickGuideWidget';
import DashboardTour from '@/components/admin/DashboardTour';
import DonutChart from '@/components/admin/charts/DonutChart';
import BarChart from '@/components/admin/charts/BarChart';
import { REPORTS_TILE, ROLES_PERMISSIONS_TILE, PERMISSION_GROUPS, canSeeItem, visibleItems, withPermissionTiles } from '@/lib/permissionTiles';
import { tourStepsFor } from '@/lib/tourSteps';
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
    const [permissions, setPermissions] = useState(() => apiClient.getCurrentPermissions());
    const [tourSignal, setTourSignal] = useState(0);

    useEffect(() => {
        apiClient.refreshCurrentUserPermissions()
            .then(() => setPermissions(apiClient.getCurrentPermissions()))
            .catch(() => {});
    }, []);

    async function load() {
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
                apiClient.getSuperAdminApprovalQueue(),
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

    useEffect(() => { load(); }, []);

    const navigate = useCallback((path) => {
        setNavigating(path);
        router.push(path);
    }, [router]);

    if (loading) return <DashSkeleton />;
    const { stats, pipeline } = data;

    const hasPermission = (p) => permissions.includes(p);

    const topStats = visibleItems([
        { label: 'Total Members',      value: stats.members,          color: '#7c3aed', note: 'Church members',     icon: '👥', anyPermission: PERMISSION_GROUPS.members },
        { label: 'Pending Approvals',  value: stats.pendingApprovals, color: '#ef4444', note: 'Needs your action',  icon: '⚡', urgent: true, anyPermission: PERMISSION_GROUPS.approve },
        { label: 'Scheduled Posts',    value: stats.scheduledPosts,   color: '#3b82f6', note: 'Publishing queue',   icon: '📅', anyPermission: PERMISSION_GROUPS.publish },
        { label: 'Media Content',      value: stats.media,            color: '#a78bfa', note: 'Total uploads',      icon: '🎬', anyPermission: PERMISSION_GROUPS.media },
        { label: 'Events',             value: stats.events,           color: '#0f766e', note: 'Active events',      icon: '📌', permission: 'CanManageEvent' },
        { label: 'Sermons',            value: stats.sermons,          color: '#f59e0b', note: 'Messages available', icon: '🎙️', permission: 'CanManageSermon' },
        { label: 'Appointments',       value: stats.appointments,     color: '#be123c', note: 'Pastoral requests',  icon: '📋', permission: 'CanManageAppointment' },
        { label: 'Small Groups',       value: stats.smallGroups,      color: '#10b981', note: 'Care groups',        icon: '🤝', permission: 'CanManageSmallGroup' },
    ], hasPermission);

    const pipelineSegments = [
        { label: 'Draft',     value: pipeline.draft,     color: PIPELINE_COLORS.draft },
        { label: 'In Review', value: pipeline.inReview,  color: PIPELINE_COLORS.inReview },
        { label: 'Approved',  value: pipeline.approved,  color: PIPELINE_COLORS.approved },
        { label: 'Scheduled', value: pipeline.scheduled, color: PIPELINE_COLORS.scheduled },
        { label: 'Published', value: pipeline.published, color: PIPELINE_COLORS.published },
        { label: 'Rejected',  value: pipeline.rejected,  color: PIPELINE_COLORS.rejected },
    ].filter(s => s.value > 0);

    const ministryBars = visibleItems([
        { label: 'Members',  value: stats.members,     color: '#7c3aed', anyPermission: PERMISSION_GROUPS.members },
        { label: 'Units',    value: stats.units,       color: '#a78bfa', permission: 'CanManageDepartments' },
        { label: 'Groups',   value: stats.smallGroups, color: '#10b981', permission: 'CanManageSmallGroup' },
        { label: 'Events',   value: stats.events,      color: '#0f766e', permission: 'CanManageEvent' },
        { label: 'Sermons',  value: stats.sermons,     color: '#f59e0b', permission: 'CanManageSermon' },
        { label: 'Books',    value: stats.books,       color: '#3b82f6', permission: 'CanManageBooks' },
        { label: 'Albums',   value: stats.albums,      color: '#be123c', permission: 'CanManageAlbum' },
    ], hasPermission);

    const contentLibraryBars = visibleItems([
        { label: 'Media',   value: stats.media,   color: '#a78bfa', anyPermission: PERMISSION_GROUPS.media },
        { label: 'Sermons', value: stats.sermons,  color: '#f59e0b', permission: 'CanManageSermon' },
        { label: 'Albums',  value: stats.albums,   color: '#be123c', permission: 'CanManageAlbum' },
        { label: 'Books',   value: stats.books,    color: '#3b82f6', permission: 'CanManageBooks' },
    ], hasPermission);

    const quickActions = withPermissionTiles([
        { label: 'Manage Members',  path: '/admin/members', color: '#7c3aed', icon: '👤', anyPermission: PERMISSION_GROUPS.members },
        { label: 'Approve Content', path: '/admin/approvals',      color: '#ef4444', icon: '✅', anyPermission: PERMISSION_GROUPS.approve },
        { label: 'Publishing',      path: '/admin/publishing',     color: '#3b82f6', icon: '📤', anyPermission: PERMISSION_GROUPS.publish },
        { label: 'Media Library',   path: '/admin/media',          color: '#a78bfa', icon: '🎬', anyPermission: PERMISSION_GROUPS.media },
        { label: 'Workflow',        path: '/admin/workflow',       color: '#0369a1', icon: '🔄', anyPermission: PERMISSION_GROUPS.workflow },
        { label: 'Requisitions',    path: '/admin/requisitions',   color: '#f59e0b', icon: '📝', permission: 'CanManageRequisition' },
        { label: 'Appointments',    path: '/admin/appointments',   color: '#be123c', icon: '📋', permission: 'CanManageAppointment' },
        { label: 'Content',         path: '/admin/content',        color: '#10b981', icon: '📚', anyPermission: PERMISSION_GROUPS.websiteContent },
    ], hasPermission, [REPORTS_TILE, ROLES_PERMISSIONS_TILE]);

    return (
        <>
            {navigating && <NavOverlay />}
            <div className={styles.page} style={THEME}>
                <header className={styles.hero} data-tour="hero">
                    <div>
                        <span className={styles.badge}>Overseer</span>
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
                            {canSeeItem({ anyPermission: PERMISSION_GROUPS.media }, hasPermission) && (
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Content Pipeline</h3>
                                <p className={styles.chartSub}>Workflow status of all {stats.media} uploads</p>
                                <DonutChart
                                    segments={pipelineSegments.length ? pipelineSegments : [{ label: 'No data', value: 1, color: '#e2e8f0' }]}
                                    centerValue={stats.media}
                                    centerLabel="Total"
                                />
                            </div>
                            )}
                            {ministryBars.length > 0 && (
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Ministry Overview</h3>
                                <p className={styles.chartSub}>Key ministry numbers at a glance</p>
                                <BarChart bars={ministryBars} height={190} />
                            </div>
                            )}
                        </section>

                        {contentLibraryBars.length > 0 && (
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Content Library</h3>
                            <p className={styles.chartSub}>Media, sermons, albums, and books across the system</p>
                            <BarChart bars={contentLibraryBars} height={160} />
                        </div>
                        )}

                        <div className={styles.sideCard} data-tour="quick-actions">
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
                    </main>

                    <aside className={styles.col1Sticky}>
                        <BirthdayWidget />
                        <QuickGuideWidget onStartTour={() => setTourSignal((n) => n + 1)} />
                    </aside>
                </div>
            </div>
            <DashboardTour steps={tourStepsFor('superAdmin')} storageKey="superAdmin" restartSignal={tourSignal} />
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
