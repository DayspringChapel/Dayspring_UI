// Guided-tour steps for each admin page. `selector` steps spotlight an element (skipped
// automatically if it isn't on screen); `centered` steps are plain tips. The dashboards have
// their own tour (lib/tourSteps.js), so they're not listed here.

const HEADING = 'main h1, main h2';

const intro = (title, content) => ({ id: 'intro', centered: true, title, content });
const heading = (title, content) => ({ id: 'heading', selector: HEADING, title, content });
const table = (title, content) => ({ id: 'table', selector: 'main table', title, content });
const filters = (title, content) => ({ id: 'filters', selector: 'main select, main input', title, content });
const tip = (title, content) => ({ id: 'tip', centered: true, title, content });

export const PAGE_GUIDES = {
    '/admin/appointments': [
        intro('Appointments', 'Review pastoral appointment requests from the public form, confirm a date and venue, or cancel with a reason.'),
        filters('Search & filter', 'Narrow the list by name, status or date to find a request quickly.'),
        table('Request list', 'Each row is one request. Open a row to confirm it (pick a date and venue) or cancel it.'),
        tip('Tip', 'The badge next to Appointments in the menu shows how many requests are still waiting for you.'),
    ],
    '/admin/approvals': [
        intro('Approval Queue', 'Content submitted for review waits here. Admins review first, then Super Admins give the final approval before anything can be published.'),
        heading('Your queue', 'Each card is a piece of content waiting on you. Open it to preview the media and read earlier comments.'),
        tip('Approve or send back', 'Approve to move it forward, or send it back with a clear comment so the Media team knows exactly what to fix.'),
    ],
    '/admin/birthdays': [
        intro('Birthday Calendar', 'See who is celebrating a birthday this month and browse other months. Visible to every signed-in user.'),
        heading('Month view', 'Use the month controls to move between months. Names and dates only; private details stay hidden.'),
        tip('Tip', 'The Birthdays menu badge counts birthdays happening today.'),
    ],
    '/admin/calendar': [
        intro('Church Calendar', 'All church programs and events in one place, laid out by month.'),
        heading('Calendar', 'Click a day or an event to see its details. Events are managed from the Content page.'),
    ],
    '/admin/content': [
        intro('Website Content', 'Manage what appears on the public website: events, sermons, books, albums, calendar years and church programs.'),
        heading('Pick a section', 'Switch tabs to manage a different kind of content. Each tab lets you add, edit, publish or remove items.'),
        tip('Tip', 'Past events are archived automatically after a retention period, while their reporting numbers are kept permanently.'),
    ],
    '/admin/giving': [
        intro('Giving Accounts', 'Manage the bank accounts shown on the public Giving page so members know where to send offerings and tithes.'),
        filters('Search', 'Find an account by name, purpose or bank.'),
        table('Accounts', 'Edit or remove an account from its row. Only accounts you keep here appear on the website.'),
        tip('Double-check details', 'Account numbers are shown publicly, so verify them before saving.'),
    ],
    '/admin/media': [
        intro('Media Content', 'Upload and track images, videos and sermons. Everything starts as a Draft and moves through review before publishing.'),
        heading('Your uploads', 'Open an item to edit it, submit it for review, or follow its progress.'),
        tip('Flow', 'Draft, Submitted, In Review, Approved, Published. Use Workflow to see where each item is.'),
    ],
    '/admin/members': [
        intro('Members', 'The church directory. Add members individually or import many at once from a CSV file.'),
        heading('Directory', 'Search, add, edit or remove members here. Units and small groups can be assigned to each member.'),
        tip('Bulk import', 'Use the import control to upload a CSV. Download the template first so your columns match exactly.'),
    ],
    '/admin/permissions': [
        intro('Roles & Permissions', 'Super Admin only. Create custom roles and choose exactly what each role is allowed to do.'),
        heading('Roles', 'Pick a role to see its permissions. System roles are protected; custom roles can be edited or removed.'),
        tip('Safety rules', 'You can only grant permissions you hold yourself. Role changes reach users within an hour or on their next sign-in.'),
    ],
    '/admin/publishing': [
        intro('Publishing', 'Push approved content to your platforms now, or schedule it for later. You only see the destinations you are allowed to publish to.'),
        heading('Ready to publish', 'Approved items appear here. Choose a destination and publish, or schedule a time.'),
        tip('Scheduled posts', 'Scheduled posts go out automatically at the chosen time, even if you are signed out.'),
    ],
    '/admin/reports': [
        intro('Reports', 'Charts and totals for content, social posts, requisitions, appointments and new members. Export any view as a PDF.'),
        filters('Choose the period', 'Pick a year or period to change every chart on the page.'),
        tip('PDF export', 'Use the export button to download the current report as a PDF you can share.'),
    ],
    '/admin/requisitions': [
        intro('Requisitions', 'Departments request items or funds here. Review each request and approve it or decline it.'),
        table('Requests', 'Each row shows the requester, department, items and total. Approve from the row when it is ready.'),
        tip('Tip', 'The menu badge counts requisitions still waiting for review.'),
    ],
    '/admin/roles': [
        intro('User Roles', 'Assign a role to each member account. The role decides which pages and actions they can use.'),
        filters('Find a user', 'Search for a person before changing their role.'),
        table('Users & roles', 'Change a role from its dropdown. Some roles (like Media) can only be given to members of the content unit.'),
    ],
    '/admin/settings': [
        intro('Settings', 'Control the public website: homepage hero, live stream, social links and chatbot options.'),
        heading('Site settings', 'Changes are saved per section, so look for each section\'s save button.'),
        tip('Live stream', 'Add your stream link here and it appears on the website while you are live.'),
    ],
    '/admin/small-groups': [
        intro('Small Groups', 'Create and manage small groups, their leaders and meeting details. You can also import groups from CSV.'),
        table('Groups', 'Edit or remove a group from its row. Members can then be assigned to it from the Members page.'),
        tip('Bulk import', 'Download the CSV template, fill it in, and upload it using the import control.'),
    ],
    '/admin/units': [
        intro('Units', 'Departments and ministries (like Media, Ushering, Choir). Each has a head and members. CSV import is supported.'),
        table('Units', 'Edit a unit, update its head\'s contact details, or remove it.'),
        tip('Content unit', 'The Media/content unit controls who can be given content roles such as Graphics or Social Media.'),
    ],
    '/admin/workflow': [
        intro('Media Workflow', 'Follow every piece of content through its stages and see what is waiting on whom.'),
        heading('Pipeline', 'Sections group content by stage: sent back, forwarded for approval, and published.'),
        tip('Sent back', 'Items sent back show the reviewer\'s comment. Fix them and resubmit.'),
    ],
};

export function guideFor(pathname) {
    if (!pathname) return { key: null, steps: [] };
    const key = Object.keys(PAGE_GUIDES)
        .sort((a, b) => b.length - a.length)
        .find((route) => pathname === route || pathname.startsWith(`${route}/`));
    return key ? { key, steps: PAGE_GUIDES[key] } : { key: null, steps: [] };
}
