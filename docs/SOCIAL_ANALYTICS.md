# Social analytics

Open **Insights & accountability → Social analytics** (`/admin/social-analytics`). The Website livestreams / Social accounts tabs let staff move between the two reports. Access requires `CanViewReports` and the Reports resource, just like livestream analytics. Church Admin, Church Media and Superadmin can use their existing report access.

Select YouTube, Facebook, Instagram, X or WhatsApp. The report displays the account's latest available metrics, the period each covers, daily history, recent posts and publishing results. Hover/tap a chart or focus it and use arrow keys to inspect exact values. Line charts show changes over time; columns show publishing attempts per day. CSV exports include the chosen account's metrics, series and local publishing summary.

## Reading the figures

- Native figures come from the platform APIs using the existing server-side connections. Platform definitions differ; do not add followers/views across accounts and call the sum unique people.
- Current/lifetime counts and the last 28 complete days of platform reports have separate labels. Account history uses daily snapshots saved by Dayspring; it begins with collection, with a 90-day display window. There is no invented historical backfill. Daily chart dates are UTC dates; provider processing/time zones can affect when reports become available.
- A dash means unavailable, hidden or not returned. Zero means the provider actually returned zero. Missing days remain gaps.
- Publishing through Dayspring counts successful/failed publishing attempts in the last 28 days including today, plus the current queue. These are app operations, not platform views, unique posts or message reads. Retrying an operation can create multiple attempt records.
- Stale means the platform failed after a successful read. The last good figures remain visible with their original sync time. One failed account does not hide the other accounts.

## Account requirements

No connection settings are edited by this feature. Existing social secrets are reused and are never returned in reports. Deploying these changes must preserve the existing environment variables.

| Account | Available measurements | Requirements and limits |
| --- | --- | --- |
| YouTube | Subscribers, channel views/video count, up to 12 recent videos with available view/like/comment counts; daily views and watch minutes | Existing church OAuth connection. Basic reads need YouTube data read access. Daily reports additionally require the YouTube Analytics API and `yt-analytics.readonly` plus `youtube.readonly`. Hidden subscriber counts remain unknown. Existing tokens are not silently reauthorised or overwritten. |
| Facebook | Page followers, up to 12 recent published posts with available reactions/comments/shares, daily content views | Page connection, `pages_read_engagement`, `read_insights`, eligible Page. Uses `page_media_view`, not deprecated Page impression metrics. |
| Instagram | Professional-account followers/media count, up to 12 recent posts with available likes/comments, period views/reach/interactions | Existing Facebook Login connection for a professional account, `instagram_manage_insights` and `pages_read_engagement`. Meta can withhold metrics for ineligible/small accounts. Period reach is read as a period total, never summed from daily unique counts. |
| X | Followers/following/post count, up to 10 recent posts with available public engagement | Existing OAuth credentials with read access and an API plan permitting account/post lookup. Missing impressions remain unknown. |
| WhatsApp | Business-account messages sent/delivered and daily series | Existing access token, `whatsapp_business_management` and `whatsapp_business_messaging`, plus optional server setting `SocialMedia__WhatsApp__BusinessAccountId` (the WABA ID, not PhoneNumberId). No token replacement is needed. This does not supply WhatsApp Channel audience or individual read receipts. |

Connected, Some data unavailable, Not connected, Setup needed, Read access needed, Platform limit reached and Temporarily unavailable explain the result of each read. Some data unavailable retains the measurements that succeeded. Read permissions may need the platform administrator to reauthorise the existing connection; the dashboard cannot grant provider permissions itself.

## Collection and deployment

Native reads are cached for ten minutes. Manual sync can reuse a result checked within one minute, protecting API allowances. The background collector runs hourly in Combined/Worker modes; API-only installations collect when this dashboard is read unless a separate worker is running. Each provider has a twelve-second budget. Native adapters only issue read requests; they do not publish posts or send messages.

Deploy both repositories and apply **main-context migration `20261115092612_SocialAnalyticsHistory`**. There is no reporting-context migration for this feature. The new `social_analytics_snapshots` table stores the platform, an account hash, date, observation time and aggregate counts. It stores no access tokens or commenter identities. Existing social configuration and credentials remain unchanged.

Package Manager Console, with the backend startup project selected:

```powershell
Update-Database -Context DayspringDbContext
```

The checked-in migration is already provided; do not create a duplicate migration. If production already applies migrations at startup, its configured migration process can apply this one.

## Verification

Provider adapters are tested with synthetic responses for missing/zero values, permissions, rate limits, safe links, GET-only requests and OAuth signatures. PostgreSQL tests verify caching, account isolation, daily snapshots, history gaps and stale data. Browser checks cover staff access, chart interaction, exports, switching platforms and mobile layout. Actual account data depends on deployed credentials/provider permissions and has not been verified against live social accounts during local testing.

Provider references: [YouTube Analytics reports](https://developers.google.com/youtube/analytics/reference/reports/query), [Facebook Page insights](https://developers.facebook.com/docs/graph-api/reference/insights/), [Instagram insights](https://developers.facebook.com/documentation/instagram-platform/insights), [WhatsApp Business analytics](https://developers.facebook.com/docs/graph-api/reference/waba-analytics/).
