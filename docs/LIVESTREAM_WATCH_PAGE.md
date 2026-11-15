# Public livestream page

The permanent visitor link is https://www.dayspring-vlbc.org/live. It opens directly without a Dayspring account. Navigation, the homepage Live now action, the footer and the chatbot link directly to it. The dashboard's livestream workspace includes the link and sharing controls.

The page uses the existing public `/api/livestream` status endpoint and existing broadcast settings. YouTube automatic discovery and manual links continue to be configured in the dashboard. The page checks status on arrival, once per minute while visible, and when the viewer returns to the tab or reconnects. A retry control is available if the status request fails. It does not create, start or end broadcasts.

When no broadcast is available, the page remains reachable and displays an offline message and sermon-library link; sharing controls stay disabled. Once a broadcast becomes available, the player appears automatically. If the connection fails, an error is shown; an already-open player remains available. The dashboard's hide-watch-online setting hides playback on this page as well.

YouTube and Facebook use their embedded players. Restricted embeds and Instagram provide direct watch links. Platform restrictions still apply. The new page does not provide independent OBS hosting or change stream keys, provider credentials or existing broadcast controls.

**Share livestream** opens the device's native share sheet when supported, otherwise copies the permanent URL. A selectable read-only link provides a fallback when clipboard access is unavailable. The page includes canonical and social-preview metadata.

Deploy the backend reaction update and its main-context migration, then the frontend, as detailed below. No reporting migration or environment-variable change is required. Existing secrets are untouched.

## Comments, likes and emoji reactions

For a YouTube broadcast, `/live` has one section named Live chat at every screen size. Website comments, imported YouTube video comments and connected YouTube live-chat messages appear together without source badges. There is no second chat iframe. The reaction buttons and emoji composer are next to the conversation.

Names are optional. Outside live broadcasts, an unnamed comment is shown as Anonymous. Within a live broadcast, the first unnamed commenter receives Anonymous1, the next receives Anonymous2, and so on. The server allocates these numbers atomically in PostgreSQL, remembers the same browser using an essential HTTP-only cookie, and scopes the numbering to the YouTube broadcast video ID. A new broadcast ID starts again at Anonymous1. Clearing cookies, changing browser or using another device creates a new viewer. A named comment does not consume an anonymous number. AnonymousN is reserved and cannot be manually impersonated through the live form.

Approved website live comments are queued for YouTube live chat. They are posted by the connected church account with the display name attributed in the message text, not as the viewer's own YouTube account. The form discloses this before posting. Live comments allow 140 characters so that the attributed name fits in the outgoing chat message. Held comments are shared only after approval. Saved comments remain on the website when Google is unavailable. The viewer sees a delivery warning when confirmation is unavailable; ambiguous sends are not automatically retried, to avoid duplicate public messages.

The bridge uses the existing YouTube OAuth connection with youtube.force-ssl permission and requires active YouTube live chat. It retains the provider page token, honors pollingIntervalMillis (at least 30 seconds), and uses a database lock to share one cursor across API/worker replicas. A worker processes the active visible broadcast; opening the live conversation also advances synchronization. Importing begins with the history YouTube returns on first connection, then continues with new messages. Deleted chat messages are hidden locally when a deletion event is received. Imported copies of relayed website messages are suppressed. YouTube video comments and live-chat messages are separate provider features; website live comments are relayed into live chat, not duplicated as permanent video comments.

The Like, Love, Amen, Praise and Joy totals remain website reaction actions. They are not combined with YouTube's native metrics and anonymous website actions do not become likes on somebody's YouTube account. Emoji text submitted as a comment can be relayed to the live chat. Moderators see website and imported comments in Social & community using their existing permissions.

**Deployment:** deploy the backend and apply main-context migration `20261115070441_LiveConversationBridge` (which follows `20261113061050_LiveVideoReactions`) using `Update-Database -Context DayspringDbContext`, then deploy the frontend. No reporting migration or new provider secret is required. Do not replace the existing OAuth or other social-media environment variables. If startup migration/seeding is enabled, the normal startup applies the migration. If `Execution:Mode=Api` is used without a separate worker, synchronization runs while viewers request the feed; use the existing Combined mode or worker service for processing without an open viewer page.

