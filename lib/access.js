const PATHS = [
    ['/admin/permissions', 'access'], ['/admin/roles', 'access'], ['/admin/churches', 'access'], ['/admin/workflow-configuration', 'approvals'], ['/admin/administrative-approvals', 'approvals'], ['/admin/certificates/approvals', 'approvals'],
    ['/admin/dashboard', 'dashboard'], ['/admin/forms', 'forms'], ['/admin/certificates', 'certificates'], ['/admin/members', 'people'], ['/admin/units', 'departments'], ['/admin/content', 'content'], ['/admin/calendar', 'calendar'],
    ['/admin/media', 'media'], ['/admin/workflow', 'media'], ['/admin/approvals', 'media'], ['/admin/publishing', 'media'], ['/admin/comments', 'comments'], ['/admin/appointments', 'appointments'], ['/admin/requisitions', 'requisitions'], ['/admin/giving', 'giving'], ['/admin/small-groups', 'groups'], ['/admin/birthdays', 'birthdays'], ['/admin/reports', 'reports'], ['/admin/operations', 'operations'], ['/admin/audit', 'audit'], ['/admin/settings', 'settings'],
];
export function resourceForPath(path) { return PATHS.find(([prefix]) => path === prefix || path?.startsWith(`${prefix}/`))?.[1]; }
export function canAccessPath(user, path) { const resource = resourceForPath(path); return !user?.access?.configured || !resource || user.access.resources?.includes(resource); }
export function roleLabel(role) { return ({ superAdmin: 'Superadmin', churchAdmin: 'Church admin', churchMedia: 'Church media', contentContributor: 'Content contributor', contentSocialMedia: 'Social media contributor', Member: 'Member' })[role] || role || 'No role'; }

export function landingPath(user, canVisit = () => true) { if (canAccessPath(user, '/admin/dashboard')) return '/admin/dashboard'; return PATHS.find(([path]) => canAccessPath(user, path) && canVisit(path))?.[0] || null; }
