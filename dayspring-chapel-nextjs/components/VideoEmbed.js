'use client';

import { useEffect, useRef, useState } from 'react';
import { extractYouTubeId } from '@/lib/youtube';

const YOUTUBE_RATIO = 16 / 9;

// Renders an in-app player for a video from either source — a restrained YouTube
// (nocookie) iframe, or a native <video> tag for a directly-uploaded file.
// Renders nothing if neither URL is usable, so callers can render unconditionally.
// Pass `fill` to have it absolutely fill its positioned parent (e.g. a card used
// as background media) instead of sizing itself by aspect ratio.
// Pass `autoplay` to have it start playing immediately like a static image would —
// browsers only allow this muted, so autoplay always implies muted + looped.
export default function VideoEmbed({ youtubeUrl, videoUrl, title = 'Video', className = '', style, fill = false, autoplay = false }) {
    const youtubeId = extractYouTubeId(youtubeUrl);
    const containerRef = useRef(null);
    const [coverSize, setCoverSize] = useState(null);
    const fillStyle = fill
        ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
        : { position: 'relative', width: '100%', aspectRatio: '16 / 9' };

    // A YouTube iframe can't use object-fit: cover — it only fits its own box,
    // it never crops. To make it "mask" a background area like a real cover video,
    // measure the container and oversize the iframe to the larger dimension, then
    // center it so the excess is clipped by the container's overflow: hidden.
    useEffect(() => {
        if (!fill || !youtubeId) return;
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width && height) setCoverSize({ width, height });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [fill, youtubeId]);

    if (youtubeId) {
        const params = new URLSearchParams({ modestbranding: '1', rel: '0' });
        if (autoplay) {
            params.set('autoplay', '1');
            params.set('mute', '1');
            params.set('loop', '1');
            params.set('playlist', youtubeId); // required by YouTube for single-video looping
            params.set('controls', '0');
            params.set('showinfo', '0');
            params.set('iv_load_policy', '3');
            params.set('disablekb', '1');
        }

        let iframeStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 };
        if (fill && coverSize) {
            const containerRatio = coverSize.width / coverSize.height;
            const width = containerRatio > YOUTUBE_RATIO ? coverSize.width : coverSize.height * YOUTUBE_RATIO;
            const height = containerRatio > YOUTUBE_RATIO ? coverSize.width / YOUTUBE_RATIO : coverSize.height;
            iframeStyle = {
                position: 'absolute', top: '50%', left: '50%',
                width, height, border: 0,
                transform: 'translate(-50%, -50%)',
                pointerEvents: autoplay ? 'none' : 'auto',
            };
        }

        return (
            <div
                ref={containerRef}
                className={className}
                style={{ ...fillStyle, overflow: 'hidden', background: '#000', ...style }}
            >
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`}
                    title={title}
                    style={iframeStyle}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    if (videoUrl) {
        return (
            <video
                src={videoUrl}
                controls={!autoplay}
                autoPlay={autoplay}
                muted={autoplay}
                loop={autoplay}
                playsInline={autoplay}
                className={className}
                style={fill
                    ? { ...fillStyle, objectFit: 'cover', background: '#000', ...style }
                    : { width: '100%', display: 'block', objectFit: 'cover', background: '#000', ...style }}
            />
        );
    }

    return null;
}
