'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ── URL helpers ────────────────────────────────────────────────────────────────

function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    const m = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([^&?/\s]+)/
    );
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
    return null;
}

function getFacebookEmbedUrl(url) {
    if (!url) return null;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true&allowFullScreen=true&width=560`;
}

// ── Platform meta ──────────────────────────────────────────────────────────────

const PLATFORM_META = {
    youtube:   { label: 'YouTube',   color: '#FF0000', icon: '▶' },
    facebook:  { label: 'Facebook',  color: '#1877F2', icon: 'f'  },
    instagram: { label: 'Instagram', color: '#E1306C', icon: '📸' },
};

// ── Modal ──────────────────────────────────────────────────────────────────────

function LiveStreamModal({ streams, onClose }) {
    const activePlatforms = Object.entries(streams).filter(([, v]) => v.active && v.url);
    const [platform, setPlatform] = useState(
        activePlatforms.length === 1 ? activePlatforms[0][0] : null
    );

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const getEmbedUrl = () => {
        const url = streams[platform]?.url;
        if (platform === 'youtube')  return getYouTubeEmbedUrl(url);
        if (platform === 'facebook') return getFacebookEmbedUrl(url);
        return null;
    };

    const embedUrl = platform ? getEmbedUrl() : null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-4xl bg-[#0d0f1a] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                 style={{ maxHeight: '92vh' }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-bold text-base tracking-wide">We&apos;re LIVE!</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* ── Platform selector ── */}
                {activePlatforms.length > 1 && (
                    <div className="flex gap-2 px-5 py-3 border-b border-white/10 shrink-0 flex-wrap">
                        <span className="text-white/40 text-xs self-center mr-1">Watch on:</span>
                        {activePlatforms.map(([p]) => {
                            const meta = PLATFORM_META[p];
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPlatform(p)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                                        platform === p
                                            ? 'text-white border-transparent'
                                            : 'text-white/60 border-white/20 hover:border-white/40 bg-transparent'
                                    }`}
                                    style={platform === p ? { background: meta.color, borderColor: meta.color } : {}}
                                >
                                    <span>{meta.icon}</span>
                                    {meta.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Video area ── */}
                <div className="relative bg-black" style={{ paddingTop: '56.25%' /* 16:9 */ }}>
                    <div className="absolute inset-0">
                        {!platform ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <p className="text-white/40 text-sm">Select a platform above to watch</p>
                                <div className="flex gap-3 flex-wrap justify-center">
                                    {activePlatforms.map(([p]) => {
                                        const meta = PLATFORM_META[p];
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPlatform(p)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                                                style={{ background: meta.color }}
                                            >
                                                <span>{meta.icon}</span> {meta.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : platform === 'instagram' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-6 text-center">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                     style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                                    📸
                                </div>
                                <div>
                                    <p className="text-white font-semibold mb-1">Instagram Live</p>
                                    <p className="text-white/50 text-sm">Instagram Live streams cannot be embedded. Open Instagram to watch and interact.</p>
                                </div>
                                <a
                                    href={streams.instagram.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                                    style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                                >
                                    Watch on Instagram →
                                </a>
                            </div>
                        ) : embedUrl ? (
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                title={`${PLATFORM_META[platform]?.label} Live Stream`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-white/40 text-sm">Unable to load stream</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                {platform && platform !== 'instagram' && (
                    <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-4 shrink-0 flex-wrap">
                        <p className="text-white/35 text-xs">
                            Like and comment using the player controls above (requires sign-in to {PLATFORM_META[platform]?.label}).
                        </p>
                        <a
                            href={streams[platform]?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F58634] text-xs font-semibold hover:underline whitespace-nowrap shrink-0"
                        >
                            Open in {PLATFORM_META[platform]?.label} →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

const DEFAULT_STREAMS = {
    youtube:   { active: false, url: '' },
    facebook:  { active: false, url: '' },
    instagram: { active: false, url: '' },
};

export default function VideoHero() {
    const [streams, setStreams]     = useState(DEFAULT_STREAMS);
    const [isLive, setIsLive]       = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchStreams = useCallback(async () => {
        try {
            const res = await fetch('/api/livestream');
            if (!res.ok) return;
            const data = await res.json();
            setStreams(data);
            setIsLive(Object.values(data).some((p) => p.active && p.url));
        } catch {
            // network error — keep previous state
        }
    }, []);

    useEffect(() => {
        fetchStreams();
        const id = setInterval(fetchStreams, 60_000);
        return () => clearInterval(id);
    }, [fetchStreams]);

    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                {/* Desktop Video */}
                <video
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover hidden md:block"
                >
                    <source src="/home-hero-vid.mp4" type="video/mp4" />
                </video>

                {/* Mobile Video */}
                <video
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover md:hidden"
                >
                    <source src="/home-hero-vid-portrait.mp4" type="video/mp4" />
                </video>

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
                            <button
                                onClick={() => setModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-colors uppercase text-sm tracking-wider shadow-lg shadow-red-600/40"
                            >
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                LIVE NOW — WATCH
                            </button>
                        ) : (
                            <Link
                                href="/library"
                                className="bg-[#F58634] hover:bg-[#d9752c] text-white font-bold px-8 py-4 rounded-full transition-colors uppercase text-sm tracking-wider"
                            >
                                WATCH ONLINE
                            </Link>
                        )}
                        <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold px-8 py-4 rounded-full transition-all uppercase text-sm tracking-wider">
                            LISTEN ONLINE
                        </button>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <LiveStreamModal
                    streams={streams}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}
