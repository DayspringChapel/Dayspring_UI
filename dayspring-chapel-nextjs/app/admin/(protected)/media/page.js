'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import styles from './media.module.css';

const STATUS_BADGES = {
    0:  { label: 'Draft',            cls: 'bg-gray-100 text-gray-600' },
    1:  { label: 'Submitted',        cls: 'bg-blue-100 text-blue-700' },
    2:  { label: 'Media Review',     cls: 'bg-yellow-100 text-yellow-700' },
    3:  { label: 'Revision Req.',    cls: 'bg-orange-100 text-orange-700' },
    4:  { label: 'Resubmitted',      cls: 'bg-purple-100 text-purple-700' },
    5:  { label: 'Admin Approval',   cls: 'bg-indigo-100 text-indigo-700' },
    6:  { label: 'SuperAdmin',       cls: 'bg-pink-100 text-pink-700' },
    7:  { label: 'Ready',            cls: 'bg-teal-100 text-teal-700' },
    8:  { label: 'Scheduled',        cls: 'bg-cyan-100 text-cyan-700' },
    9:  { label: 'Publishing',       cls: 'bg-lime-100 text-lime-700' },
    10: { label: 'Published',        cls: 'bg-green-100 text-green-700' },
    11: { label: 'Archived',         cls: 'bg-slate-100 text-slate-600' },
    12: { label: 'Rejected',         cls: 'bg-red-100 text-red-700' },
};

const TYPE_ICONS = { Video: '▶', Audio: '♪' };

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: '0',  label: 'Draft' },
    { value: '1',  label: 'Submitted' },
    { value: '2',  label: 'Media Review' },
    { value: '5',  label: 'Admin Approval' },
    { value: '7',  label: 'Ready' },
    { value: '10', label: 'Published' },
    { value: '12', label: 'Rejected' },
];

export default function MediaPage() {
    const router = useRouter();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        apiClient.getMediaContents()
            .then((data) => setContents(data || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this media content? This cannot be undone.')) return;
        try {
            await apiClient.deleteMediaContent(id);
            setContents((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const filtered = filter === 'all'
        ? contents
        : contents.filter((c) => String(c.workflowStatus) === filter);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1>Media Content</h1>
                    <p>Manage all media uploads and their workflow status</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => router.push('/admin/media/create')}>
                    + Upload Media
                </button>
            </div>

            <div className={styles.filters}>
                {STATUS_FILTERS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`${styles.chip} ${filter === opt.value ? styles.chipActive : ''}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {loading && <div className={styles.loadingText}>Loading media content…</div>}
            {error   && <div className={styles.empty}>{error}</div>}
            {!loading && !error && filtered.length === 0 && (
                <div className={styles.empty}>No media content found. Upload your first file.</div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className={styles.grid}>
                    {filtered.map((item) => {
                        const badge = STATUS_BADGES[item.workflowStatus] || { label: item.workflowStatusName || '—', cls: 'bg-gray-100 text-gray-600' };
                        return (
                            <div key={item.id} className={styles.card}>
                                {item.thumbnailUrl ? (
                                    <img src={item.thumbnailUrl} alt={item.title} className={styles.cardThumb} />
                                ) : (
                                    <div className={styles.cardThumbPlaceholder}>
                                        {TYPE_ICONS[item.contentTypeName] || '📄'}
                                    </div>
                                )}
                                <div className={styles.cardBody}>
                                    <div className={styles.cardTitleRow}>
                                        <h3 className={styles.cardTitle}>{item.title}</h3>
                                        <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                    <p className={styles.cardMeta}>{item.contentTypeName} · {item.category}</p>
                                    <p className={styles.cardOwner}>By {item.ownerName}</p>
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.btnView}
                                            onClick={() => router.push(`/admin/media/detail?id=${item.id}`)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
