# Media uploads and event videos

## Deploying this change

Deploy the API first, then the UI. Apply the two main-database migrations:

- `20261111102019_DirectCloudinaryUploads`
- `20261111110243_EventVideoPurpose`

With startup migration enabled, deployment applies them automatically. In Visual Studio Package Manager Console, use `Update-Database -Context DayspringDbContext`. No reporting-database migration is required.

Keep the existing Cloudinary settings and all social-media environment secrets. This change does not alter, seed or overwrite them. No new provider secret is required.

## Uploading a video

Media, Memory/Shorts, homepage hero, sermons and program flyers now upload supported files directly from the browser to Cloudinary using short-lived signed authorization. Only a small, authenticated metadata request passes through Vercel. Videos/audio use 6 MiB chunks. Existing size limits remain: video 100 MiB, audio 25 MiB, images 10 MiB; the Cloudinary account must also permit the selected file size.

A progress card shows preparation, transfer, verification and saving. Keep the page open. If saving fails, correct the form and retry: the same uploaded asset is reused. Private form files and certificates retain their existing protected upload paths.

The server verifies the stored file with Cloudinary, checks the current user's permissions and destination, then saves the record and consumes its receipt in one transaction. A repeated identical finalization returns its saved result. Unfinished receipts expire after 45 minutes; select the file again if asked. Abandoned assets are removed after a 24-hour grace period by the background worker. Completed receipt metadata is removed after seven days without deleting saved assets. Run the worker/combined service for cleanup.

## Editing events

Open **Events & programs**, find a program and select **Edit details**. Drafts, pending approvals and published programs can be edited with the existing event-management permission. Archived events remain read-only.

For ordinary roles, edits remove the program from the public listing until the new details are approved and published. The latest linked flyer and video are resubmitted automatically using their existing files. Their workflow histories retain the previous actions. Earlier revisions cannot be published accidentally. Superadmin edits do not require approval and keep already-published programs live. If another editor saved first, refresh before retrying.

## Optional video

Save a program, then select **Add / manage video**. Choose **Highlight**, **Trailer** or **Promotional video**, then select a source:

1. A YouTube video link.
2. An existing event-video item from the Cloudinary media library that your account can access.
3. A new MP4, WebM or MOV upload, up to 100 MiB.

Save and tag the video. Upload/tagging requires content-upload and submission permissions. Library reuse is restricted to the owner or media reviewers/full-access personnel; a video already tagged to another event cannot be retagged to a different event. Library items use the **Event highlight video** media category.

Tagging submits the video through the normal role hierarchy. Superadmin's video is ready to publish immediately. Select its workflow link to track review or corrections, then publish the approved video through **Media → Publishing**. The linked event is selected automatically by the API. Tagging is optional and does not publish unapproved event details.

Publishing a replacement video changes the single featured video for that event. The public event page includes a playable video section labelled with its purpose. The website retains the existing listing rule: published flyer events from today through the next two calendar months.

## Verification

Local browser checks use a valid synthetic 10.6 MB video with mocked Cloudinary, covering chunk transfer, progress, storage failure, metadata retry, hero uploads, event editing and the three optional video sources. Backend integration checks use a disposable PostgreSQL database. These checks do not upload to a real Cloudinary account; after deployment, verify one small real upload with the existing configured account.

Provider references: [Vercel function limits](https://vercel.com/docs/functions/limitations), [Cloudinary upload API](https://cloudinary.com/documentation/upload_images).
