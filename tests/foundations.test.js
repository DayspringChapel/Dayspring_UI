import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithReadRetry } from '../lib/httpTransport.js';
import { ApiClient } from '../lib/apiClient.js';
import { isTrustedOrigin, sessionAuthorization, cookieSettings, sessionCheckHeaders } from '../lib/session.server.js';

const originalOrigin = process.env.APP_ORIGIN;
const originalEnvironment = process.env.NODE_ENV;
afterEach(() => {
    mock.restoreAll();
    if (originalOrigin === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = originalOrigin;
    if (originalEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalEnvironment;
});

test('reads retry network failures with bounded backoff', async () => {
    let calls = 0;
    const delays = [];
    mock.method(globalThis, 'fetch', async () => { if (++calls < 3) throw new TypeError('offline'); return new Response('{}'); });
    await fetchWithReadRetry('/read', {}, { random: () => 0, wait: async (ms) => delays.push(ms) });
    assert.equal(calls, 3);
    assert.deepEqual(delays, [1000, 2000]);
});

test('lost write responses never replay the operation', async () => {
    let committed = 0;
    mock.method(globalThis, 'fetch', async () => { committed++; throw new TypeError('response lost'); });
    await assert.rejects(fetchWithReadRetry('/issue', { method: 'POST', body: '{}' }), (error) => error.ambiguous === true);
    assert.equal(committed, 1);
});

test('writes, deletes and uploads do not retry 429', async () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        let calls = 0;
        mock.method(globalThis, 'fetch', async () => { calls++; return new Response('{}', { status: 429 }); });
        assert.equal((await fetchWithReadRetry('/write', { method })).status, 429);
        assert.equal(calls, 1);
        mock.restoreAll();
    }
});

test('a lost multipart upload response is sent once and remains ambiguous', async () => {
    const client = new ApiClient();
    const form = new FormData();
    form.set('title', 'Test upload');
    let received = 0;
    mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(url, '/api/backend/api/v1/MediaContent/upload');
        assert.equal(options.body, form);
        assert.equal(options.headers?.['Content-Type'], undefined);
        received++;
        throw new TypeError('upload response lost after server commit');
    });
    await assert.rejects(client.upload('/api/v1/MediaContent/upload', form), (error) => error.ambiguous === true);
    assert.equal(received, 1);
});

test('retry-after values are bounded and attempts stop', async () => {
    let calls = 0;
    const delays = [];
    mock.method(globalThis, 'fetch', async () => { calls++; return new Response('{}', { status: 429, headers: { 'retry-after': '99999' } }); });
    const result = await fetchWithReadRetry('/read', {}, { wait: async (ms) => delays.push(ms) });
    assert.equal(result.status, 429);
    assert.equal(calls, 4);
    assert.deepEqual(delays, [10000, 10000, 10000]);
});

test('cancellation aborts retries', async () => {
    const controller = new AbortController();
    let calls = 0;
    mock.method(globalThis, 'fetch', async () => { calls++; throw new TypeError('offline'); });
    await assert.rejects(fetchWithReadRetry('/read', { signal: controller.signal }, {
        wait: async () => controller.abort(new Error('cancelled')),
    }), /cancelled/);
    assert.equal(calls, 1);
});

test('API client forwards operation keys and normalizes conflicts', async () => {
    const client = new ApiClient();
    mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(url, '/api/backend/api/v1/Roles/create');
        assert.equal(options.headers['Idempotency-Key'], 'logical-operation-1');
        assert.equal(options.headers.Authorization, undefined);
        return Response.json({ message: 'Key conflict' }, { status: 409 });
    });
    await assert.rejects(client.request('/api/v1/Roles/create', {
        method: 'POST', body: '{}', idempotencyKey: 'logical-operation-1',
    }), (error) => error.status === 409 && error.message === 'Key conflict');
});

test('session cookies are opaque and hostile cookie values are ignored', () => {
    const secret = 'a'.repeat(64);
    assert.equal(sessionAuthorization(new Request('https://church.test', { headers: { cookie: `other=x; dayspring_session=${secret}` } })), `Session ${secret}`);
    assert.equal(sessionAuthorization(new Request('https://church.test', { headers: { cookie: 'dayspring_session=Bearer%20stolen' } })), null);
});

test('CSRF check accepts only exact configured origin', () => {
    process.env.APP_ORIGIN = 'https://church.test';
    for (const origin of ['https://evil.test', 'https://church.test.evil.test', 'null']) {
        assert.equal(isTrustedOrigin(new Request('https://church.test/api/write', { headers: { origin } })), false);
    }
    assert.equal(isTrustedOrigin(new Request('https://church.test/api/write')), false);
    assert.equal(isTrustedOrigin(new Request('https://church.test/api/write', { headers: { origin: 'https://church.test' } })), true);
    assert.equal(isTrustedOrigin(new Request('https://church.test/api/write', { headers: { origin: 'https://church.test', 'sec-fetch-site': 'cross-site' } })), false);
});

