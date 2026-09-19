// Public feed of the church's most recent YouTube uploads, shown on the
// homepage. Requires:
//   YOUTUBE_API_KEY       — a YouTube Data API v3 key (no OAuth needed, this
//                            only reads public playlist data)
// The channel ID itself is admin-configurable (Settings > Live Stream >
// Social & Contact Links) and comes from the backend's site-settings.

import { fetchSocialLinksServer } from '@/lib/serverApi';

function uploadsPlaylistId(channelId) {
    // Every standard YouTube channel's "uploads" playlist ID is the channel
    // ID with its "UC" prefix swapped for "UU" — avoids a second API call
    // (channels.list) just to look up contentDetails.relatedPlaylists.uploads.
    if (!channelId?.startsWith('UC')) return null;
    return `UU${channelId.slice(2)}`;
}

export async function GET() {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const social = await fetchSocialLinksServer();
    const channelId = social?.youTubeChannelId;

    if (!apiKey || !channelId) {
        return Response.json({ videos: [] });
    }

    const playlistId = uploadsPlaylistId(channelId);
    if (!playlistId) return Response.json({ videos: [] });

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=6&key=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return Response.json({ videos: [] });

        const data = await res.json();
        const videos = (data.items || [])
            .filter((item) => item.snippet?.resourceId?.videoId)
            .map((item) => ({
                videoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || null,
                publishedAt: item.snippet.publishedAt,
            }));

        return Response.json({ videos });
    } catch {
        return Response.json({ videos: [] });
    }
}
