import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessPath } from '../lib/access.js';
test('admin, superadmin and media can open the community workspace within their resource access', () => {
    for (const name of ['churchAdmin','superAdmin','churchMedia','contentSocialMedia']) {
        assert.equal(canAccessPath({ role:{ name } }, '/admin/comments'),true);
        assert.equal(canAccessPath({ role:{ name }, access:{ configured:true,resources:['comments'] } }, '/admin/comments'),true);
        assert.equal(canAccessPath({ role:{ name }, access:{ configured:true,resources:['forms'] } }, '/admin/comments'),false);
    }
});
test('the shared events workspace respects content or media resource visibility', () => {
    for (const resource of ['content','media']) assert.equal(canAccessPath({ access:{ configured:true,resources:[resource] } }, '/admin/events'),true);
    assert.equal(canAccessPath({ access:{ configured:true,resources:['forms'] } }, '/admin/events'),false);
});

test('livestream analytics respects the reports resource', () => {
    assert.equal(canAccessPath({access:{configured:true,resources:['reports']}},'/admin/live-analytics'),true);
    assert.equal(canAccessPath({access:{configured:true,resources:['forms']}},'/admin/live-analytics'),false);
});

test('social analytics respects the reports resource for staff', () => {
    for (const name of ['churchAdmin','superAdmin','churchMedia']) {
        assert.equal(canAccessPath({role:{name},access:{configured:true,resources:['reports']}},'/admin/social-analytics'),true);
        assert.equal(canAccessPath({role:{name},access:{configured:true,resources:['forms']}},'/admin/social-analytics'),false);
    }
});
