import test from 'node:test';
import assert from 'node:assert/strict';
import {nextImminentEvent,eventCountdown} from '../lib/upcomingEvents.js';
const now=Date.parse('2026-11-20T12:00:00Z');
const event=(days,extra={})=>({id:String(days),eventDate:new Date(now+days*86400000).toISOString(),isPublished:true,...extra});
test('only published, unarchived events within seven days trigger the navigation alert, nearest first',()=>{
    assert.equal(nextImminentEvent([event(9),event(-1),event(1,{isPublished:false}),event(2,{isArchived:true}),event(7),event(3)],now).id,'3');
    assert.equal(nextImminentEvent([event(7)],now).id,'7');
    assert.equal(nextImminentEvent([event(8),event(-1),{isPublished:true,eventDate:'invalid'}],now),null);
});
test('countdown updates days through seconds and never becomes negative',()=>{
    assert.equal(eventCountdown(new Date(now+90061000).toISOString(),now),'1d 1h 1m 1s');
    assert.equal(eventCountdown(new Date(now-1000).toISOString(),now),'Starting now');
});
