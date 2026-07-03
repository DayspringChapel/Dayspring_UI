'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import BirthdayWidget from '@/components/admin/widgets/BirthdayWidget';
import QuickGuideWidget from '@/components/admin/widgets/QuickGuideWidget';
import DonutChart from '@/components/admin/charts/DonutChart';
import styles from './dashboard.module.css';

const THEME = {
    '--brand':      '#0d9488',
    '--brand-l':    '#2dd4bf',
    '--brand-dark': '#115e59',
    '--glow-1':     'rgba(13,148,136,0.5)',
    '--glow-2':     'rgba(59,130,246,0.32)',
    '--hero-a':     '#052e2b',
    '--hero-b':     '#0b2440',
};

const CONTENT_ROLE_LABELS = { 1: 'Media', 2: 'Graphics', 3: 'Social Media' };

// Content role: 1 = Media, 2 = Graphics, 3 = SocialMedia
const QUICK_ACTIONS_BY_ROLE = {
    1: [
        { label: 'Upload Media', path: '/admin/media/create', color: '#0d9488', icon: '⬆️' },
        { label: 'My Content',   path: '/admin/media',        color: '#3b82f6', icon: '🎬' },
    ],
    2: [
        { label: 'Upload Media', path: '/admin/media/create', color: '#0d9488', icon: '🎨' },
        { label: 'My Content',   path: '/admin/media',        color: '#3b82f6', icon: '🖼️' },
    ],
    3: [
        { label: 'Publishing Queue', path: '/admin/publishing', color: '#3b82f6', icon: '📤' },
        { label: 'My Content',       path: '/admin/media',      color: '#0d9488', icon: '🎬' },
    ],
};

