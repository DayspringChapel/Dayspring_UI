import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithReadRetry } from '../lib/httpTransport.js';
import { ApiClient } from '../lib/apiClient.js';
import { isTrustedOrigin, sessionAuthorization, cookieSettings } from '../lib/session.server.js';

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
