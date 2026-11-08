# Dayspring OS manual and verification report

Date: 4 November 2026. Verification used the local source, synthetic users and disposable local PostgreSQL databases. This is a record of checks and repairs, not a claim that every production integration has been exercised.

## Deliverables

- `Dayspring_OS_Complete_Manual.pdf`: 64 pages, 35 chapters and 24 vector workflow diagrams, with contents and PDF navigation bookmarks.
- `DAYSPRING_OS_COMPLETE_MANUAL.md`: editable source, including Mermaid versions of every diagram.
- `DAYSPRING_OS_ROUTE_REFERENCE.md`: source-derived page inventory and 220 backend route declarations. Use the controller code for exact request/response schemas.

The manual explains public and protected pages, login and inactivity, each operating area, form creation and collection, answer-level analysis, response counts and export, training and church-wide certificates, approval hierarchy and corrections, independent website/social publication, reporting, operational monitoring, account recovery, all 67 registered permissions, five built-in role defaults, 20 resources and eight dashboard cards. It distinguishes available functionality from operational prerequisites and incomplete features.

## Repairs made

1. Appointment search now applies nonempty filters, translates the full-name expression to PostgreSQL and pages in stable order. The previous implementation ignored its filter result and applied `Take` before `Skip`.
2. Children are linked to parent biodata using the parent's user ID. A missing parent biodata record no longer removes a child from the list. Empty search no longer dereferences null; paging uses the child's birth date and ID.
3. Limited user and event-archival queries now have deterministic ordering.
4. Sidebar counts use actual capabilities, including custom roles. A reviewer with both queue permissions receives a combined, deduplicated approval count. Independent request failures do not erase other counts. Birthday comparisons preserve calendar dates.
5. Livestream server routes use the same server-only backend origin as the protected UI. Writes accept the existing HttpOnly browser session and retain exact-Origin validation. Malformed JSON returns 400. Anonymous or untrusted-origin writes remain forbidden.
6. The backend serializes `YouTube` as `youTube`; public components and the settings editor expected `youtube`. Both reads now normalize the field, so saved streams appear consistently. The public response includes only supported settings fields.
7. Administrators can save cleared livestream/social settings and turn all streams off. The previous disabled Save button prevented these valid changes.
8. The publishing tab is named **Publishing library**, reflecting that an item already published to the website remains available for later social sharing.
9. Vercel's nonsecret default origins now include the canonical `https://www.dayspring-vlbc.org` address, the apex address and the original Vercel address. Existing hosting environment overrides must still match the actual browser origin, and a redeploy is required for changes to take effect.
10. Added **Your account** through the profile badge. An authenticated person can change their own password with the current password, including a bootstrap administrator without security questions. The API rejects a different account ID, checks the current password and enforces the new-password length. Existing browser credentials become invalid after a successful change. A restricted role receives access only to its own password PUT action, not general user administration. Logout waits are bounded.
11. Updated the form-workspace browser regression for the response-count badge and the current question-analysis heading.

No schema migration was added for these repairs. The existing browser-session and inactivity migrations must already be deployed. No live secrets, provider tokens, appsettings credentials or social-media settings were replaced.

## Validation completed

| Check | Result |
| --- | --- |
| Backend test suite with PostgreSQL integration enabled | 553 passed; zero failed or skipped |
| Backend CI formatting check | Passed: `dotnet format --verify-no-changes --no-restore --severity error` |
| Frontend unit suite | 51 passed; zero failed or skipped |
| Frontend ESLint | Passed |
| Frontend production build | Passed |
| Real API/session smoke | Passed: readiness, restoration, cookie flags, CSRF, authorization, idempotency and logout revocation |
| Real forms/certificate API smoke | Passed: persistence and replay, SQL analysis, XLSX import/export, QR, PDF template rendering, durable worker generation, batch approval/issuance, private retrieval, revocation and permission isolation |
| Real Admin/Media/SuperAdmin form browser checks | Passed: create/save, persisted themes and header images, direct publishing, public submission, responsive layouts and CSP |
| Full form-workspace browser flow | Passed: desktop/touch reorder, sections and required validation, suspension/resume, collection dates, optional analysis, Media-owned training certificate generation/review/issue and private PDF download |
| Access-management browser checks | Passed: custom permission/role creation, named assignment, scoped dashboard, API resource restrictions, suspension, church-access redirect, categorized monitoring and responsive layouts |
| Account/settings browser checks | Passed: public/protected livestream consistency, session-authenticated writes, CSRF rejection, blank-settings save, wrong-current-password rejection, own-password change, old-session invalidation, other-account denial and account layouts at 320/390/768/1280 px |
| Synthetic media/workflow browser checks | Passed: program creation, linked flyer submission, media/admin/final review, canceled-review safety, publishing destination, social workspace and Superadmin override/issuance exemption |
| Synthetic layout and analysis browser checks | Passed: three dashboard roles at five screen widths, question choice counts and percentages, zero-count options, multiple selections, Likert rows, numeric scales, search, responsive charts and updating response badges |
| Synthetic session and proxy checks | Passed: bounded transient retries, returning-tab and online recovery, expiry redirects, automatic 30-minute inactivity logout, login-only rate-limit propagation, stripped upstream cookies and independent anonymous session reads |
| PDF rendering review | All 64 pages inspected; tables and diagrams render without clipped text |

The older standalone certificate smoke script requires two preseeded fixture accounts and was not used as the acceptance result. Equivalent and broader generation, approval, issuance, retrieval and revocation paths were exercised through the API and creator-workspace tests above. Synthetic browser fixtures do not prove an external provider accepted a real post.

## Release and remaining operational verification

These changes are local source changes. They have not been deployed by this audit. Review and deploy the backend before the frontend for the new current-password action, then repeat authorized checks against production.

- Preserve the deployed connection strings, social-media client credentials, provider access/refresh tokens, certificate-code keys and other server-only secrets. This task does not require replacing them.
- Confirm the main and reporting migrations reach the intended databases and schemas. Passing local tests does not prove a Render environment variable points to the intended Neon database.
- Confirm the exact browser origin in Vercel and redeploy after changing its environment. A repository default cannot override an incompatible host setting.
- Confirm API readiness, reporting freshness, worker health, private file persistence, certificate renderer configuration and backup recovery.
- Verify external social delivery with the configured accounts and channel permissions when the operator is ready to publish. No real social posts were sent during this audit.
- Review the manual's Limits chapter: it does not promise automatic certificate email delivery, unlimited synchronous exports, unimplemented tenancy/branch administration, storage cleanup or arbitrary new application behavior from a custom permission label.

## Administrator password handling

There is no universal production administrator password. A fresh bootstrap uses the operator's `Bootstrap__Password`; the account's current password is not recoverable from its stored hash. Changing bootstrap configuration does not reset an existing account. The PDF gives initial setup, current-password change and controlled recovery instructions. Keep actual credentials in the church's approved secret store, outside the manual.
