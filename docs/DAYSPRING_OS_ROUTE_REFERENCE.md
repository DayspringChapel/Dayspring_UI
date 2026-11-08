# Dayspring OS Route Reference

Generated from source on 4 November 2026. This is a route inventory, not an authorization bypass or a replacement for the API models. Parameter types, permissions and payloads remain defined in the named controllers. API v1 is shown for the current versioned routes.

## Frontend pages

| Address | Source |
| --- | --- |
| `/about` | `Dayspring_UI\app\about\page.js` |
| `/admin/account` | `Dayspring_UI\app\admin\(protected)\account\page.js` |
| `/admin/administrative-approvals` | `Dayspring_UI\app\admin\(protected)\administrative-approvals\page.js` |
| `/admin/appointments` | `Dayspring_UI\app\admin\(protected)\appointments\page.js` |
| `/admin/approvals` | `Dayspring_UI\app\admin\(protected)\approvals\page.js` |
| `/admin/audit` | `Dayspring_UI\app\admin\(protected)\audit\page.js` |
| `/admin/birthdays` | `Dayspring_UI\app\admin\(protected)\birthdays\page.js` |
| `/admin/calendar` | `Dayspring_UI\app\admin\(protected)\calendar\page.js` |
| `/admin/certificates/approvals` | `Dayspring_UI\app\admin\(protected)\certificates\approvals\page.js` |
| `/admin/certificates` | `Dayspring_UI\app\admin\(protected)\certificates\page.js` |
| `/admin/churches` | `Dayspring_UI\app\admin\(protected)\churches\page.js` |
| `/admin/comments` | `Dayspring_UI\app\admin\(protected)\comments\page.js` |
| `/admin/content` | `Dayspring_UI\app\admin\(protected)\content\page.js` |
| `/admin/dashboard` | `Dayspring_UI\app\admin\(protected)\dashboard\page.js` |
| `/admin/events` | `Dayspring_UI\app\admin\(protected)\events\page.js` |
| `/admin/forms/{id}/analytics` | `Dayspring_UI\app\admin\(protected)\forms\[id]\analytics\page.js` |
| `/admin/forms/{id}` | `Dayspring_UI\app\admin\(protected)\forms\[id]\page.js` |
| `/admin/forms/{id}/preview` | `Dayspring_UI\app\admin\(protected)\forms\[id]\preview\page.js` |
| `/admin/forms/approvals` | `Dayspring_UI\app\admin\(protected)\forms\approvals\page.js` |
| `/admin/forms` | `Dayspring_UI\app\admin\(protected)\forms\page.js` |
| `/admin/giving` | `Dayspring_UI\app\admin\(protected)\giving\page.js` |
| `/admin/media/create` | `Dayspring_UI\app\admin\(protected)\media\create\page.js` |
| `/admin/media/detail` | `Dayspring_UI\app\admin\(protected)\media\detail\page.js` |
| `/admin/media` | `Dayspring_UI\app\admin\(protected)\media\page.js` |
| `/admin/members` | `Dayspring_UI\app\admin\(protected)\members\page.js` |
| `/admin/operations` | `Dayspring_UI\app\admin\(protected)\operations\page.js` |
| `/admin/permissions` | `Dayspring_UI\app\admin\(protected)\permissions\page.js` |
| `/admin/publishing` | `Dayspring_UI\app\admin\(protected)\publishing\page.js` |
| `/admin/reports` | `Dayspring_UI\app\admin\(protected)\reports\page.js` |
| `/admin/requisitions` | `Dayspring_UI\app\admin\(protected)\requisitions\page.js` |
| `/admin/roles` | `Dayspring_UI\app\admin\(protected)\roles\page.js` |
| `/admin/settings` | `Dayspring_UI\app\admin\(protected)\settings\page.js` |
| `/admin/small-groups` | `Dayspring_UI\app\admin\(protected)\small-groups\page.js` |
| `/admin/units` | `Dayspring_UI\app\admin\(protected)\units\page.js` |
| `/admin/workflow` | `Dayspring_UI\app\admin\(protected)\workflow\page.js` |
| `/admin/workflow-configuration` | `Dayspring_UI\app\admin\(protected)\workflow-configuration\page.js` |
| `/admin/login` | `Dayspring_UI\app\admin\login\page.js` |
| `/admin` | `Dayspring_UI\app\admin\page.js` |
| `/appointment` | `Dayspring_UI\app\appointment\page.js` |
| `/certificates/download` | `Dayspring_UI\app\certificates\download\page.js` |
| `/certificates/verify/{token}` | `Dayspring_UI\app\certificates\verify\[token]\page.js` |
| `/content/event/{id}` | `Dayspring_UI\app\content\event\[id]\page.js` |
| `/content/sermon/{id}` | `Dayspring_UI\app\content\sermon\[id]\page.js` |
| `/donate` | `Dayspring_UI\app\donate\page.js` |
| `/events` | `Dayspring_UI\app\events\page.js` |
| `/forms/{id}` | `Dayspring_UI\app\forms\[id]\page.js` |
| `/forms` | `Dayspring_UI\app\forms\page.js` |
| `/gallery` | `Dayspring_UI\app\gallery\page.js` |
| `/library` | `Dayspring_UI\app\library\page.js` |
| `/` | `Dayspring_UI\app\page.js` |
| `/privacy` | `Dayspring_UI\app\privacy\page.js` |

