# Admin Dashboard Implementation Plan

## Overview

This plan outlines the implementation of a fully functional admin dashboard for Dayspring Chapel that enables:
1. Dynamic content management for all public pages
2. Appointment management
3. Requisition management  
4. Birthday management

---

## Current State Analysis

### ✅ Already Implemented

**API Client (`lib/apiClient.js`)**
- Authentication (login/logout)
- Books management (CRUD)
- Events management (CRUD)
- Sermons management (CRUD)
- Series management (CRUD)
- Images/Albums management (CRUD)
- Requisitions (get, approve)
- Givings (get, delete)
- BioData/Members (CRUD)
- Appointments (get, confirm, cancel)

**Admin Panels**
- `EventsPanel.js` - Events management
- `SermonsPanel.js` - Sermons management
- `BooksPanel.js` - Books management
- `AlbumsPanel.js` - Photo albums management
- `MembersPanel.js` - Member profiles management
- `AppointmentsPanel.js` - View appointments
- `RequisitionsPanel.js` - View/approve requisitions

**Admin Pages**
- `/admin/login` - Authentication
- `/admin/dashboard` - Overview with stats
- `/admin/content` - Content management hub
- `/admin/appointments` - Appointments list
- `/admin/requisitions` - Requisitions list
- `/admin/members` - Members management

---

## Required Features

### 1. Dynamic Content Management ✅ (Mostly Complete)

**Status**: 80% complete - API integration exists, frontend display needs updates

**What Works**:
- Admin can create/edit/delete: Events, Sermons, Books, Albums
- Content is stored in backend database
- API endpoints are functional

**What's Needed**:
- Update public-facing pages to fetch from API instead of using mock data
- Add image upload functionality for albums
- Implement sermon audio/video upload

**Public Pages to Update**:
- `/events` - Fetch from `apiClient.getEvents()`
- `/library` - Fetch books from `apiClient.getBooks()`
- `/sermons` - Fetch from `apiClient.getSermons()` and `apiClient.getSeries()`
- `/gallery` - Fetch albums from `apiClient.getAlbums()`

---

### 2. Appointment Management ⚠️ (Partially Complete)

**Status**: 60% complete - Can view and confirm/cancel, missing features

**What Works**:
- Public appointment form submits to backend
- Admin can view all appointments
- Admin can confirm or cancel appointments

**What's Needed**:
- **Email notifications** when appointments are confirmed/cancelled
- **Calendar view** for better visualization
- **Filtering** by status (pending/confirmed/cancelled)
- **Search** by name or date
- **Notes/comments** field for admin to add context
- **Appointment details modal** with full information

**API Methods Available**:
```javascript
apiClient.getAppointments()
apiClient.confirmAppointment(id)
apiClient.cancelAppointment(id)
```

**Missing API Methods**:
- `updateAppointment(id, data)` - For adding notes
- `sendAppointmentNotification(id)` - For email alerts

---

### 3. Requisition Management ⚠️ (Partially Complete)

**Status**: 50% complete - Can view and approve, missing workflow features

**What Works**:
- Public requisition form submits to backend
- Admin can view all requisitions
- Admin can approve requisitions

**What's Needed**:
- **Rejection workflow** (currently only approve exists)
- **Status tracking** (pending → approved → processed → completed)
- **Comments/feedback** when rejecting
- **Filtering** by status and date
- **Export to PDF/Excel** for record keeping
- **Notification system** for requester

**API Methods Available**:
```javascript
apiClient.getRequisitions()
apiClient.approveRequisition(id)
apiClient.createRequisition(data)
```

**Missing API Methods**:
- `rejectRequisition(id, reason)` - For denying requests
- `updateRequisitionStatus(id, status)` - For status changes
- `addRequisitionComment(id, comment)` - For feedback

---

### 4. Birthday Management ❌ (Not Implemented)

**Status**: 0% complete - Needs full implementation

**What's Needed**:
- **Birthday calendar view** showing upcoming birthdays
- **Birthday alerts** for members' birthdays this week/month
- **Automatic birthday wishes** (optional email/SMS)
- **Birthday list export** for planning celebrations
- **Integration with Members panel** (birthdays stored in BioData)

**Data Source**:
- Member birthdays are stored in `BioData` table
- Need to extract and display from `apiClient.getBioData()`

**Features to Build**:
1. Dashboard widget showing upcoming birthdays (next 7 days)
2. Full birthday calendar page (`/admin/birthdays`)
3. Filter by month/week
4. Send birthday greetings functionality
5. Birthday statistics (birthdays this month count)

**API Methods Needed**:
- `getUpcomingBirthdays(days)` - Get birthdays in next N days
- `getBirthdaysByMonth(month)` - Get all birthdays for a month
- `sendBirthdayGreeting(memberId)` - Send automated message

---

## Implementation Phases

### Phase 1: Complete Content Management (1-2 days)

**Priority**: HIGH

**Tasks**:
- [ ] Update `/events` page to fetch from API
- [ ] Update `/library` page to fetch books from API
- [ ] Update `/sermons` page to fetch from API
- [ ] Update `/gallery` page to fetch albums from API
- [ ] Add loading states and error handling
- [ ] Implement image upload for albums (if not done)
- [ ] Test end-to-end content creation → display flow

**Files to Modify**:
- `app/events/page.js`
- `app/library/page.js`
- `app/sermons/page.js`
- `app/gallery/page.js`
- `components/sections/*` (various content components)

