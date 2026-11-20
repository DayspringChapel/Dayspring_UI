'use client';

import Image from '@/components/PublicImage';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import SermonPlayer from '@/components/SermonPlayer';
import { extractYouTubeId } from '@/lib/youtube';
import { newestSermonsFirst, sermonDateLabel } from '@/lib/sermons';

export default function SermonSection({ limit = null }) {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const fetchSermons = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getSermons();
            const ordered = newestSermonsFirst(Array.isArray(data) ? data : []);
            setSermons(limit ? ordered.slice(0, limit) : ordered);
        } catch {
            setError('We could not load the sermons. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [limit]);
    useEffect(() => { Promise.resolve().then(fetchSermons); }, [fetchSermons]);

    return (
        <section id="sermons" aria-labelledby="sermons-heading" className="bg-white py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 md:mb-10">
                    <div>
                        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">The word for your week</p>
                        <h2 id="sermons-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{limit ? 'Latest sermons' : 'Sermons'}</h2>
                        <p className="text-gray-700 max-w-xl leading-relaxed">Listen, reflect and grow with messages from our services. Newest messages first.</p>
                    </div>
                    {limit && <Link href="/library" className="inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:border-primary hover:text-primary transition-colors shrink-0 self-start sm:self-auto">See more <span aria-hidden="true">→</span></Link>}
                </div>
                {loading ? (
                    <div aria-label="Loading sermons" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: limit || 6 }, (_, i) => <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"><div className="aspect-video bg-gray-100" /><div className="p-6 space-y-4"><div className="h-4 w-1/3 bg-gray-200 rounded" /><div className="h-6 bg-gray-200 rounded" /><div className="h-4 w-2/3 bg-gray-100 rounded" /></div></div>)}
                    </div>
                ) : error ? (
                    <div role="alert" className="rounded-xl border border-gray-200 p-8 text-center"><p className="text-gray-700 mb-4">{error}</p><button onClick={fetchSermons} className="rounded-lg bg-primary px-5 py-3 text-white font-semibold">Try again</button></div>
                ) : !sermons.length ? (
                    <p className="rounded-xl border border-gray-200 p-10 text-center text-gray-700">New messages will appear here soon.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {sermons.map(sermon => {
                            const id = sermon.id || sermon.sermonId;
                            const expanded = expandedId === id;
                            const video = Number(sermon.sermonType) === 2;
                            const youtubeId = video ? extractYouTubeId(sermon.youtubeUrl) : null;
                            const playable = video ? Boolean(youtubeId) : Boolean(sermon.audioLink);
                            return (
                                <article key={id} data-sermon-id={id} className="min-w-0 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                        <Image src={sermon.imageUrl || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '/headset.png')} alt={sermon.title} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className={sermon.imageUrl || youtubeId ? 'object-cover' : 'object-contain p-8'} />
                                        <span className="absolute top-3 left-3 rounded-md bg-white px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">{video ? 'Video message' : 'Audio message'}</span>
                                    </div>
                                    <div className="p-5 md:p-6">
                                        <time dateTime={sermon.sermonDate || undefined} className="block text-sm text-gray-600 mb-3">{sermonDateLabel(sermon.sermonDate)}</time>
                                        <h3 className="text-xl font-bold text-gray-900 leading-snug break-words mb-2">{sermon.title}</h3>
                                        <p className="text-sm text-gray-700 break-words">{sermon.preacherName || 'Dayspring Chapel'}</p>
                                        {sermon.seriesTitle && <p className="text-sm text-gray-600 mt-1 break-words">Series: {sermon.seriesTitle}</p>}
                                        {playable ? <button type="button" aria-expanded={expanded} aria-controls={`sermon-player-${id}`} onClick={() => setExpandedId(expanded ? null : id)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"><span aria-hidden="true">{expanded ? '−' : '▶'}</span>{expanded ? 'Close player' : video ? 'Watch message' : 'Listen to message'}<span className="sr-only">: {sermon.title}</span></button> : <p className="mt-5 text-sm text-gray-600">Recording coming soon</p>}
                                    </div>
                                    {expanded && <div id={`sermon-player-${id}`} className="border-t border-gray-200">
                                        {youtubeId ? <div className="aspect-video"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`} title={sermon.title} className="w-full h-full" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <SermonPlayer audioUrl={sermon.audioLink} title={sermon.title} />}
                                    </div>}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
