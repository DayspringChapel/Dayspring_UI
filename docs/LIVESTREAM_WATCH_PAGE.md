# Public livestream page

The permanent visitor link is https://www.dayspring-vlbc.org/live. It opens directly without a Dayspring account. Navigation, the homepage live-player dialog, the footer and the chatbot link to it. The dashboard's livestream workspace includes the link and sharing controls.

The page uses the existing public `/api/livestream` status endpoint and existing broadcast settings. YouTube automatic discovery and manual links continue to be configured in the dashboard. The page checks status on arrival, once per minute while visible, and when the viewer returns to the tab or reconnects. Manual refresh is also available. It does not create, start or end broadcasts.

When no broadcast is available, the page remains shareable and displays an offline message and sermon-library link. Once a broadcast becomes available, the player appears automatically. If the connection fails, an error is shown; an already-open player remains available. The dashboard's hide-watch-online setting hides playback on this page as well.

YouTube and Facebook use their embedded players. Restricted embeds and Instagram provide direct watch links. Platform restrictions still apply. The new page does not provide independent OBS hosting or change stream keys, provider credentials or existing broadcast controls.

**Share livestream** opens the device's native share sheet when supported, otherwise copies the permanent URL. A selectable read-only link provides a fallback when clipboard access is unavailable. The page includes canonical and social-preview metadata.

Deploy the backend reaction update and its main-context migration, then the frontend, as detailed below. No reporting migration or environment-variable change is required. Existing secrets are untouched.

## Comments, likes and emoji reactions

For a YouTube broadcast, `/live` now shows two distinct communities. YouTube's live chat appears on desktop with the matching broadcast ID and exact page hostname. On phones, viewers open YouTube to join its native chat. A direct YouTube link remains available if chat is disabled, sign-in is needed, or browser privacy settings block the embed. YouTube likes are displayed separately when the connected account can retrieve the public count; the button to like on YouTube opens YouTube for the viewer's own account. The website never posts to YouTube as the church on a viewer's behalf.

Dayspring comments and emoji composition work on the website at all screen sizes. They use the existing website-comment moderation feed and its validation, duplicate checks and review rules. Media personnel moderate them through the existing comments workspace. YouTube live-chat messages stay in YouTube's own chat and moderation tools.

The Dayspring like, love, amen, praise and joy buttons store per-browser choices in the main database. Clicking an active button removes that choice; retrying the same state cannot add duplicate counts. These totals are website reactions, not YouTube totals or a count of unique people. An essential HTTP-only viewer cookie remembers this browser's choices, and personalized responses are not cached. Reactions and live comments are accepted only for the currently public YouTube broadcast. YouTube like-count reads are cached for one minute across visitors.

**Deployment for interactions:** deploy the backend and apply `20261113061050_LiveVideoReactions` with `Update-Database -Context DayspringDbContext`, then deploy the frontend. This interaction addition requires the backend update even though the original watch-page route did not. No reporting migration or new provider secret is required; existing account settings are reused unchanged.

Provider limitation: https://support.google.com/youtube/answer/2524549 documents that embedded live chat is unavailable on mobile web.

Validation: pure helper tests cover trusted stream URLs and embed handling. The disposable local browser check in `tests/runtime-live-page.mjs` covers desktop/mobile viewing, offline/live changes, sharing, errors, platform switching and restricted embeds without using a real broadcast.
