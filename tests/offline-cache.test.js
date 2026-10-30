import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');

function worker(upstream, stored = new Map()) {
    const listeners = {};
    const puts = [];
    const context = {
        URL, Response,
        self: { location: { origin: 'https://church.test' }, addEventListener: (name, handler) => { listeners[name] = handler; } },
        fetch: upstream,
        caches: {
            match: async (request) => stored.get(typeof request === 'string' ? request : request.url)?.clone(),
            open: async () => ({
                put: async (request, response) => { puts.push(request.url); stored.set(request.url, response); },
                keys: async () => [],
            }),
        },
    };
    vm.runInNewContext(source, context);
    return {
        puts,
        async request(headers = {}, path = '/api/backend/api/v1/Sermons') {
            let response;
            listeners.fetch({ request: new Request(`https://church.test${path}`, { headers }), respondWith: (value) => { response = value; } });
            return response ? await response : null;
        },
    };
}

test('public content is cached only with server proof of anonymous fetching', async () => {
    const anonymous = worker(async () => Response.json([], { headers: { 'X-Dayspring-Public': 'true' } }));
    assert.equal((await anonymous.request()).status, 200);
    assert.equal(anonymous.puts.length, 1);
    const authenticated = worker(async () => Response.json([{ draft: true }]));
    assert.equal((await authenticated.request()).status, 200);
    assert.equal(authenticated.puts.length, 0);
});

test('staff requests bypass offline caches completely', async () => {
    const sw = worker(async () => { throw new Error('Must bypass worker handling'); });
    assert.equal(await sw.request({ 'X-Dayspring-Staff': '1' }), null);
    assert.equal(await sw.request({ Authorization: 'Bearer synthetic' }), null);
    assert.equal(sw.puts.length, 0);
});

test('previously cached anonymous public content remains available offline', async () => {
    const url = 'https://church.test/api/backend/api/v1/Sermons';
    const stored = new Map([[url, Response.json([{ title: 'Public sermon' }])]]);
    const sw = worker(async () => { throw new TypeError('offline'); }, stored);
    assert.deepEqual(await (await sw.request()).json(), [{ title: 'Public sermon' }]);
});

test('private API routes never enter the public data cache', async () => {
    const sw = worker(async () => { throw new Error('Must bypass worker handling'); });
    assert.equal(await sw.request({}, '/api/backend/api/v1/audit'), null);
    assert.equal(await sw.request({}, '/api/auth/session'), null);
    assert.equal(await sw.request({}, '/api/backend/api/v1/forms/example/submissions'), null);
    assert.equal(await sw.request({}, '/api/backend/api/v1/certificates/example/preview'), null);
});
