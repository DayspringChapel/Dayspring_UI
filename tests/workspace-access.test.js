import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessPath } from '../lib/access.js';
test('admin and superadmin cannot open the community workspace directly', () => {
    for (const name of ['churchAdmin','superAdmin']) assert.equal(canAccessPath({ role:{ name } }, '/admin/comments'),false);
    for (const name of ['churchMedia','contentSocialMedia']) assert.equal(canAccessPath({ role:{ name } }, '/admin/comments'),true);
});
test('the shared events workspace respects content or media resource visibility', () => {
    for (const resource of ['content','media']) assert.equal(canAccessPath({ access:{ configured:true,resources:[resource] } }, '/admin/events'),true);
    assert.equal(canAccessPath({ access:{ configured:true,resources:['forms'] } }, '/admin/events'),false);
});