export default function MemberDashboard({ userName, userData }) {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [myContent, setMyContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const userId = userData?.id || userData?.Id;
            if (!userId) return;
            const memberRes = await apiClient.getMemberByUserId(userId).catch(() => null);
            setMember(memberRes);

            if (memberRes?.contentRole) {
                const contentRes = await apiClient.getMyMediaContents(userId).catch(() => []);
                setMyContent(Array.isArray(contentRes) ? contentRes : []);
            }
        } finally {
            setLoading(false);
        }
    };

    const navigate = useCallback((path) => {
        setNavigating(path);
        router.push(path);
    }, [router]);

    if (loading) {
        return (
            <div style={THEME}>
                <div className={styles.page}>
                    <div className={styles.fullLoading}><div className={styles.spinner} /></div>
                </div>
            </div>
        );
    }

    const hasContentRole = !!member?.contentRole;
    const roleLabel = CONTENT_ROLE_LABELS[member?.contentRole] || null;
    const quickActions = QUICK_ACTIONS_BY_ROLE[member?.contentRole] || [];

    const pipeline = {
        draft:     myContent.filter((m) => m.workflowStatus === 0).length,
        inReview:  myContent.filter((m) => m.workflowStatus >= 1 && m.workflowStatus <= 6).length,
        ready:     myContent.filter((m) => m.workflowStatus === 7 || m.workflowStatus === 8 || m.workflowStatus === 9).length,
        published: myContent.filter((m) => m.workflowStatus === 10).length,
        rejected:  myContent.filter((m) => m.workflowStatus === 12).length,
    };

    const topStats = [
        { label: 'My Uploads', value: myContent.length,   color: '#0d9488', note: 'Total submissions', icon: '🎬' },
        { label: 'Draft',      value: pipeline.draft,     color: '#94a3b8', note: 'Not yet submitted', icon: '✏️' },
        { label: 'In Review',  value: pipeline.inReview,  color: '#f59e0b', note: 'Awaiting decision',  icon: '🔍' },
        { label: 'Published',  value: pipeline.published, color: '#10b981', note: 'Live content',       icon: '✅' },
    ];

    const pipelineSegments = [
        { label: 'Draft',     value: pipeline.draft,     color: '#94a3b8' },
        { label: 'In Review',  value: pipeline.inReview, color: '#f59e0b' },
        { label: 'Ready',     value: pipeline.ready,     color: '#0ea5e9' },
        { label: 'Published', value: pipeline.published, color: '#10b981' },
        { label: 'Rejected',  value: pipeline.rejected,  color: '#ef4444' },
    ].filter((s) => s.value > 0);

    return (
        <>
            {navigating && <NavOverlay />}
            <div className={styles.page} style={THEME}>
                <header className={styles.hero}>
                    <div>
                        <span className={styles.badge}>{hasContentRole ? `${roleLabel} Contributor` : 'Member'}</span>
                        <h1 className={styles.heroTitle}>Welcome, {userName}</h1>
                        <p className={styles.heroSub}>
                            {hasContentRole
                                ? 'Upload graphics, video, or audio for the media team to vet.'
                                : "You don't have a content role yet. Once the media team grants you one, you'll be able to upload content here."}
                        </p>
                    </div>
                    {hasContentRole && (
                        <div className={styles.heroPill}>
                            <span className={styles.heroBig}>{myContent.length}</span>
                            <span className={styles.heroSmall}>My uploads</span>
                        </div>
                    )}
                </header>

                <div className={styles.grid3col}>
                    <main className={`${styles.col2} ${styles.mainStack}`}>
                        {hasContentRole ? (
                            <>
                                <section className={styles.statGrid}>
                                    {topStats.map((s) => <StatCard key={s.label} {...s} />)}
                                </section>

                                <div className={styles.chartCard}>
                                    <h3 className={styles.chartTitle}>My Content Pipeline</h3>
                                    <p className={styles.chartSub}>Status breakdown of your {myContent.length} uploads</p>
                                    <DonutChart
                                        segments={pipelineSegments.length ? pipelineSegments : [{ label: 'No uploads', value: 1, color: '#e2e8f0' }]}
                                        centerValue={myContent.length}
                                        centerLabel="Uploads"
                                    />
                                </div>

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

                                <div className={styles.chartCard}>
                                    <h3 className={styles.chartTitle}>Recent Uploads</h3>
                                    <p className={styles.chartSub}>Your latest submissions and their vetting status</p>
                                    {myContent.length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nothing uploaded yet.</p>
                                    ) : (
                                        <ul className={styles.snapshotList}>
                                            {myContent.slice(0, 8).map((item) => (
                                                <li key={item.id} className={styles.snapItem}>
                                                    <span className={styles.snapDot} style={{ background: '#0d9488' }} />
                                                    <span className={styles.snapLabel}>{item.title}</span>
                                                    <span className={styles.snapValue}>{item.workflowStatusName || '—'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.chartCard}>
                                <h3 className={styles.chartTitle}>No content role assigned</h3>
                                <p className={styles.chartSub}>
                                    Ask the media team to grant you a content role (Media, Graphics, or Social Media) to start
                                    uploading content for vetting.
                                </p>
                            </div>
                        )}
                    </main>

                    <aside className={styles.col1Sticky}>
                        <BirthdayWidget />
                        <QuickGuideWidget />
                        <div className={styles.sideCard}>
                            <h4 className={styles.sideCardTitle}>My Profile</h4>
                            <ul className={styles.snapshotList}>
                                <li className={styles.snapItem}>
                                    <span className={styles.snapLabel}>Unit</span>
                                    <span className={styles.snapValue}>{member?.unitId ? 'Assigned' : '—'}</span>
                                </li>
                                <li className={styles.snapItem}>
                                    <span className={styles.snapLabel}>Small Group</span>
                                    <span className={styles.snapValue}>{member?.smallGroupId ? 'Assigned' : '—'}</span>
                                </li>
                                <li className={styles.snapItem}>
                                    <span className={styles.snapLabel}>Content Role</span>
                                    <span className={styles.snapValue}>{roleLabel || 'None'}</span>
                                </li>
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
