'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import BirthdayWidget from '@/components/admin/widgets/BirthdayWidget';
import DonutChart from '@/components/admin/charts/DonutChart';
import BarChart from '@/components/admin/charts/BarChart';
import styles from './dashboard.module.css';

// ── Rose / violet creative theme ────────────────────────────────────────────
const THEME = {
    '--brand':      '#db2777',
    '--brand-l':    '#f472b6',
    '--brand-dark': '#9d174d',
    '--glow-1':     'rgba(219,39,119,0.55)',
    '--glow-2':     'rgba(124,58,237,0.38)',
    '--hero-a':     '#1c0717',
    '--hero-b':     '#2d0d26',
};

export default function ChurchMediaDashboard({ userName }) {
    const router = useRouter();
    const [data, setData]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [navigating, setNavigating] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const [
                mediaRes, approvalsRes, scheduledRes,
                sermonsRes, albumsRes, imagesRes, seriesRes,
                myAssignmentsRes,
            ] = await Promise.allSettled([
                apiClient.getMediaContents(),
                apiClient.getAdminApprovalQueue(),
                apiClient.getAllScheduledPosts(),
                apiClient.getSermons(),
                apiClient.getAlbums(),
                apiClient.getImages(),
                apiClient.getSeries(),
                apiClient.getMyPersonnelAssignments(),
            ]);

            const v = (r) => (r.status === 'fulfilled' ? r.value || [] : []);
            const mediaArr = v(mediaRes);

            // WorkflowStatus: 0=Draft, 1=Submitted, 2-6=Review, 7=Ready, 8-9=Sched/Publishing, 10=Published, 12=Rejected
            const pipeline = {
                draft:     mediaArr.filter(m => m.workflowStatus === 0).length,
                submitted: mediaArr.filter(m => m.workflowStatus === 1).length,
                inReview:  mediaArr.filter(m => m.workflowStatus >= 2 && m.workflowStatus <= 6).length,
                ready:     mediaArr.filter(m => m.workflowStatus === 7).length,
                scheduled: mediaArr.filter(m => m.workflowStatus === 8 || m.workflowStatus === 9).length,
                published: mediaArr.filter(m => m.workflowStatus === 10).length,
                rejected:  mediaArr.filter(m => m.workflowStatus === 12).length,
            };

            const byType = {
                images: mediaArr.filter(m => (m.contentType ?? 0) === 0).length,
                videos: mediaArr.filter(m => (m.contentType ?? 0) === 1).length,
            };

            const assignments = v(myAssignmentsRes);
            const myRoles = {
                media:       assignments.filter(a => a.role === 1).length,
                graphics:    assignments.filter(a => a.role === 2).length,
                socialMedia: assignments.filter(a => a.role === 3).length,
            };

            setData({
                stats: {
                    totalMedia:       mediaArr.length,
                    draft:            pipeline.draft,
                    inReview:         pipeline.inReview + pipeline.submitted,
                    readyOrScheduled: pipeline.ready + pipeline.scheduled,
                    published:        pipeline.published,
                    pendingApprovals: v(approvalsRes).length,
                    scheduledPosts:   v(scheduledRes).length,
                    sermons:          v(sermonsRes).length,
                    albums:           v(albumsRes).length,
                    images:           v(imagesRes).length,
                    series:           v(seriesRes).length,
                    myAssignments:    assignments.length,
                },
                pipeline,
                byType,
                myRoles,
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
    const { stats, pipeline, byType, myRoles } = data;

    const topStats = [
        { label: 'Total Uploads',     value: stats.totalMedia,        color: '#db2777', note: 'All media content',   icon: '🎬' },
        { label: 'Pending Approvals', value: stats.pendingApprovals,  color: '#ef4444', note: 'Needs review',        icon: '⚡', urgent: stats.pendingApprovals > 0 },
        { label: 'Published',         value: stats.published,         color: '#10b981', note: 'Live on platforms',   icon: '✅' },
        { label: 'Scheduled',         value: stats.scheduledPosts,    color: '#3b82f6', note: 'Queued to publish',   icon: '📅' },
        { label: 'Draft',             value: stats.draft,             color: '#94a3b8', note: 'Work in progress',    icon: '✏️' },
        { label: 'In Review',         value: stats.inReview,          color: '#f59e0b', note: 'Under review',        icon: '🔍' },
        { label: 'My Assignments',    value: stats.myAssignments,     color: '#7c3aed', note: 'Assigned to you',     icon: '🙋' },
        { label: 'Sermons',           value: stats.sermons,           color: '#f472b6', note: 'Messages uploaded',   icon: '🎙️' },
    ];

    const pipelineSegments = [
        { label: 'Draft',     value: pipeline.draft,     color: '#94a3b8' },
        { label: 'Submitted', value: pipeline.submitted, color: '#6366f1' },
        { label: 'In Review', value: pipeline.inReview,  color: '#f59e0b' },
        { label: 'Ready',     value: pipeline.ready,     color: '#0ea5e9' },
        { label: 'Scheduled', value: pipeline.scheduled, color: '#3b82f6' },
        { label: 'Published', value: pipeline.published, color: '#10b981' },
        { label: 'Rejected',  value: pipeline.rejected,  color: '#ef4444' },
    ].filter(s => s.value > 0);

    const contentBars = [
        { label: 'Sermons', value: stats.sermons, color: '#f472b6' },
        { label: 'Albums',  value: stats.albums,  color: '#be123c' },
        { label: 'Images',  value: stats.images,  color: '#0f766e' },
        { label: 'Series',  value: stats.series,  color: '#7c3aed' },
        { label: 'Videos',  value: byType.videos, color: '#db2777' },
        { label: 'Photos',  value: byType.images, color: '#2563eb' },
    ];

    const myRoleBars = [
        { label: 'Media',    value: myRoles.media,       color: '#db2777' },
        { label: 'Graphics', value: myRoles.graphics,    color: '#7c3aed' },
        { label: 'Social',   value: myRoles.socialMedia, color: '#3b82f6' },
    ];

    const quickActions = [
        { label: 'Upload Media', path: '/admin/media/create', color: '#db2777', icon: '⬆️' },
        { label: 'My Content',   path: '/admin/media',        color: '#7c3aed', icon: '🎬' },
        { label: 'Workflow',     path: '/admin/workflow',     color: '#0369a1', icon: '🔄' },
        { label: 'Approvals',    path: '/admin/approvals',    color: '#ef4444', icon: '✅' },
        { label: 'Publishing',   path: '/admin/publishing',   color: '#3b82f6', icon: '📤' },
        { label: 'Sermons',      path: '/admin/content',      color: '#f472b6', icon: '🎙️' },
    ];

    return (
        <>
            {navigating && <NavOverlay />}
            <div className={styles.page} style={THEME}>
                <header className={styles.hero}>
                    <div>
                        <span className={styles.badge}>Media Team</span>
                        <h1 className={styles.heroTitle}>Welcome, {userName}</h1>
                        <p className={styles.heroSub}>Manage uploads, track the content pipeline, and push to platforms.</p>
                    </div>
                    <div className={styles.heroPill}>
                        <span className={styles.heroBig}>{stats.totalMedia}</span>
                        <span className={styles.heroSmall}>Total uploads</span>
                        <span className={styles.heroSmall} style={{ color: '#fbcfe8', marginTop: '0.25rem' }}>
                            {stats.published} published · {stats.draft} draft
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
                                <p className={styles.chartSub}>Status breakdown of all {stats.totalMedia} uploads</p>
                                <DonutChart
                                    segments={pipelineSegments.length ? pipelineSegments : [{ label: 'No uploads', value: 1, color: '#e2e8f0' }]}
                                    centerValue={stats.totalMedia}
                                    centerLabel="Uploads"
                                />
                            </div>
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>Content Library</h3>
                                <p className={styles.chartSub}>Breakdown by content type</p>
                                <BarChart bars={contentBars} height={190} />
                            </div>
                        </section>

                        {stats.myAssignments > 0 && (
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>My Personnel Assignments</h3>
                                <p className={styles.chartSub}>Your role breakdown across {stats.myAssignments} assigned content items</p>
                                <BarChart bars={myRoleBars} height={140} />
                            </div>
                        )}
                    </main>

                    <aside className={styles.col1Sticky}>
                        <BirthdayWidget />
                        <div className={styles.sideCard}>
                            <h4 className={styles.sideCardTitle}>Quick Actions</h4>
                            <div className={styles.sideActionGrid}>
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
                        </div>
                        <div className={styles.sideCard}>
                            <h4 className={styles.sideCardTitle}>Pipeline Summary</h4>
                            <ul className={styles.snapshotList}>
                                <SnapItem label="Draft"     value={pipeline.draft}     color="#94a3b8" />
                                <SnapItem label="Submitted" value={pipeline.submitted} color="#6366f1" />
                                <SnapItem label="In Review" value={pipeline.inReview}  color="#f59e0b" />
                                <SnapItem label="Ready"     value={pipeline.ready}     color="#0ea5e9" />
                                <SnapItem label="Scheduled" value={pipeline.scheduled} color="#3b82f6" />
                                <SnapItem label="Published" value={pipeline.published} color="#10b981" />
                                <SnapItem label="Rejected"  value={pipeline.rejected}  color="#ef4444" />
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
