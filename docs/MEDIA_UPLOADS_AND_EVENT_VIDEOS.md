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

## Optional event video attachments

Open **Events & programs → Event videos** on any active program, whether draft, pending approval or published. Each event holds its own optional collection of up to 20 videos. Choose a title and purpose (Highlight, Trailer or Promotional), then:

1. Attach a YouTube link directly to the event.
2. Tag an existing video you can access from the media library, including videos used by another event. The original media record, category and workflow stay unchanged.
3. Upload a new video directly to the event. This does not create a normal MediaContent item or a separate media approval job.

Videos stay with the event through draft, review and publication. Adding/removing videos on a program already in review or published revises the parent event and resubmits its existing flyer for review. A draft stays a draft. Superadmin changes do not require approval. The public event page shows the event's collection when the parent event is published. Normal video uploads continue to work independently.

Remove a video using **Remove from event**. Tagging or untagging never deletes the original library item. Removing the original library entry preserves an asset still held by an event. Archived events remain read-only.

Apply the additional main-context migration `20261111132046_EventVideoAttachments`. It preserves legacy featured event videos as attachments. No reporting migration is needed.

## Cloudinary signature correction

The direct-upload signer must pass parameters to the .NET SDK in ordinal alphabetical order. An ordinary insertion-ordered dictionary produces an invalid signature for these requests. The fixed code signs a SortedDictionary; regression tests independently hash Cloudinary's canonical string. A provider 401 also invalidates the cached upload authorization so retrying gets a fresh grant.

Deploy the corrected API, then the corrected UI. Refresh the upload page and select the file again after deployment. Keep all existing account credentials; no key rotation or secret overwrite is required by this fix. If the live browser still sends binary video data to `/api/backend/...`, its deployed frontend is outdated. The updated client uploads the binary to Cloudinary and sends only receipts to this proxy; it also blocks oversized proxy requests before fetch.

## Verification

Local browser checks use a valid synthetic 10.6 MB video with mocked Cloudinary, covering chunk transfer, progress, storage failure, metadata retry, hero uploads, event editing and the three optional video sources. Backend integration checks use a disposable PostgreSQL database. These checks do not upload to a real Cloudinary account; after deployment, verify one small real upload with the existing configured account.

Provider references: [Vercel function limits](https://vercel.com/docs/functions/limitations), [Cloudinary upload API](https://cloudinary.com/documentation/upload_images).
