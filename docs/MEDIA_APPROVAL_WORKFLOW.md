# Media approval and readable text

Completed media uploads, including YouTube sermon links, now enter review automatically. **Upload & submit** sends the item to the next stage; **Save as draft** keeps it private for later editing. The same server policy handles single uploads, batch uploads and uploaded-video references. Event flyers still link the program before submission. Existing drafts remain drafts and can be submitted from Media → Workflow; deployment does not submit unfinished work on someone else's behalf.

Default routing:

```mermaid
flowchart LR
    Creator[Content / graphics / social personnel] --> Media[Church Media review]
    Media --> Admin[Church Admin approval]
    Admin --> Root[Superadmin final approval]
    Root --> Ready[Ready to publish]
    Ready --> Publish[Website or selected socials]
    Media -->|Return with comments| Corrections[Creator makes corrections]
    Admin -->|Return with comments| Corrections
    Root -->|Return with comments| Corrections
    Corrections -->|Resubmit| RequestingStage[Stage that requested corrections]
```

Submissions begin above the uploader's own level: Church Media submits to Church Admin; Church Admin submits to Superadmin. Superadmin uploads can become ready immediately and Superadmin may override any pending stage. Approval and publishing remain separate operations. Changing the upload source to a YouTube URL does not bypass review.

Church Admin and Superadmin can change **Media → Workflow → Media approval policy**. Approval is enabled by default. Disabling it makes subsequent submissions/forwarding ready to publish. It does not publish them automatically or silently move pending items. This exception is read from stored server settings; an uploader cannot grant an exemption through an upload parameter. Existing social connection secrets are untouched.

Queues come from media workflow status, rather than from approval-decision rows. Superadmin's queue includes earlier pending stages that Superadmin may override. Church Admin's queue contains AdminApproval items. Decisions and returns remove items from the previous queue. The dashboard and sidebar refresh on focus, every 30 seconds while visible, and after in-app workflow mutations. Both standard and configured dashboards show the pending media count to authorised approvers. The separate administrative card is labelled **Pending certificate approvals** to avoid confusing it with media review.

Text changes strengthen public-page colours, captions, sidebar labels, dashboard notes and badges. Primary buttons use darker fills where white text needs more contrast. Text over homepage video and gallery photos has a stronger backdrop. Form-button text is selected using the actual accent-colour contrast and meets at least 4.5:1, including middle-tone custom colours. Small form/builder labels were increased to 12 pixels; this affects the website and PWA through shared styles, without changing certificate document typography.

## Deployment and verification

Deploy both applications. Apply main-context migration **20261119080345_MediaApprovalPolicy**; existing installations receive `MediaApprovalRequired=true`. There is no reporting-context migration.

In Visual Studio's backend Package Manager Console:

```powershell
Update-Database -Context DayspringDbContext
```

Backend tests cover automatic YouTube routing for each role, actual queue visibility, explicit drafts, stored exceptions, final approval, returns/resubmission and event-flyer transactions. Frontend tests cover form-accent contrast. The local browser fixture checks standard/configured dashboards, refreshed counts, protected setting controls, mobile standalone layout and the actual YouTube upload form. It uses synthetic accounts and does not make production approvals.
