'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
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

export default function MemberDashboard({ userName, userData }) {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [myContent, setMyContent] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
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
                            <div className={styles.sideCard}>
                                <h4 className={styles.sideCardTitle}>Quick Actions</h4>
                                <div className={styles.actionRowWrap}>
                                    <button
                                        className={`${styles.actionBtn} ${styles.actionBtnRow}`}
                                        style={{ '--ac': '#0d9488' }}
                                        onClick={() => router.push('/admin/media/create')}
                                    >
                                        <span className={styles.actionIconRow}>⬆️</span>
                                        <span className={styles.actionLabelRow}>Upload Content</span>
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.actionBtnRow}`}
                                        style={{ '--ac': '#3b82f6' }}
                                        onClick={() => router.push('/admin/media')}
                                    >
                                        <span className={styles.actionIconRow}>🎬</span>
                                        <span className={styles.actionLabelRow}>My Content</span>
                                    </button>
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
    );
}
