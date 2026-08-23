'use client';

import { useState, useRef } from 'react';

function formatTime(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SermonPlayer({ audioUrl, title }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    if (!audioUrl) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center" style={{ color: '#94a3b8' }}>
                Audio is not available for this sermon.
            </div>
        );
    }

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }
    };

    const skip = (delta) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + delta));
    };

    const handleSeek = (e) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = val;
        setCurrentTime(val);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onWaiting={() => setBuffering(true)}
                onCanPlay={() => setBuffering(false)}
            />

            {/* Orange accent bar */}
            <div style={{ height: 4, background: '#f5f5f5' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#f58634', transition: 'width 0.3s linear' }} />
            </div>

            <div className="p-8">
                <p className="text-center font-bold text-gray-800 mb-6 truncate">{title}</p>

                {/* Seek slider */}
                <div className="mb-3">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.5}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full cursor-pointer"
                        style={{ accentColor: '#f58634' }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#94a3b8' }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8 mb-6">
                    <button
                        onClick={() => skip(-15)}
                        title="Back 15s"
                        style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.65rem', fontWeight: 700 }}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.89" />
                        </svg>
                        15s
                    </button>

                    <button
                        onClick={togglePlay}
                        style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: '#f58634', color: '#fff', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(245,134,52,0.40)',
                            transition: 'transform 0.1s',
                        }}
                        className="active:scale-95 hover:brightness-110"
                    >
                        {buffering ? (
                            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                        ) : playing ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={() => skip(15)}
                        title="Forward 15s"
                        style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: '0.65rem', fontWeight: 700 }}
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.49-3.89" />
                        </svg>
                        15s
                    </button>
                </div>

                {/* Download */}
                <div className="text-center">
                    <a
                        href={audioUrl}
                        download
                        style={{ color: '#f58634', fontWeight: 600, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Audio
                    </a>
                </div>
            </div>
        </div>
    );
}
