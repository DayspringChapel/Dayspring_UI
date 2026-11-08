# Livestream sources

## Available after this release

In Settings > Live Stream, choose a YouTube source, then save settings.

- **Automatically detect YouTube Live**: the API uses the existing server-side church-channel OAuth authorization to list current broadcasts. Only public broadcasts whose actual lifecycle state is `live` are advertised. Starting a public broadcast in YouTube Studio or the YouTube app is sufficient; staff do not paste a new link or create it through Dayspring. An upstream check is cached for 30 seconds per API instance; the homepage checks every minute and when the visitor returns or reconnects. Visibility is therefore periodic, not instantaneous.
- **Add a YouTube live link**: enter the watch URL, activate its manual toggle and save. This explicitly uses the saved link without automatic discovery. Staff are responsible for deactivating it when the broadcast ends. Facebook and Instagram remain manually configured links.

Automatic mode reports Live, Offline, NotConfigured or Unavailable. An unavailable check does not falsely confirm an old broadcast as live. When OAuth is absent or invalid, configure the existing authorized channel or explicitly use manual mode. Detection reads the channel attached to the existing authorization; a social-footer channel ID does not authorize a different account.

The existing “Create a YouTube broadcast” action provisions a YouTube event and returns encoder details for **YouTube only**. Creating an event does not itself send camera video or prove the event has gone live. Automatic mode waits for YouTube to report actual live state. This action remains optional; automatic discovery does not create or stop broadcasts.

## Embedded playback

The player supplies the website origin and uses `strict-origin-when-cross-origin` for its iframe referrer policy. Provider-reported disabled embedding uses an explicit “Watch live on YouTube” link instead of a known-broken embedded player. The external watch link also remains available alongside normal playback.

YouTube playback errors can also result from broadcast/account settings, viewer restrictions or browser behavior. Error `152-4` from the reported screenshot was not assigned a definitive cause from the screenshot alone. Compare the external watch link and a private-window visit before treating it as an application error. This release does not alter the church's live broadcast settings or bypass YouTube restrictions.

## Deployment

1. Preserve all existing YouTube OAuth and other social-media secrets.
2. Apply the **main** `DayspringDbContext` migration `20261108074924_AddYouTubeLiveDetectionMode`. It adds one boolean setting, defaults existing sites to automatic detection, and does not change credentials or existing links. No reporting migration is needed.
3. Deploy the backend with `GET /api/v1/site-settings/livestream/status`, then the frontend.
4. Verify automatic detection against the church's connected account. Use manual mode if that is the operator's intended source.

The older GET `/livestream` still returns saved editable settings; `/livestream/status` returns current public presentation. The frontend falls back to the older route on 404 during a staggered rollout. Automatic mode is not available until the new backend is deployed. Source-choice writes require the existing livestream-management permission and browser-origin checks. Neither public route returns OAuth tokens, refresh tokens, client secrets or encoder keys.

## Future independent OBS and Restream-style service

Independent OBS ingestion and multichannel restreaming are deferred at the owner's request. They have **not** been implemented or represented by a YouTube stream key.

That future service will need an independent RTMP/RTMPS ingest endpoint, protected stream keys, media transcoding, browser playback delivery, reliable live-state events, and optional outputs to separately authorized social channels. OBS would send video to that service; website playback and each social destination would then be independent outputs. A managed video provider or a separately hosted media server must be selected before connecting this path. No paid service, server or new secret was provisioned in this release.

References: [YouTube live broadcast listing](https://developers.google.com/youtube/v3/live/docs/liveBroadcasts/list), [broadcast embedding settings](https://developers.google.com/youtube/v3/live/docs/liveBroadcasts), [embedded-player client identity](https://developers.google.com/youtube/terms/required-minimum-functionality#embedded-player-api-client-identity).
