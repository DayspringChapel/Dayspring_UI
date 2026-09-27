// Quick-action tiles for the dashboards that only make sense for certain permissions
// (Reports, Roles & Permissions). Kept in one place so every dashboard offers the same tile
// instead of three slightly different copies, and stays correct for custom roles — a role only
// needs the permission, not one of the three hardcoded names, to see it.
export const REPORTS_TILE = { label: 'Reports', path: '/admin/reports', color: '#0369a1', icon: '📊', permission: 'CanViewReports' };
export const ROLES_PERMISSIONS_TILE = { label: 'Roles & Permissions', path: '/admin/permissions', color: '#7c3aed', icon: '🛡️', permission: 'CanAssignPermission' };

/** Appends any tiles in `candidates` whose permission the user actually holds. */
export function withPermissionTiles(baseTiles, hasPermission, candidates) {
    return [...baseTiles, ...candidates.filter((t) => hasPermission(t.permission))];
}