Provider references: [posting chat messages](https://developers.google.com/youtube/v3/live/docs/liveChatMessages/insert), [reading chat and polling limits](https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list). API quota, account permissions, moderation and enabled live chat can limit sharing.

Validation: pure helper tests cover trusted stream URLs and embed handling. The disposable local browser check in `tests/runtime-live-page.mjs` covers desktop/mobile viewing, offline/live changes, sharing, errors, platform switching and restricted embeds without using a real broadcast.

## Live-only sharing and public styling

Watch-live navigation pulses red while a public stream is active, with a steady indicator for reduced-motion preferences. Copy/share controls are disabled and the URL field is empty while offline. Sharing rechecks public status before proceeding. The public website uses the shared blue-black palette; staff dashboards and creator-themed standalone forms keep their existing themes.

## Mobile navigation, assistant and install reminder

The mobile hamburger opens a compact dropdown rather than a full-screen overlay. Escape, an outside tap, the close button or a navigation link closes it. The assistant launcher can be dragged with mouse/touch or moved with arrow keys while focused; its position is saved and clamped back onto the screen after resizing. It starts on the left so it leaves the usual install-banner position free. The install banner also has priority above the assistant.

Installation is remembered in browser storage after appinstalled, an accepted installation, standalone launch or the Already installed button. The reminder will not return on that browser while this saved state remains. Browsers cannot reliably detect an installation made in another browser/device; Already installed lets the viewer dismiss it permanently there too. Clearing site storage removes the saved state.

## Website audience analytics

Staff open **Insights & accountability → Livestream analytics** (`/admin/live-analytics`). The existing `CanViewReports` permission and Reports resource control access; Superadmin, Church Admin and Church Media already receive that permission. The livestream settings workspace also links to the reports. In the installed PWA, visitors can open the hamburger menu and select Admin sign in, which uses the same `/admin/login` route and staff credentials as the website.

The live page says **Join our services** and shows **watching here** and **website views**. Public totals refresh about every 15 seconds. These are website measurements; they do not replace YouTube's official view count or cover people watching only on YouTube. The YouTube player now uses its own native play control rather than automatic playback, and its official player events provide playback state. No player state means no confirmed playback is counted. A failed statistics request displays a dash while the player and chat remain usable.

Metric definitions:
- Page visits: browser tab/page sessions that reached an active broadcast on `/live`.
- Website views: one playback start per page session; pause/resume does not add views. Reloading or another tab can create another session/view.
- Unique viewers: distinct browser cookies that reported playback for that broadcast, rather than identifiable people.
- Watching now: distinct viewing browsers reporting playing within the last 45 seconds. Multiple tabs for the same browser count once.
- Playback time: estimated visible playback between short server-timed heartbeat intervals. Paused, hidden and disconnected gaps do not accrue time. Overlapping tabs for the same browser share one watch-time interval.
- Average viewing time: playback seconds divided by unique viewing browsers.
- Peak watching: highest observed concurrent website viewing browsers.
- Device/referral charts: page visits grouped into broad categories. No raw user-agent, IP address, exact location or referring URL is stored.

Reports include per-stream history, date filters, sampled concurrent-viewer and playback-time charts, page/device/referral breakdowns, comment/reaction counts, player errors and a CSV export with UTC timestamps. New viewing cannot be backfilled for broadcasts that ended before tracking was deployed. For Facebook/Instagram, page attendance is measured; confirmed iframe playback is unavailable and is shown as Not measured. Reusing exactly the same non-YouTube live URL keeps its link-based report; YouTube reports use the broadcast's unique video ID.

Do Not Track and Global Privacy Control disable audience heartbeat collection. The existing essential chat/reaction cookie is reused, hashed separately per broadcast; no staff token is forwarded to public tracking endpoints. The cookie is established on the `/live` response before parallel client requests start.

**Deployment:** apply main-context migration `20261115082401_LiveAudienceAnalytics` and deploy both backend and frontend. No reporting-context migration, YouTube Analytics scope or new social secret is required. Existing social credentials must remain unchanged. The privacy page describes aggregate playback collection. The favicon uses the existing Dayspring logo icon.

## Disabled YouTube video comments and chat availability

`commentsDisabled` from `commentThreads.list` refers to ordinary video comments. It does not determine whether live chat is enabled. This expected response is logged once at information level and video-comment import backs off for 15 minutes, avoiding repeated exception traces and unnecessary calls. Authentication, quota and other provider failures remain distinguishable warnings. Reading saved website chat is protected by a four-second provider-sync budget, so a slow YouTube connection does not block the entire feed. The background worker imports ordinary video comments separately from the live-chat path.

Website messages are relayed into **YouTube live chat** through the church account after moderation approval. Live chat must be enabled on YouTube and the existing account must have posting permission. This does not bypass disabled comments or YouTube's own restrictions. Enable the relevant feature in YouTube Studio if the channel owner wants it available.

## Reading the improved reports

Choose a broadcast from the selector. Date filters select broadcasts; each selected report still covers that broadcast's complete tracked lifetime. Browse broadcast history opens the comparison table.

The summary shows how many page visits started the video. The six main cards distinguish current watching, video starts, distinct viewing browsers, total/average watch time and peak watching. **Audience over time** uses a straight line for each period's peak concurrent viewers. **Viewing activity** uses columns for new video starts or viewing minutes per period. Device and referral bars compare categories. Hover, tap or focus a chart and use arrow keys for exact measurements. Gaps stay blank; a single measurement appears as a point until more history exists.

The **Social accounts** tab opens the new [Social analytics workspace](SOCIAL_ANALYTICS.md), which uses platform-reported measurements rather than website heartbeat data.
