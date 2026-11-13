// Runs against a disposable local Next server and an in-process fake backend.
import assert from 'node:assert/strict';
import http from 'node:http';
const origin = process.env.DAYSPRING_SMOKE_ORIGIN, port = Number(process.env.DAYSPRING_PROXY_FIXTURE_PORT || 5310);
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use local servers only.');
const id = 'abcdefghijk', visitors = new Map(); let calls = 0, lastComment;
const backend = http.createServer(async (request, response) => {
    calls++; assert.equal(request.headers.authorization, undefined); assert.equal(request.headers.cookie, undefined);
    const viewer = request.headers['x-dayspring-viewer']; assert.match(viewer, /^[a-f0-9]{32}$/);
    if (!visitors.has(viewer)) visitors.set(viewer, new Set());
    response.setHeader('Content-Type', 'application/json');
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const value = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null;
    if (request.url.endsWith('/comments')) {
        if (request.method === 'POST') { lastComment = value; response.end(JSON.stringify({ held: true, message: 'Your comment is awaiting review.' })); }
        else response.end('[]');
        return;
    }
    if (request.method === 'PUT') { if (value.active) visitors.get(viewer).add(value.kind); else visitors.get(viewer).delete(value.kind); }
    const counts = Object.fromEntries(['like', 'heart', 'amen', 'clap', 'joy'].map(kind => [kind, [...visitors.values()].filter(set => set.has(kind)).length]));
    response.end(JSON.stringify({ counts, mine: [...visitors.get(viewer)], youTubeLikes: 123 }));
});
await new Promise((resolve, reject) => { backend.once('error', reject); backend.listen(port, '127.0.0.1', resolve); });
try {
    const endpoint = `${origin}/api/live-engagement/${id}`;
    const initial = await fetch(endpoint); assert.equal(initial.status, 200);
    assert.deepEqual((await initial.json()).mine, []);
    assert.match(initial.headers.get('cache-control'), /no-store/);
    const header = initial.headers.get('set-cookie'); assert.match(header, /HttpOnly/i); assert.match(header, /SameSite=lax/i); assert.match(header, /Secure/i);
    const cookie = header.split(';')[0]; assert.match(cookie, /^__Host-dayspring_viewer=[a-f0-9]{32}$/);
    const headers = { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' };
    for (let i = 0; i < 2; i++) { const response = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify({ kind: 'like', active: true }) }); const data = await response.json(); assert.equal(data.counts.like, 1); assert.deepEqual(data.mine, ['like']); }
    const restored = await (await fetch(endpoint, { headers: { Cookie: cookie } })).json(); assert.deepEqual(restored.mine, ['like']);
    const other = await (await fetch(endpoint)).json(); assert.deepEqual(other.mine, []); assert.equal(other.counts.like, 1);
    const before = calls;
    assert.equal((await fetch(endpoint, { method: 'PUT', headers: { ...headers, Origin: 'https://untrusted.example' }, body: '{}' })).status, 403);
    assert.equal((await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify({ kind: 'fake', active: true }) })).status, 400); assert.equal(calls, before);
    const text = '🙏'.repeat(200);
    const posted = await fetch(`${endpoint}/comments`, { method: 'POST', headers, body: JSON.stringify({ name: 'Viewer', text, videoId: 'otherstream' }) });
    assert.equal(posted.status, 200); assert.equal((await posted.json()).held, true); assert.equal(lastComment.videoId, id); assert.equal(lastComment.text, text);
    console.log('PASS: private per-browser cookie, no-store responses, persistent choices, duplicate PUTs, origin/input validation and Unicode comments through the real Next proxy.');
} finally { await new Promise(resolve => backend.close(resolve)); }
