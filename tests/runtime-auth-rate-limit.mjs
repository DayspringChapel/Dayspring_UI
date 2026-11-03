import assert from 'node:assert/strict';
import http from 'node:http';
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['127.0.0.1','localhost'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend only.');
let calls = 0;
const upstream = http.createServer((req,res) => {
    calls++;
    assert.equal(req.url, '/api/v1/Users/browser-session');
    assert.equal(req.method, 'POST');
    res.writeHead(429, { 'Content-Type':'application/json', 'Retry-After':'42', 'X-Correlation-Id':'synthetic-request', 'Set-Cookie':'upstream-secret=never-forward' });
    res.end(JSON.stringify({ message:'Too many sign-in attempts for this account.' }));
});
await new Promise(resolve => upstream.listen(5310,'127.0.0.1',resolve));
try {
    const response = await fetch(`${origin}/api/auth/session`, { method:'POST', headers:{ 'Content-Type':'application/json', Origin:origin }, body:JSON.stringify({ userNameOrEmail:'synthetic@example.test', password:'synthetic-test-only' }) });
    assert.equal(response.status,429);
    assert.equal(response.headers.get('retry-after'),'42');
    assert.equal(response.headers.get('x-correlation-id'),'synthetic-request');
    assert.equal(response.headers.get('x-dayspring-session-source'),'backend');
    assert.equal(response.headers.get('set-cookie'),null);
    assert.match(response.headers.get('cache-control'),/no-store/);
    assert.match((await response.json()).message,/this account/);
    assert.equal(calls,1,'Login attempts are never automatically replayed.');
    const unauthorized = await fetch(`${origin}/api/auth/session`);
    assert.equal(unauthorized.status,401,'Anonymous session reads do not consume the login allowance.');
    assert.equal(calls,1);
    console.log('PASS: login rate-limit source, Retry-After and correlation headers preserved; upstream cookies stripped; login not replayed; anonymous session check stays independent.');
} finally { await new Promise(resolve => upstream.close(resolve)); }