---

### Phase 2: Enhance Appointment Management (2-3 days)

**Priority**: HIGH

**Tasks**:
- [ ] Add appointment details modal
- [ ] Implement filtering (status, date range)
- [ ] Add search functionality
- [ ] Create calendar view component
- [ ] Add notes/comments field to appointments
- [ ] Implement email notifications (backend + frontend trigger)
- [ ] Add appointment statistics to dashboard

**Files to Create/Modify**:
- `components/admin/panels/AppointmentsPanel.js` (enhance)
- `components/admin/AppointmentModal.js` (new)
- `components/admin/AppointmentCalendar.js` (new)
- `lib/apiClient.js` (add new methods)

**Backend Requirements**:
- Email service integration (SendGrid, AWS SES, etc.)
- Update appointment endpoint to support notes

---

### Phase 3: Enhance Requisition Management (2-3 days)

**Priority**: MEDIUM

**Tasks**:
- [ ] Add rejection workflow with reason
- [ ] Implement status tracking system
- [ ] Add comments/feedback feature
- [ ] Create filtering by status and date
- [ ] Add export to PDF functionality
- [ ] Implement notification system
- [ ] Add requisition statistics to dashboard

**Files to Create/Modify**:
- `components/admin/panels/RequisitionsPanel.js` (enhance)
- `components/admin/RequisitionModal.js` (new)
- `lib/apiClient.js` (add new methods)
- `lib/pdfExport.js` (new - for PDF generation)

**Backend Requirements**:
- Add reject endpoint
- Add status update endpoint
- Add comments endpoint
- Email notification service

---

### Phase 4: Implement Birthday Management (2-3 days)

**Priority**: MEDIUM

**Tasks**:
- [ ] Create birthday dashboard widget
- [ ] Build birthday calendar page
- [ ] Implement upcoming birthdays list
- [ ] Add birthday filtering (month/week)
- [ ] Create birthday greeting system
- [ ] Add birthday statistics
- [ ] Integrate with members panel

**Files to Create**:
- `app/admin/birthdays/page.js` (new)
- `components/admin/panels/BirthdaysPanel.js` (new)
- `components/admin/BirthdayCalendar.js` (new)
- `components/admin/BirthdayWidget.js` (new - for dashboard)
- `lib/birthdayUtils.js` (new - helper functions)

**Backend Requirements**:
- Add birthday-specific endpoints
- Birthday greeting email template
- Birthday data extraction from BioData

---

## Technical Considerations

### Frontend Updates Needed

1. **Public Pages Data Fetching**
   - Replace mock data with API calls
   - Add loading skeletons
   - Implement error boundaries
   - Add retry logic for failed requests

2. **File Upload System**
   - Image uploads for albums
   - Audio/video uploads for sermons
   - Document uploads for requisitions
   - Use FormData for multipart uploads

3. **Notification System**
   - Toast notifications for admin actions
   - Email notifications for users
   - In-app notification center (future)

4. **Calendar Components**
   - Reusable calendar component
   - Date range picker
   - Event/birthday markers

### Backend Requirements

1. **New API Endpoints**
   ```
   POST /api/Appointment/add-note
   POST /api/Appointment/send-notification
   POST /api/Requisition/reject
   PUT /api/Requisition/status
   POST /api/Requisition/comment
   GET /api/BioData/upcoming-birthdays
   GET /api/BioData/birthdays-by-month
   POST /api/BioData/send-birthday-greeting
   ```

2. **Email Service Integration**
   - Configure email provider (SendGrid/AWS SES)
   - Create email templates
   - Set up SMTP credentials

3. **File Storage**
   - Configure cloud storage (AWS S3, Cloudinary, etc.)
   - Set up upload endpoints
   - Implement file validation

---

## Success Metrics

### Content Management
- ✅ Admin can create content that appears on public pages within 1 minute
- ✅ No manual code deployment needed for content updates
- ✅ Images and media display correctly

### Appointment Management
- ✅ Appointments can be confirmed/cancelled with email notification
- ✅ Admin can view appointments in calendar format
- ✅ Search and filter reduce time to find appointments by 80%

### Requisition Management
- ✅ Requisitions can be approved or rejected with feedback
- ✅ Status tracking provides clear workflow visibility
- ✅ Export feature enables offline record keeping

### Birthday Management
- ✅ Upcoming birthdays visible on dashboard
- ✅ Birthday greetings can be sent with one click
- ✅ No birthdays are missed

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend API changes | High | Document all API contracts, version endpoints |
| Email delivery failures | Medium | Implement retry logic, log all attempts |
| Large file uploads | Medium | Add file size limits, use chunked uploads |
| Performance with large datasets | Medium | Implement pagination, lazy loading |
| Authentication token expiry | High | Auto-refresh tokens, handle 401 gracefully |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business needs
3. **Confirm backend API availability** for missing endpoints
4. **Start with Phase 1** (Content Management) as it has highest ROI
5. **Iterate and gather feedback** after each phase

---

## Estimated Timeline

- **Phase 1**: 1-2 days
- **Phase 2**: 2-3 days  
- **Phase 3**: 2-3 days
- **Phase 4**: 2-3 days

**Total**: 7-11 days of development work

**Note**: Timeline assumes backend endpoints are available or can be created in parallel.
