import { normalizeLivestreamSettings } from './livestreamSettings.js';

export const LIVE_PAGE_URL = 'https://www.dayspring-vlbc.org/live';
export const LIVE_PLATFORMS = { youtube: 'YouTube', facebook: 'Facebook', instagram: 'Instagram' };

export function safeLiveUrl(platform, value) {
    try {
        const url = new URL(value);
        const hosts = { youtube: ['youtube.com', 'youtu.be'], facebook: ['facebook.com', 'fb.watch'], instagram: ['instagram.com'] }[platform] || [];
        return url.protocol === 'https:' && !url.username && !url.password && hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.href : null;
    } catch { return null; }
}

export function activeLiveStreams(settings) {
    const value = normalizeLivestreamSettings(settings);
    if (value.hideWatchOnline) return [];
    return Object.keys(LIVE_PLATFORMS).flatMap(platform => {
        const stream = value[platform], url = safeLiveUrl(platform, stream.url);
        return stream.active && url ? [{ ...stream, platform, url, label: LIVE_PLATFORMS[platform] }] : [];
    });
}

export function liveEmbedUrl(stream, origin) {
    const safe = safeLiveUrl(stream.platform, stream.url);
    if (!safe || stream.embedAllowed === false) return null;
    const url = new URL(safe);
    if (stream.platform === 'youtube') {
        const id = url.hostname.endsWith('youtu.be') ? url.pathname.split('/')[1] : url.searchParams.get('v') || url.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]+)/)?.[1];
        if (!id || !/^[\w-]{6,64}$/.test(id)) return null;
        const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
        if (origin) params.set('origin', origin);
        return `https://www.youtube.com/embed/${id}?${params}`;
    }
    if (stream.platform === 'facebook') return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(safe)}&show_text=false&autoplay=true`;
    return null;
}

export function liveYouTubeVideoId(stream) {
    if (stream?.platform !== 'youtube') return null;
    const embed = liveEmbedUrl({ ...stream, embedAllowed: true });
    const id = embed ? new URL(embed).pathname.split('/').pop() : null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}
