'use client';

import { extractYouTubeId } from '@/lib/youtube';

// Renders an in-app player for a video from either source — a restrained YouTube
// (nocookie) iframe, or a native <video> tag for a directly-uploaded file.
// Renders nothing if neither URL is usable, so callers can render unconditionally.
// Pass `fill` to have it absolutely fill its positioned parent (e.g. a card used
// as background media) instead of sizing itself by aspect ratio.
export default function VideoEmbed({ youtubeUrl, videoUrl, title = 'Video', className = '', style, fill = false }) {
    const youtubeId = extractYouTubeId(youtubeUrl);
    const fillStyle = fill
        ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
        : { position: 'relative', width: '100%', aspectRatio: '16 / 9' };

    if (youtubeId) {
        return (
            <div
                className={className}
                style={{ ...fillStyle, overflow: 'hidden', background: '#000', ...style }}
            >
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?modestbranding=1&rel=0`}
                    title={title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
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
                className={className}
                style={fill
                    ? { ...fillStyle, objectFit: 'cover', background: '#000', ...style }
                    : { width: '100%', display: 'block', background: '#000', ...style }}
            />
        );
    }

    return null;
}
