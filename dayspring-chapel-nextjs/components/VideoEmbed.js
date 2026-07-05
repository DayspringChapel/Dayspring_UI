'use client';

import { extractYouTubeId } from '@/lib/youtube';

// Renders an in-app player for a video from either source — a restrained YouTube
// (nocookie) iframe, or a native <video> tag for a directly-uploaded file.
// Renders nothing if neither URL is usable, so callers can render unconditionally.
// Pass `fill` to have it absolutely fill its positioned parent (e.g. a card used
// as background media) instead of sizing itself by aspect ratio.
// Pass `autoplay` to have it start playing immediately like a static image would —
// browsers only allow this muted, so autoplay always implies muted + looped.
export default function VideoEmbed({ youtubeUrl, videoUrl, title = 'Video', className = '', style, fill = false, autoplay = false }) {
    const youtubeId = extractYouTubeId(youtubeUrl);
    const fillStyle = fill
        ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
        : { position: 'relative', width: '100%', aspectRatio: '16 / 9' };

    if (youtubeId) {
        const params = new URLSearchParams({ modestbranding: '1', rel: '0' });
        if (autoplay) {
            params.set('autoplay', '1');
            params.set('mute', '1');
            params.set('loop', '1');
            params.set('playlist', youtubeId); // required by YouTube for single-video looping
        }
        return (
            <div
                className={className}
                style={{ ...fillStyle, overflow: 'hidden', background: '#000', ...style }}
            >
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`}
                    title={title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
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
                controls
                autoPlay={autoplay}
                muted={autoplay}
                loop={autoplay}
                playsInline={autoplay}
                className={className}
                style={fill
                    ? { ...fillStyle, objectFit: 'cover', background: '#000', ...style }
                    : { width: '100%', display: 'block', background: '#000', ...style }}
            />
        );
    }

    return null;
}
