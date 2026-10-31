# Dayspring OS frontend and DaySpring Chapel website

Next.js App Router application. The public website retains church branding; the
administrative application uses Dayspring OS branding from `lib/branding.js`.

## Local development

Use Node 22+, run `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`.
The backend must include the browser-session migration. Run `npm test` for transport
and session-security checks, `npm run lint` for ESLint and `npm run build` for a
production build.

## Production runtime

This application requires a running Next.js server. It uses server route handlers
for sessions, the backend proxy, announcements, chat and YouTube, plus dynamic pages.
S3 static export cannot serve these features. S3/CloudFront can serve static assets
or sit in front of the application with correct routing; they cannot replace it.

On Linux the build produces standalone output. `Dockerfile` runs that output as a
non-root user. Build with `docker build -t dayspring-ui .`, then run with port 3000
and environment variables. `render.yaml` assumes this repository is the service root.
For a parent workspace, set the service root to `Dayspring_UI` in hosting settings.
Windows development omits standalone output; use `npm start` after build.

Required server environment:

* `BACKEND_API_URL`: API origin, preferably HTTPS in production. Takes precedence
  over the older `NEXT_PUBLIC_BACKEND_API_URL` fallback.
* `APP_ORIGIN`: trusted HTTPS browser origin. For this deployment use
  `https://dayspring-ui.vercel.app` (not the `/admin/login` URL). The repository's
  `vercel.json` sets that public origin. Dashboard environment values must match it.
  `APP_ORIGINS` may list additional exact origins separated by commas.
  With neither setting, Vercel deployments use only Vercel's server-supplied project,
  deployment and branch hostnames. Other production hosts fail closed without an origin.
* `NODE_ENV=production`: enables Secure cookies; production must use HTTPS.

Never put credentials in `NEXT_PUBLIC_` variables. Server-only social credentials
and YouTube configuration are described in `.env.example`. Configure backend JWT
settings even when the UI uses browser sessions, to preserve existing API clients.

## Session migration and API integration

Deploy the backend migration/API first, then the frontend. Existing web users sign
in again; old browser-storage credentials are removed, not migrated. JWT API clients
remain supported. Do not roll back to the old browser-token frontend for session recovery.

The browser uses `/api/auth/session` and `/api/backend/api/v1/...`. Next sends the
opaque HttpOnly session cookie as an authorization header to a fixed upstream;
no JWT or refresh token is returned to browser JavaScript. Sessions are stored as
hashes in PostgreSQL, expire after 12 hours (7 days when remembered), and are
revoked by confirmed logout or password change. Re-authentication is required at
absolute expiry. Only non-secret user/permission state is held in browser memory.

Writes require an exact trusted Origin; the UI needs no cross-origin credentialed
API access. Forward requests to Next preserving public Host/HTTPS scheme and set
APP_ORIGIN to the public address. Do not cache session/proxy responses in a CDN.

If login returns `Invalid request origin.`, open the Vercel project → Settings →
Environment Variables and set `APP_ORIGIN=https://dayspring-ui.vercel.app` for
Production, then redeploy. Environment changes do not update an existing deployment.
Custom domains must be explicitly listed; do not disable the origin guard.
Public pages, static assets and anonymous public content retain service-worker caching.
Proxy data is cached only when the server confirms that no session credential was
forwarded. Staff requests bypass the cache; no authenticated response is cached.

Transport retries apply only to GET/HEAD network failures or 429, bounded by three
retries, backoff and timeouts. Writes and uploads are sent once. After an ambiguous
failure, check persisted state before retrying. `idempotencyKey` is accepted by the
client for endpoints that implement backend deduplication; sending the header does
not make an arbitrary endpoint idempotent.

## Security and operational limits

The enforced CSP uses per-request script nonces and restricts framing, base URLs and
object plugins. HttpOnly cookies do not eliminate XSS risks.
The login limiter is process-local (10/minute per upstream peer); use a trusted edge
limiter for multiple replicas and review trusted proxy handling before using forwarded
IP addresses. Monitor backend `/health/live` and `/health/ready`.

The first form/certificate download flow is available at `/admin/forms`, public
`/forms/{id}`, and `/certificates/download`. Enable **Attach certificate to this form**
to return a private code after a saved response. Administrators attach a recipient PDF,
another administrator approves it, then an authorized issuer releases it. Pending or
revoked certificates do not download. The server needs
`Certificates__DownloadCodeKeys__primary`; see the backend's
`FORM_CERTIFICATE_DOWNLOADS.md` for the migration, permissions and configuration.

Advanced/restricted forms, the redesigned builder, automatic certificate templates,
standalone batch generation, approval workflows and scoped church memberships are
implemented. See `../docs/DAYSPRING_OS_DELIVERY.md` for deployment order, verification
and remaining limits, including large exports and legacy-module tenancy.

Church Admin, Church Media and Superadmin can manage forms. Deploy the backend
permission migration before the new UI so existing roles receive their grants.
Run `npm run generate:api` against a development API (or set `DAYSPRING_OPENAPI_URL`)
to refresh `lib/api-contracts.d.ts` after API contract changes.

The sidebar groups the form library, certificates and church-wide certificate
approval settings under **Forms & certificates**. Forms publish without approval. Media retains its own library
and approvals. The form studio has Questions, Theme, Settings and Certificate tabs,
with question duplication/reordering, preview and unsaved-change warnings. Themes
support custom colors, background patterns and PNG/JPEG header images up to 300 KB.
Save persists the theme; publication remains an explicit action. The public form and
protected preview use the same themed surface. Library lists omit image bytes;
opening an editor fetches the complete current form definition.

## Creator-managed form workspaces

Each form opens at `/admin/forms/{id}` with Overview, Responses, Analysis,
Share & settings and Certificates tabs. Creators publish directly and share the
standalone `/forms/{id}` respondent page, which has no church-site navigation.
They can suspend/resume or stop collection, configure local-time start/end dates,
review answers and attendance, export results and enable/disable basic analysis.
Questions and section blocks support desktop/touch dragging and Move up/down;
respondents navigate sections with required validation and progress indicators.

For training forms, the creator can upload a background, position certificate
fields, map participant names, prepare eligible PDFs through the durable worker,
review and explicitly issue them. These permissions are restricted to the creator's
own form; no church-wide certificate issuance permission is granted to Media.
Respondents retrieve issued PDFs using their private codes. Standalone church-wide
certificate batches retain their own approval workflow.

Deploy the backend `CreatorFormWorkspaces` migration before this UI. It removes
obsolete form-publication approval flags and preserves historical requests as
superseded. See `../docs/FORMS_MANAGEMENT.md` for the complete operating guide.
