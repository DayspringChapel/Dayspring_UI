// Step content per role for DashboardTour. Each `id` must match a `data-tour="<id>"` attribute
// rendered on that role's dashboard — a step whose element isn't on the page (e.g. a
// permission-gated tile a given user doesn't have) is skipped automatically.

const SHARED_TAIL = [
    { id: 'sidebar-nav', title: 'Your menu', content: 'Everything you can do lives here — it only shows what your role and permissions actually allow.' },
    { id: 'quick-guide', title: 'Quick Guide', content: 'Role-specific tips live here any time — click to expand. You can replay this tour from the same spot.' },
];

export const TOUR_STEPS = {
    superAdmin: [
        { id: 'hero', title: 'Welcome, Super Admin', content: 'This is your control centre — full oversight of members, content, roles, and every pipeline in the system.' },
        { id: 'quick-actions', title: 'Quick Actions', content: 'Jump straight to Members, Approvals, Publishing, Roles & Permissions, Reports, and more from here.' },
        ...SHARED_TAIL,
    ],
    churchAdmin: [
        { id: 'hero', title: 'Welcome, Admin', content: 'Your dashboard for members, appointments, requisitions, and approving content before it goes live.' },
        { id: 'quick-actions', title: 'Quick Actions', content: 'Manage Members, Appointments, Requisitions, Small Groups, Events and Departments from here.' },
        ...SHARED_TAIL,
    ],
    churchMedia: [
        { id: 'hero', title: 'Welcome, Media Team', content: 'This is where you upload, review and publish media — sermons, event fliers, photos and more.' },
        { id: 'quick-actions', title: 'Quick Actions', content: 'Upload media, check your content, track Workflow, handle Approvals and Publishing from here.' },
        ...SHARED_TAIL,
    ],
};

export function tourStepsFor(role) {
    return TOUR_STEPS[role] || [];
}
