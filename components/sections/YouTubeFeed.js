'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function YouTubeFeed() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetch('/api/youtube-feed')
            .then((r) => r.json())
            .then((d) => setVideos(Array.isArray(d.videos) ? d.videos : []))
            .catch(() => setVideos([]));
    }, []);

    if (videos.length === 0) return null;

    return (
        <section className="py-16" aria-labelledby="youtube-feed-heading">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <h2 id="youtube-feed-heading" className="text-3xl md:text-4xl font-bold">
                        Latest on YouTube
                    </h2>
                    <a
                        href={`https://www.youtube.com/watch?v=${videos[0].videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                    >
                        View Channel
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <a
                            key={video.videoId}
                            href={`https://www.youtube.com/watch?v=${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-2xl overflow-hidden shadow-lg bg-white"
                        >
                            <div className="relative aspect-video bg-gray-100">
                                {video.thumbnail && (
                                    <Image
                                        src={video.thumbnail}
                                        alt={video.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white text-xl">▶</span>
                                </div>
                            </div>
                            <p className="p-4 font-semibold text-sm leading-snug line-clamp-2">{video.title}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
