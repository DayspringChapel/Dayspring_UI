'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { normalizeLivestreamSettings } from '@/lib/livestreamSettings';

export default function VideoHero() {
    const [isLive, setIsLive]       = useState(false);
    const [hero, setHero] = useState({ mode: 0, items: [], rotationSeconds: 8, shuffle: false });
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroFailed, setHeroFailed] = useState(false);

    const fetchStreams = useCallback(async () => {
        try {
            const res = await fetch('/api/livestream', { cache: 'no-store' });
            if (!res.ok) return;
            const data = normalizeLivestreamSettings(await res.json());
            setIsLive(!data.hideWatchOnline && Object.entries(data).some(([key, p]) => (
                ['youtube', 'facebook', 'instagram'].includes(key) && p.active && p.url
            )));
        } catch {
            // network error — keep previous state
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(fetchStreams);
        const id = setInterval(fetchStreams, 60_000);
        const refreshWhenVisible = () => {
            if (document.visibilityState !== 'hidden') fetchStreams();
        };
        window.addEventListener('focus', refreshWhenVisible);
        window.addEventListener('online', refreshWhenVisible);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        return () => {
            clearInterval(id);
            window.removeEventListener('focus', refreshWhenVisible);
            window.removeEventListener('online', refreshWhenVisible);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [fetchStreams]);

    useEffect(() => {
        apiClient.getHeroSettings()
            .then((data) => {
                const items = data.shuffle && Array.isArray(data.items)
                    ? [...data.items].sort(() => Math.random() - 0.5)
                    : (data.items || []);
                setHero({ ...data, items });
                setHeroFailed(false);
                setHeroIndex(0);
            })
            .catch(() => setHeroFailed(true));
    }, []);

    useEffect(() => {
        if (hero.mode !== 2 || hero.items.length < 2 || heroFailed) return undefined;
        const timer = setInterval(() => setHeroIndex((index) => (index + 1) % hero.items.length), (hero.rotationSeconds || 8) * 1000);
        return () => clearInterval(timer);
    }, [hero, heroFailed]);

    const useDefaultHero = heroFailed || hero.mode === 0 || !hero.items?.length;

    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                {useDefaultHero ? (
                    <>
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover hidden md:block">
                            <source src="/home-hero-vid.mp4" type="video/mp4" />
                        </video>
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover md:hidden">
                            <source src="/home-hero-vid-portrait.mp4" type="video/mp4" />
                        </video>
                    </>
                ) : hero.mode === 1 ? (
                    <video
                        key={hero.items[0].url}
                        src={hero.items[0].url}
                        autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => setHeroFailed(true)}
                    />
                ) : (
                    <Image
                        key={hero.items[heroIndex]?.url}
                        src={hero.items[heroIndex]?.url}
                        alt=""
                        fill
                        priority={heroIndex === 0}
                        className="object-cover"
                        onError={() => setHeroFailed(true)}
                    />
                )}

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4 z-10">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wide">
                        DISCOVER PURPOSE
                    </h1>
                    <p className="text-lg md:text-xl mb-10 max-w-3xl font-medium">
                        Welcome to DaySpring Chapel, a place where purpose is discovered,
                        potentials are built, and dreams are fulfilled
                    </p>
                    <div className="flex flex-col md:flex-row gap-6">
                        {isLive ? (
                            <Link
                                href="/live"
                                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-colors uppercase text-sm tracking-wider shadow-lg shadow-red-600/40 animate-pulse"
                            >
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                LIVE NOW — WATCH
                            </Link>
                        ) : null}
                        <Link
                            href="/library"
                            className={`${isLive ? 'bg-transparent border-2 border-white hover:bg-white hover:text-black' : 'bg-[#F58634] hover:bg-[#d9752c]'} text-white font-bold px-8 py-4 rounded-full transition-all uppercase text-sm tracking-wider`}
                        >
                            Explore Sermons
                        </Link>
                    </div>
                </div>
            </div>


        </>
    );
}
