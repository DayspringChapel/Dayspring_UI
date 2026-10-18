import { PERMISSION_GROUPS } from '@/lib/permissionTiles';

// Which permission(s) each admin page needs. These mirror the policies the API enforces behind each
// page, so typing an address by hand lands on a clear "no access" screen instead of a page full of
// errors. Pages not listed here (dashboard, calendar, birthdays) are open to every signed-in user.
// The most specific prefix wins, so /admin/media/create can be stricter than /admin/media.
const ROUTE_RULES = [
    { prefix: '/admin/media/create', permission: 'CanUploadContent' },
    { prefix: '/admin/media', anyPermission: PERMISSION_GROUPS.media },
    { prefix: '/admin/workflow', anyPermission: PERMISSION_GROUPS.workflow },
    { prefix: '/admin/approvals', anyPermission: PERMISSION_GROUPS.approve },
    { prefix: '/admin/publishing', anyPermission: PERMISSION_GROUPS.publish },
    { prefix: '/admin/content', anyPermission: PERMISSION_GROUPS.websiteContent },
    { prefix: '/admin/appointments', permission: 'CanManageAppointment' },
    { prefix: '/admin/requisitions', permission: 'CanManageRequisition' },
    { prefix: '/admin/giving', permission: 'CanManageGiving' },
    { prefix: '/admin/members', anyPermission: PERMISSION_GROUPS.members },
    { prefix: '/admin/units', permission: 'CanManageDepartments' },
    { prefix: '/admin/small-groups', permission: 'CanManageSmallGroup' },
    { prefix: '/admin/comments', permission: 'CanModerateComments' },
    { prefix: '/admin/roles', permission: 'CanAssignRoles' },
    { prefix: '/admin/permissions', permission: 'CanAssignPermission' },
    { prefix: '/admin/reports', permission: 'CanViewReports' },
    { prefix: '/admin/settings', anyPermission: PERMISSION_GROUPS.settings },
].sort((a, b) => b.prefix.length - a.prefix.length);

/** The access rule for an admin path ({ permission } or { anyPermission }), or null when it is open to everyone. */
export function accessRuleFor(pathname) {
    if (!pathname) return null;
    return ROUTE_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) || null;
}
