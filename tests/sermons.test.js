import test from 'node:test';
import assert from 'node:assert/strict';
import {newestSermonsFirst,sermonDateLabel} from '../lib/sermons.js';

test('newest sermon dates come first before selecting the homepage five; missing dates come last',()=>{
    const sermons=['2026-01-01','2026-06-01','2026-03-01',null,'2026-02-01','2026-05-01','2026-04-01','invalid'].map((sermonDate,id)=>({id,sermonDate}));
    const sorted=newestSermonsFirst(sermons);
    assert.deepEqual(sorted.slice(0,5).map(item=>item.id),[1,5,6,2,4]);
    assert.deepEqual(sorted.slice(-2).map(item=>item.id),[3,7]);
    assert.equal(sermons[0].id,0);
});

test('sermon date labels preserve the service date and handle missing dates',()=>{
    assert.equal(sermonDateLabel('2026-11-19'),'19 November 2026');
    assert.equal(sermonDateLabel(null),'Date to be confirmed');
});