## Backend controller routes

| Controller | Method | Route |
| --- | --- | --- |
| AlbumsController | POST | `/api/v1/Albums/create-album` |
| AlbumsController | GET | `/api/v1/Albums` |
| AlbumsController | GET | `/api/v1/Albums/{albumId}` |
| AlbumsController | DELETE | `/api/v1/Albums/{albumId}/delete` |
| AppelationsController | GET | `/api/v1/Appelations` |
| AppointmentsController | POST | `/api/v1/Appointments/schedule-appointment` |
| AppointmentsController | GET | `/api/v1/Appointments/get-all` |
| AppointmentsController | GET | `/api/v1/Appointments/get/{appointmentId}` |
| AppointmentsController | PATCH | `/api/v1/Appointments/cancel` |
| AppointmentsController | POST | `/api/v1/Appointments/confirm-appointment` |
| AppointmentsController | PATCH | `/api/v1/Appointments/{appointmentId}/venue` |
| AppointmentsController | GET | `/api/v1/Appointments/filter` |
| ApprovalsController | GET | `/api/v1/Approvals/{id:guid}` |
| ApprovalsController | GET | `/api/v1/Approvals/content/{contentId:guid}` |
| ApprovalsController | GET | `/api/v1/Approvals/queue/admin` |
| ApprovalsController | GET | `/api/v1/Approvals/queue/super-admin` |
| ApprovalsController | POST | `/api/v1/Approvals/approve` |
| ApprovalsController | POST | `/api/v1/Approvals/reject` |
| ApprovalsController | POST | `/api/v1/Approvals/comments` |
| ApprovalsController | GET | `/api/v1/Approvals/{contentId:guid}/comments` |
| AuditController | GET | `/api/v1/audit` |
| BioDataController | POST | `/api/v1/BioData/create-biodata` |
| BioDataController | GET | `/api/v1/BioData/all` |
| BioDataController | DELETE | `/api/v1/BioData/{id}/delete` |
| BioDataController | GET | `/api/v1/BioData/{id}` |
| BioDataController | GET | `/api/v1/BioData/{userid}/user` |
| BioDataController | PUT | `/api/v1/BioData/update-biodata` |
| BirthdaysController | GET | `/api/v1/Birthdays/all` |
| BirthdaysController | GET | `/api/v1/Birthdays` |
| BooksController | POST | `/api/v1/Books/create` |
| BooksController | GET | `/api/v1/Books` |
| BooksController | GET | `/api/v1/Books/{bookId}` |
| BooksController | PATCH | `/api/v1/Books/{bookId}/update` |
| BooksController | DELETE | `/api/v1/Books/{bookId}/delete` |
| BrowserSessionsController | POST | `/api/v1/Users/browser-session` |
| BrowserSessionsController | POST | `/api/v1/Users/browser-session/activity` |
| BrowserSessionsController | DELETE | `/api/v1/Users/browser-session` |
| CalendarYearsController | POST | `/api/v1/CalendarYears/add-calendar-year` |
| CalendarYearsController | GET | `/api/v1/CalendarYears` |
| CalendarYearsController | GET | `/api/v1/CalendarYears/{calendarYearId}/calendar-year` |
| CalendarYearsController | PATCH | `/api/v1/CalendarYears/{calendarYearId}/update` |
| CalendarYearsController | DELETE | `/api/v1/CalendarYears/{calendarYearId}/delete` |
| ChurchOfficialsController | GET | `/api/v1/ChurchOfficials` |
| ChurchOfficialsController | GET | `/api/v1/ChurchOfficials/{userId}/get-church-official` |
| ChurchOfficialsController | GET | `/api/v1/ChurchOfficials/church-offical` |
| ChurchOfficialsController | POST | `/api/v1/ChurchOfficials/create` |
| ChurchProgramsController | POST | `/api/v1/ChurchPrograms/add-program` |
| ChurchProgramsController | GET | `/api/v1/ChurchPrograms` |
| ChurchProgramsController | GET | `/api/v1/ChurchPrograms/{churchProgramId}/program` |
| ChurchProgramsController | PATCH | `/api/v1/ChurchPrograms/{churchProgramId}/update` |
| ChurchProgramsController | DELETE | `/api/v1/ChurchPrograms/{churchProgramId}/delete` |
| CommentsController | GET | `/api/v1/Comments` |
| CommentsController | POST | `/api/v1/Comments` |
| CommentsController | GET | `/api/v1/Comments/moderation` |
| CommentsController | GET | `/api/v1/Comments/moderation/counts` |
| CommentsController | PUT | `/api/v1/Comments/{id:guid}/status` |
| CommentsController | DELETE | `/api/v1/Comments/{id:guid}` |
| ContentPersonnelController | POST | `/api/v1/ContentPersonnel/assign` |
| ContentPersonnelController | GET | `/api/v1/ContentPersonnel/{contentId:guid}` |
| ContentPersonnelController | GET | `/api/v1/ContentPersonnel/{contentId:guid}/role/{role}` |
| ContentPersonnelController | GET | `/api/v1/ContentPersonnel/my-assignments` |
| ContentPersonnelController | PUT | `/api/v1/ContentPersonnel/{id:guid}/update` |
| ContentPersonnelController | DELETE | `/api/v1/ContentPersonnel/{id:guid}/remove` |
| EventsController | POST | `/api/v1/Events/purge-expired` |
| EventsController | POST | `/api/v1/Events/add-event` |
| EventsController | GET | `/api/v1/Events` |
| EventsController | GET | `/api/v1/Events/all` |
| EventsController | GET | `/api/v1/Events/{eventId}/event` |
| EventsController | PATCH | `/api/v1/Events/{eventId}/update` |
| EventsController | PATCH | `/api/v1/Events/{eventId}/publish` |
| EventsController | DELETE | `/api/v1/Events/{eventId}/delete` |
| FormCertificatesController | POST | `/api/v1/certificates/retrieve` |
| FormCertificatesController | GET | `/api/v1/certificates/{id:guid}/preview` |
| FormCertificatesController | POST | `/api/v1/certificates/{id:guid}/approve` |
| FormCertificatesController | POST | `/api/v1/certificates/{id:guid}/issue` |
| FormCertificatesController | POST | `/api/v1/certificates/{id:guid}/revoke` |
| FormsController | GET | `/api/v1/forms/listed` |
| FormsController | GET | `/api/v1/forms/{id:guid}/preview` |
| FormsController | GET | `/api/v1/forms/{id:guid}/stats` |
| FormsController | POST | `/api/v1/forms/{id:guid}/submit-for-approval` |
| FormsController | POST | `/api/v1/forms/{id:guid}/archive` |
| FormsController | GET | `/api/v1/forms/{id:guid}/analytics` |
| FormsController | GET | `/api/v1/forms/{id:guid}/export` |
| FormsController | GET | `/api/v1/forms/{id:guid}/qr` |
| FormsController | POST | `/api/v1/forms/{id:guid}/submissions/{submissionId:guid}/review` |
| FormsController | POST | `/api/v1/forms/{id:guid}/uploads` |
| FormsController | GET | `/api/v1/forms/{id:guid}/submissions/{submissionId:guid}/uploads/{fileId:guid}` |
| FormsController | GET | `/api/v1/forms` |
| FormsController | GET | `/api/v1/forms/{id:guid}` |
| FormsController | POST | `/api/v1/forms` |
| FormsController | PUT | `/api/v1/forms/{id:guid}` |
| FormsController | POST | `/api/v1/forms/{id:guid}/publication` |
| FormsController | PUT | `/api/v1/forms/{id:guid}/collection` |
| FormsController | POST | `/api/v1/forms/{id:guid}/submissions` |
| FormsController | GET | `/api/v1/forms/{id:guid}/submissions` |
| FormsController | POST | `/api/v1/forms/{id:guid}/submissions/{submissionId:guid}/certificate` |
| GivingsController | POST | `/api/v1/Givings/give` |
| GivingsController | GET | `/api/v1/Givings` |
| GivingsController | GET | `/api/v1/Givings/{givingId}/giving` |
| GivingsController | GET | `/api/v1/Givings/giving/give/{purpose}` |
| GivingsController | PUT | `/api/v1/Givings/{givingId}/update-giving` |
| GivingsController | DELETE | `/api/v1/Givings/{givingId}/delete-giving` |
| ImagesController | POST | `/api/v1/Images/upload` |
| ImagesController | POST | `/api/v1/Images/uploads` |
| ImagesController | GET | `/api/v1/Images/get-all` |
| ImagesController | GET | `/api/v1/Images/{id}/image` |
| ImagesController | DELETE | `/api/v1/Images/{id}/delete` |
| ImagesController | POST | `/api/v1/Images/delete-multiple` |
| ImagesController | PATCH | `/api/v1/Images/{imageId}/update` |
| ImportController | GET | `/api/v1/Import/{kind}/template` |
| ImportController | POST | `/api/v1/Import/units` |
| ImportController | POST | `/api/v1/Import/small-groups` |
| ImportController | POST | `/api/v1/Import/members` |
| ImportController | POST | `/api/v1/Import/children` |
| MediaContentController | POST | `/api/v1/MediaContent/upload` |
| MediaContentController | POST | `/api/v1/MediaContent/uploads` |
| MediaContentController | POST | `/api/v1/MediaContent/memory-shorts/uploads` |
| MediaContentController | GET | `/api/v1/MediaContent` |
| MediaContentController | GET | `/api/v1/MediaContent/memory-shorts` |
| MediaContentController | GET | `/api/v1/MediaContent/{id:guid}` |
| MediaContentController | GET | `/api/v1/MediaContent/owner/{ownerId:guid}` |
| MediaContentController | GET | `/api/v1/MediaContent/status/{status}` |
| MediaContentController | PATCH | `/api/v1/MediaContent/{id:guid}/update` |
| MediaContentController | DELETE | `/api/v1/MediaContent/{id:guid}/delete` |
| MediaContentController | DELETE | `/api/v1/MediaContent/memory-shorts/{id:guid}` |
| MemberController | POST | `/api/v1/Member/create` |
| MemberController | POST | `/api/v1/Member/Add-Children` |
| MemberController | GET | `/api/v1/Member/get-by-user/{userId}` |
| MemberController | GET | `/api/v1/Member/{id}` |
| MemberController | GET | `/api/v1/Member` |
| MemberController | GET | `/api/v1/Member/by-unit/{unitId:guid}` |
| MemberController | POST | `/api/v1/Member/create-with-user` |
| MemberController | PATCH | `/api/v1/Member/{memberId:guid}/assign` |
| MemberController | PATCH | `/api/v1/Member/{memberId:guid}/content-role` |
| MemberController | DELETE | `/api/v1/Member/{memberId:guid}/content-role` |
| NewslettersController | POST | `/api/v1/Newsletters/subscribe` |
| NewslettersController | GET | `/api/v1/Newsletters` |
| NewslettersController | DELETE | `/api/v1/Newsletters/{newsletterId:guid}` |
| OccupationController | GET | `/api/v1/Occupation` |
| PublishingController | POST | `/api/v1/Publishing/publish-to-destination` |
| PublishingController | POST | `/api/v1/Publishing/schedule` |
| PublishingController | GET | `/api/v1/Publishing/scheduled` |
| PublishingController | GET | `/api/v1/Publishing/scheduled/content/{contentId:guid}` |
| PublishingController | DELETE | `/api/v1/Publishing/scheduled/{scheduledPostId:guid}/cancel` |
| PublishingController | POST | `/api/v1/Publishing/publish-now` |
| PublishingController | GET | `/api/v1/Publishing/published` |
| PublishingController | GET | `/api/v1/Publishing/published/content/{contentId:guid}` |
| PublishingController | POST | `/api/v1/Publishing/retry` |
| ReportsController | GET | `/api/v1/Reports/summary` |
| ReportsController | POST | `/api/v1/Reports/sync` |
| RequisitionsController | PATCH | `/api/v1/Requisitions/{id}/approve` |
| RequisitionsController | POST | `/api/v1/Requisitions/create-requisition` |
| RequisitionsController | GET | `/api/v1/Requisitions/{id}/requisition` |
| RequisitionsController | GET | `/api/v1/Requisitions/requisition` |
| RequisitionsController | GET | `/api/v1/Requisitions/requisition/requisition-reference` |
| RequisitionsController | GET | `/api/v1/Requisitions/requisition/filter` |
| RequisitionsController | PUT | `/api/v1/Requisitions/{id}/requisition` |
| RolesController | GET | `/api/v1/Roles/permissions` |
| RolesController | GET | `/api/v1/Roles/manage` |
| RolesController | POST | `/api/v1/Roles/create` |
| RolesController | PUT | `/api/v1/Roles/{roleId:guid}/update` |
| RolesController | DELETE | `/api/v1/Roles/{roleId:guid}/delete` |
| RolesController | GET | `/api/v1/Roles/get-all` |
| RolesController | GET | `/api/v1/Roles/{roleId}/get` |
| RolesController | POST | `/api/v1/Roles/assign-role` |
| RolesController | POST | `/api/v1/Roles/{userId:guid}/remove-role` |
| RolesController | GET | `/api/v1/Roles/role-exists` |
| SeriesController | POST | `/api/v1/Series/create` |
| SeriesController | PUT | `/api/v1/Series/{id}/update` |
| SeriesController | DELETE | `/api/v1/Series/{id}/delete` |
| SeriesController | GET | `/api/v1/Series/{id}` |
| SeriesController | GET | `/api/v1/Series` |
| SeriesController | GET | `/api/v1/Series/series` |
| SermonsController | POST | `/api/v1/Sermons/create` |
| SermonsController | PUT | `/api/v1/Sermons/{sermonId}/update` |
| SermonsController | DELETE | `/api/v1/Sermons/{sermonId}/delete` |
| SermonsController | GET | `/api/v1/Sermons/{sermonId}/sermon` |
| SermonsController | GET | `/api/v1/Sermons/{preacherName}` |
| SermonsController | GET | `/api/v1/Sermons` |
| SiteSettingsController | POST | `/api/v1/site-settings/livestream/youtube/start` |
| SiteSettingsController | POST | `/api/v1/site-settings/livestream/youtube/stop` |
| SiteSettingsController | GET | `/api/v1/site-settings/livestream` |
| SiteSettingsController | PUT | `/api/v1/site-settings/livestream` |
| SiteSettingsController | GET | `/api/v1/site-settings/chatbot` |
| SiteSettingsController | PUT | `/api/v1/site-settings/chatbot` |
| SiteSettingsController | GET | `/api/v1/site-settings/hero` |
| SiteSettingsController | PUT | `/api/v1/site-settings/hero` |
| SiteSettingsController | PUT | `/api/v1/site-settings/hero/reset` |
| SmallGroupsController | POST | `/api/v1/SmallGroups/create` |
| SmallGroupsController | GET | `/api/v1/SmallGroups/all` |
| SmallGroupsController | GET | `/api/v1/SmallGroups/{groupId:guid}` |
| SmallGroupsController | GET | `/api/v1/SmallGroups/name/{groupName}` |
| SmallGroupsController | PUT | `/api/v1/SmallGroups/update/{groupId:guid}` |
| SmallGroupsController | PATCH | `/api/v1/SmallGroups/assign-leader/{memberId:guid}` |
| SmallGroupsController | DELETE | `/api/v1/SmallGroups/{groupId:guid}` |
| UnitsController | POST | `/api/v1/Units/create` |
| UnitsController | GET | `/api/v1/Units/{unitId:guid}` |
| UnitsController | GET | `/api/v1/Units/{unitId:guid}/unit` |
| UnitsController | GET | `/api/v1/Units/name/{name}` |
| UnitsController | GET | `/api/v1/Units` |
| UnitsController | GET | `/api/v1/Units/all` |
| UnitsController | PUT | `/api/v1/Units/{unitId:guid}` |
| UnitsController | PUT | `/api/v1/Units/{unitId:guid}/update` |
| UnitsController | DELETE | `/api/v1/Units/{unitId:guid}` |
| UsersController | POST | `/api/v1/Users/register` |
| UsersController | POST | `/api/v1/Users/login` |
| UsersController | GET | `/api/v1/Users/{email}` |
| UsersController | GET | `/api/v1/Users/get-all` |
| UsersController | PUT | `/api/v1/Users/{userId}/change-password` |
| UsersController | GET | `/api/v1/Users/user-exists` |
| UsersController | GET | `/api/v1/Users/get-user` |
| UsersController | POST | `/api/v1/Users/refresh-token` |
| UsersController | POST | `/api/v1/Users/revoke-token` |
| UsersController | GET | `/api/v1/Users/me` |
| UsersController | GET | `/api/v1/Users/has-permission` |
| WorkflowController | GET | `/api/v1/Workflow/{contentId:guid}` |
| WorkflowController | GET | `/api/v1/Workflow/{contentId:guid}/history` |
| WorkflowController | POST | `/api/v1/Workflow/submit` |
| WorkflowController | POST | `/api/v1/Workflow/send-back` |
| WorkflowController | POST | `/api/v1/Workflow/forward-for-approval` |

## Browser session and server routes

Public website requests use the Next.js host. Browser session credentials stay in HttpOnly cookies. Server route handlers forward the session only to the fixed backend.

| Route | Purpose |
| --- | --- |
| `/api/auth/session` | Read the session, sign in, or sign out |
| `/api/auth/session/activity` | Record genuine activity for idle expiry |
| `/api/backend/api/v1/...` | Same-origin authenticated backend proxy |
| `/api/livestream` | Public stream settings and protected updates |
| `/api/chatbot-config` | Public chatbot information and protected update |
| `/api/chat` | Public chatbot response |
| `/api/announce` | Authorized social announcement |

Do not send arbitrary bearer tokens from browser storage. Protect writes with the exact trusted origin and let the API enforce each capability.
