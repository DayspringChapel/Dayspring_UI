// Quick-action tiles for the dashboards that only make sense for certain permissions
// (Reports, Roles & Permissions). Kept in one place so every dashboard offers the same tile
// instead of three slightly different copies, and stays correct for custom roles — a role only
// needs the permission, not one of the three hardcoded names, to see it.
export const REPORTS_TILE = { label: 'Reports', path: '/admin/reports', color: '#0369a1', icon: '📊', permission: 'CanViewReports' };
export const ROLES_PERMISSIONS_TILE = { label: 'Roles & Permissions', path: '/admin/permissions', color: '#7c3aed', icon: '🛡️', permission: 'CanAssignPermission' };

// Groups of permissions that each unlock one area of the admin panel. A page or button that serves
// an area is shown when the user holds ANY permission in its group (these mirror the policies the
// backend enforces on the matching API endpoints).
export const PERMISSION_GROUPS = {
    members: ['CanManageMember', 'CanViewUnitMembers'],
    websiteContent: ['CanManageEvent', 'CanManageSermon', 'CanManageBooks', 'CanManageAlbum', 'CanManageCalendarYear', 'CanManageSeries', 'CanManageImage'],
    media: ['CanViewMediaData', 'CanUploadContent'],
    workflow: ['CanReviewContent', 'CanSubmitContent', 'CanUploadContent'],
    approve: ['CanApproveAsAdmin', 'CanApproveAsSuperAdmin'],
    publish: ['CanPublishContent', 'CanPublishToFacebook', 'CanPublishToInstagram', 'CanPublishToX', 'CanPublishToYouTube', 'CanPublishToWhatsApp'],
    settings: ['CanManageLivestream', 'CanManageHero', 'CanManageChatbot', 'CanManageSystemSettings'],
};

/** True when a tile / nav item / button is allowed for this user. Items with no permission info are always shown. */
export function canSeeItem(item, hasPermission) {
    if (item.permission) return hasPermission(item.permission);
    if (item.anyPermission) return item.anyPermission.some((p) => hasPermission(p));
    return true;
}

/** Keeps only the items the user is allowed to see. */
export function visibleItems(items, hasPermission) {
    return items.filter((item) => canSeeItem(item, hasPermission));
}

/**
 * The tiles a user may see: `baseTiles` that pass their own permission check, plus any `candidates`
 * (tiles that only exist for a permission, like Reports) whose permission the user holds.
 */
export function withPermissionTiles(baseTiles, hasPermission, candidates) {
    return [...visibleItems(baseTiles, hasPermission), ...candidates.filter((t) => hasPermission(t.permission))];
}
