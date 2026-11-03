import test from 'node:test';
import assert from 'node:assert/strict';
import { monitorIdleSession, IDLE_SESSION_MS } from '../lib/idleSession.js';
function fixture(stored) {
    const target = new EventTarget(); target.document = new EventTarget(); let now = 10000000, tick;
    const values = new Map(stored ? [['dayspring:last-activity:user', String(now-stored)]] : []);
    target.localStorage = { getItem:key=>values.get(key), setItem:(key,value)=>values.set(key,value) };
    target.setInterval = callback => { tick=callback; return 1; }; target.clearInterval = () => {};
    let expired=0, pulses=0;
    const stop = monitorIdleSession({ target,userId:'user',now:()=>now,onIdle:()=>expired++,onActivity:()=>pulses++ });
    return { target,values,stop,advance:ms=>{now+=ms;tick();},idle:()=>expired,pulses:()=>pulses };
}
test('idle sessions expire after 30 minutes; background focus does not extend them',()=>{
    const f=fixture(); f.advance(IDLE_SESSION_MS-1); f.target.dispatchEvent(new Event('focus')); assert.equal(f.idle(),0);
    f.advance(1); assert.equal(f.idle(),1); f.advance(1000); assert.equal(f.idle(),1); f.stop();
});
test('interaction extends inactivity and heartbeats are throttled',()=>{
    const f=fixture(); f.advance(IDLE_SESSION_MS-1000); f.target.dispatchEvent(new Event('keydown')); assert.equal(f.pulses(),1);
    f.target.dispatchEvent(new Event('pointermove')); assert.equal(f.pulses(),1); f.advance(60000); f.target.dispatchEvent(new Event('scroll')); assert.equal(f.pulses(),2);
    f.advance(IDLE_SESSION_MS-1); assert.equal(f.idle(),0); f.advance(1); assert.equal(f.idle(),1); f.stop();
});
test('reloading an idle tab cannot reset its timeout',()=>{
    const f=fixture(IDLE_SESSION_MS+1); assert.equal(f.idle(),1); f.target.dispatchEvent(new Event('keydown')); assert.equal(f.pulses(),0); f.stop();
});
test('activity in another tab keeps the shared session active',()=>{
    const f=fixture(); f.advance(IDLE_SESSION_MS-1000); f.values.set('dayspring:last-activity:user',String(10000000+IDLE_SESSION_MS-1000));
    f.advance(2000); assert.equal(f.idle(),0); f.stop();
});
