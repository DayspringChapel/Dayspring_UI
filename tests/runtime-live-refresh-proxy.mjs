import assert from 'node:assert/strict';
import http from 'node:http';
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a local UI.');
let calls = 0, responseStatus = 200;
const backend = http.createServer((request, response) => {
    assert.equal(request.url, '/api/v1/site-settings/livestream/status/refresh');
    assert.equal(request.method, 'POST');
    assert.match(request.headers.authorization || '', /^Session [a-f0-9]{64}$/i);
    calls++;
    response.writeHead(responseStatus, { 'Content-Type': 'application/json', 'Set-Cookie': 'provider-cookie=do-not-forward' });
    response.end(JSON.stringify({ youTube: { active: false, url: '' }, youTubeAutoDetect: true, youTubeDetectionState: 'Offline' }));
});
await new Promise(resolve => backend.listen(5310, '127.0.0.1', resolve));
try {
    const endpoint = `${origin}/api/livestream/refresh`;
    const cookie = `__Host-dayspring_session=${'a'.repeat(64)}`;
    assert.equal((await fetch(endpoint, { method: 'POST', headers: { Origin: origin } })).status, 401);
    assert.equal((await fetch(endpoint, { method: 'POST', headers: { Origin: 'https://untrusted.example', Cookie: cookie } })).status, 403);
    assert.equal(calls, 0);
    const fresh = await fetch(endpoint, { method: 'POST', headers: { Origin: origin, Cookie: cookie } });
    assert.equal(fresh.status, 200); assert.equal((await fresh.json()).youTubeDetectionState, 'Offline');
    assert.match(fresh.headers.get('cache-control'), /no-store/); assert.equal(fresh.headers.get('set-cookie'), null);
    responseStatus = 403;
    assert.equal((await fetch(endpoint, { method: 'POST', headers: { Origin: origin, Cookie: cookie } })).status, 403);
    responseStatus = 404;
    const unavailable = await fetch(endpoint, { method: 'POST', headers: { Origin: origin, Cookie: cookie } });
    assert.equal(unavailable.status, 503); assert.match((await unavailable.json()).message, /backend refresh update/);
    assert.equal(calls, 3);
    console.log('PASS: authenticated fresh POST forwarding, anonymous/origin rejection, permission denial, no caching/cookie leakage and clear backend-rollout failure.');
} finally { await new Promise(resolve => backend.close(resolve)); }
