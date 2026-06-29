import { getStreams, setStreams, setYouTubeActive, touchYouTubeCheck } from '@/lib/livestreamStore';

const YT_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

function extractYouTubeId(url) {
    const m = url?.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([^&?/\s]+)/
    );
    return m?.[1] || null;
}

async function checkYouTubeLive(url) {
    const videoId = extractYouTubeId(url);
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!videoId || !apiKey) return null; // can't check without key

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const status = data.items?.[0]?.snippet?.liveBroadcastContent;
        // 'live' | 'upcoming' | 'none' — 'none' means stream has ended
        return status === 'live' || status === 'upcoming';
    } catch {
        return null;
    }
}

export async function GET() {
    const streams = getStreams();

    // Auto-detect YouTube stream end (throttled to every 5 min)
    const sinceLastCheck = Date.now() - (streams._meta?.lastYouTubeCheck || 0);
    if (
        streams.youtube?.active &&
        streams.youtube?.url &&
        sinceLastCheck > YT_CHECK_INTERVAL
    ) {
        touchYouTubeCheck();
        const stillLive = await checkYouTubeLive(streams.youtube.url);
        if (stillLive === false) {
            // Stream has ended — auto-disable
            setYouTubeActive(false);
        }
    }

    return Response.json(getStreams());
}

export async function POST(request) {
    try {
        const body = await request.json();
        return Response.json(setStreams(body));
    } catch {
        return Response.json({ error: 'Invalid body' }, { status: 400 });
    }
}
