'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/apiClient';
import AdminToast, { useToast } from '@/components/admin/AdminToast';
import styles from './reports.module.css';

const PERIODS = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'HalfYear', label: 'Half-year' },
    { value: 'Annual', label: 'Annual' },
];

function indexOptions(period) {
    if (period === 'Monthly') {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
        }));
    }
    if (period === 'Quarterly') return [1, 2, 3, 4].map((q) => ({ value: q, label: `Q${q}` }));
    if (period === 'HalfYear') return [{ value: 1, label: 'First half' }, { value: 2, label: 'Second half' }];
    return [];
}

function defaultIndexFor(period) {
    const today = new Date();
    if (period === 'Monthly') return today.getMonth() + 1;
    if (period === 'Quarterly') return Math.floor(today.getMonth() / 3) + 1;
    if (period === 'HalfYear') return today.getMonth() < 6 ? 1 : 2;
    return 1;
}

export default function ReportsPage() {
    const { toast, notify, clearToast } = useToast();
    const [period, setPeriod] = useState('Monthly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [index, setIndex] = useState(() => defaultIndexFor('Monthly'));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const years = useMemo(() => {
        const current = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => current - i);
    }, []);

    async function load() {
        setLoading(true);
        try {
            const data = await apiClient.getReportSummary(period, year, index);
            setReport(data);
        } catch (err) {
            notify('error', err.message || 'Failed to load the report. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, year, index]);

    const handlePeriodChange = (next) => {
        setPeriod(next);
        setIndex(defaultIndexFor(next));
    };

    const handleSyncNow = async () => {
        setSyncing(true);
        try {
            await apiClient.syncReportsNow();
            await load();
            notify('success', 'Report data refreshed.');
        } catch (err) {
            notify('error', err.message || 'Failed to refresh report data.');
        } finally {
            setSyncing(false);
        }
    };

    const options = indexOptions(period);
    const w = report?.workflow;
    const e = report?.events;
    const maxCategory = w ? Math.max(1, ...w.uploadedByCategory.map((c) => c.count)) : 1;
    const maxContributor = w ? Math.max(1, ...w.topContributors.map((c) => c.count)) : 1;

    return (
        <div className={styles.page}>
            <AdminToast toast={toast} onClose={clearToast} />

            <div className={styles.header}>
                <div>
                    <h1>Reports</h1>
                    <p>Activity across events, media and publishing — kept permanently for audit, even after items are cleaned up.</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.periodTabs}>
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            className={`${styles.periodTab} ${period === p.value ? styles.periodTabActive : ''}`}
                            onClick={() => handlePeriodChange(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {options.length > 0 && (
                    <select className={styles.select} value={index} onChange={(e2) => setIndex(Number(e2.target.value))}>
                        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                )}

                <select className={styles.select} value={year} onChange={(e2) => setYear(Number(e2.target.value))}>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>

                <button type="button" className={styles.btnGhost} onClick={handleSyncNow} disabled={syncing}>
                    {syncing ? 'Refreshing…' : 'Refresh now'}
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}><div className={styles.spinner} /><p>Loading report…</p></div>
            ) : !report ? (
                <div className={styles.empty}>No report data available.</div>
            ) : (
                <>
                    <p className={styles.staleness}>
                        {report.range.label}
                        {report.dataCurrentTo && ` — data current to ${new Date(report.dataCurrentTo).toLocaleString()}`}
                    </p>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.cardLabel}>Content uploaded</div>
                            <div className={styles.cardValue}>{w.uploaded}</div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardLabel}>Published to website</div>
                            <div className={styles.cardValue}>{w.publishedToWebsite}</div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardLabel}>Sent back for revision</div>
                            <div className={styles.cardValue}>{w.sentBackForRevision}</div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardLabel}>Avg. days: submit → publish</div>
                            <div className={styles.cardValue}>{w.averageDaysSubmitToPublish ?? '—'}</div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardLabel}>Events held</div>
                            <div className={styles.cardValue}>{e.held}</div>
                            <div className={styles.cardSub}>{e.published} published · {e.withHighlightVideo} with highlight video</div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardLabel}>Events cleaned up</div>
                            <div className={styles.cardValue}>{e.purged}</div>
                            <div className={styles.cardSub}>History kept permanently in this report</div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Uploads by category</h2>
                        {w.uploadedByCategory.length === 0 ? (
                            <div className={styles.empty}>No uploads in this period.</div>
                        ) : w.uploadedByCategory.map((c) => (
                            <div className={styles.barRow} key={c.name}>
                                <div className={styles.barLabel}>{c.name}</div>
                                <div className={styles.barTrack}>
                                    <div className={styles.barFill} style={{ width: `${(c.count / maxCategory) * 100}%` }} />
                                </div>
                                <div className={styles.barCount}>{c.count}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.section}>
                        <h2>Top contributors</h2>
                        {w.topContributors.length === 0 ? (
                            <div className={styles.empty}>No uploads in this period.</div>
                        ) : w.topContributors.map((c) => (
                            <div className={styles.barRow} key={c.name}>
                                <div className={styles.barLabel}>{c.name}</div>
                                <div className={styles.barTrack}>
                                    <div className={styles.barFill} style={{ width: `${(c.count / maxContributor) * 100}%` }} />
                                </div>
                                <div className={styles.barCount}>{c.count}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.section}>
                        <h2>Social platform posts</h2>
                        {report.socialPosts.length === 0 ? (
                            <div className={styles.empty}>No social posts in this period.</div>
                        ) : (
                            <table className={styles.platformTable}>
                                <thead>
                                    <tr><th>Platform</th><th>Posted</th><th>Failed</th></tr>
                                </thead>
                                <tbody>
                                    {report.socialPosts.map((p) => (
                                        <tr key={p.platform}>
                                            <td>{p.platform}</td>
                                            <td>{p.posted}</td>
                                            <td>{p.failed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
