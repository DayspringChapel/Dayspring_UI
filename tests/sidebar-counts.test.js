import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSidebarCounts } from '../lib/sidebarCounts.js';
const api = overrides => ({ getAppointments:async()=>[{status:0},{status:1}],getRequisitions:async()=>[{status:0}],getAdminApprovalQueue:async()=>[{contentId:'admin'}],getSuperAdminApprovalQueue:async()=>[{contentId:'root'}],getBirthdays:async()=>[{dateOfBirth:'2000-11-03'}],getCommentCounts:async()=>({pending:2}),...overrides });
test('custom roles receive actionable badges according to permissions',async()=>{
 const result=await fetchSidebarCounts(api(),['CanManageAppointment','CanManageRequisition','CanApproveAsAdmin'],new Date(2026,10,3));
 assert.deepEqual(result,{appointments:1,requisitions:1,approvals:1,publishing:0,birthdays:1,comments:0});
});
test('a final reviewer badge contains only the final-stage queue',async()=>{
 assert.equal((await fetchSidebarCounts(api(),['CanApproveAsAdmin','CanApproveAsSuperAdmin'])).approvals,1);
});
test('publishers receive a badge for approved content awaiting publication',async()=>{
 const result=await fetchSidebarCounts(api({getMediaContentsByStatus:async status=>{assert.equal(status,7);return[{id:'first'},{id:'second'}];}}),['CanPublishContent']);assert.equal(result.publishing,2);
});
test('ungranted queues are not fetched and moderation is permission based',async()=>{
 let unauthorized=0; const a=api({getAdminApprovalQueue:async()=>{unauthorized++;return[];},getSuperAdminApprovalQueue:async()=>{unauthorized++;return[];}});
 const result=await fetchSidebarCounts(a,['CanModerateComments']);assert.equal(unauthorized,0);assert.equal(result.comments,2);
});
test('one unavailable endpoint does not discard the other badges',async()=>{
 const a=api({getAppointments:async()=>{throw new Error('unavailable');}});
 const result=await fetchSidebarCounts(a,['CanManageAppointment','CanManageRequisition']);assert.equal(result.appointments,0);assert.equal(result.requisitions,1);
});