test('production requires an explicit origin and secure HttpOnly cookies', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.APP_ORIGIN;
    assert.equal(isTrustedOrigin(new Request('https://church.test/api/write', { headers: { origin: 'https://church.test' } })), false);
    assert.deepEqual(cookieSettings(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
});

test('login receives user state but does not expose or store a bearer token', async () => {
    const client = new ApiClient();
    mock.method(globalThis, 'fetch', async (url) => {
        assert.equal(url, '/api/auth/session');
        return Response.json({ success: true, user: { id: 'user', role: { name: 'Admin', permissions: ['example'] } } });
    });
    const result = await client.login('admin@church.test', 'test-password', true);
    assert.equal(result.token, undefined);
    assert.equal(result.refreshToken, undefined);
    assert.equal(client.hasSession(), true);
    assert.deepEqual(client.getCurrentPermissions(), ['example']);
});


test('read retries recover from temporary gateway and service failures', async () => {
    const statuses = [502, 503, 504, 200]; const delays = []; let calls = 0;
    mock.method(globalThis, 'fetch', async () => new Response('{}', { status: statuses[calls++] }));
    const response = await fetchWithReadRetry('/api/auth/session', {}, { random: () => 0, wait: async (ms) => delays.push(ms) });
    assert.equal(response.status, 200); assert.equal(calls, 4); assert.deepEqual(delays, [1000, 2000, 4000]);
});

test('temporary read failures remain bounded and writes are never retried', async () => {
    let calls = 0;
    mock.method(globalThis, 'fetch', async () => { calls++; return new Response('{}', { status: 503 }); });
    const response = await fetchWithReadRetry('/api/auth/session', {}, { maxRetries: 2, wait: async () => {} });
    assert.equal(response.status, 503); assert.equal(calls, 3);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        calls = 0;
        assert.equal((await fetchWithReadRetry('/write', { method }, { wait: async () => {} })).status, 503);
        assert.equal(calls, 1);
    }
});

test('returning sessions recover from a transient outage without signing out', async () => {
    const client = new ApiClient(); let calls = 0;
    const fetchRead = client.fetchWith429Retry.bind(client);
    mock.method(client, 'fetchWith429Retry', (url, options) => fetchRead(url, options, { wait: async () => {} }));
    mock.method(globalThis, 'fetch', async () => {
        if (++calls < 3) return Response.json({ message: 'Service temporarily unavailable' }, { status: 503 });
        return Response.json({ id: 'returning-user', roleId: 'role', role: 'Coordinator', permissions: ['forms.create'] });
    });
    const user = await client.restoreSession();
    assert.equal(calls, 3); assert.equal(user.id, 'returning-user'); assert.equal(client.hasSession(), true);
    assert.deepEqual(client.getCurrentPermissions(), ['forms.create']);
});

test('expired sessions clear cached identity immediately and are not retried', async () => {
    const client = new ApiClient(); client.setUserData({ id: 'old-user' }); let calls = 0;
    mock.method(globalThis, 'fetch', async () => { calls++; return new Response('{}', { status: 401 }); });
    assert.equal(await client.restoreSession(), null); assert.equal(calls, 1); assert.equal(client.hasSession(), false);
});

test('a persistent outage keeps session failure distinct from expiration', async () => {
    const client = new ApiClient(); client.setUserData({ id: 'old-user' }); client.maxRetries = 1; let calls = 0;
    const fetchRead = client.fetchWith429Retry.bind(client);
    mock.method(client, 'fetchWith429Retry', (url, options) => fetchRead(url, options, { wait: async () => {} }));
    mock.method(globalThis, 'fetch', async () => { calls++; return Response.json({ message: 'Server unavailable' }, { status: 503 }); });
    await assert.rejects(client.restoreSession(), (error) => error.status === 503);
    assert.equal(calls, 2); assert.equal(client.getUserData().id, 'old-user');
});


test('session checks honor rate-limit cooldown without replaying requests', async () => {
    const client = new ApiClient(); client.setUserData({ id: 'returning-user' }); let calls = 0; let now = 100000;
    mock.method(Date, 'now', () => now);
    mock.method(globalThis, 'fetch', async () => { calls++; return calls === 1 ? new Response('{}', { status: 429, headers: { 'retry-after': '60' } }) : Response.json({ id: 'returning-user', role: 'Coordinator', permissions: [] }); });
    await assert.rejects(client.restoreSession(), (error) => error.status === 429 && error.retryAt === 160000);
    for (let i = 0; i < 5; i++) await assert.rejects(client.restoreSession(), (error) => error.status === 429);
    assert.equal(calls, 1); assert.equal(client.getUserData().id, 'returning-user');
    now = 160001; assert.equal((await client.restoreSession()).id, 'returning-user'); assert.equal(calls, 2);
});

test('session rate limits without retry guidance pause checks for a bounded local cooldown', async () => {
    const client = new ApiClient(); let calls = 0;
    mock.method(Date, 'now', () => 100000);
    mock.method(globalThis, 'fetch', async () => { calls++; return new Response('{}', { status: 429 }); });
    await assert.rejects(client.restoreSession(), (error) => error.status === 429 && error.retryAt === 130000);
    await assert.rejects(client.restoreSession(), (error) => error.status === 429); assert.equal(calls, 1);
});

test('session proxy forwards retry guidance and trace headers without upstream credentials', () => {
    const headers = sessionCheckHeaders(new Headers({ 'retry-after': '60', 'x-correlation-id': 'synthetic-trace', 'set-cookie': 'private-cookie', authorization: 'private-authorization' }));
    assert.equal(headers.get('retry-after'), '60'); assert.equal(headers.get('x-correlation-id'), 'synthetic-trace');
    assert.equal(headers.get('x-dayspring-session-source'), 'backend'); assert.equal(headers.get('cache-control'), 'no-store');
    assert.equal(headers.get('set-cookie'), null); assert.equal(headers.get('authorization'), null);
});
