import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isTrustedOrigin } from '../lib/session.server.js';
const keys = ['APP_ORIGIN', 'APP_ORIGINS', 'VERCEL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL', 'VERCEL_BRANCH_URL', 'NODE_ENV'];
const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
function clean() { for (const key of keys) delete process.env[key]; process.env.NODE_ENV = 'production'; }
afterEach(() => { for (const key of keys) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; } });
function request(origin, extra = {}) { return new Request('https://internal-proxy/api/auth/session', { headers: { origin, ...extra } }); }

test('the actual Dayspring production login origin is accepted with harmless configuration whitespace', () => {
    clean(); process.env.APP_ORIGIN = ' https://dayspring-ui.vercel.app/ ';
    assert.equal(isTrustedOrigin(request('https://dayspring-ui.vercel.app')), true);
    for (const value of ['https://dayspring-ui.vercel.app.evil.test', 'http://dayspring-ui.vercel.app', 'https://dayspring-ui.vercel.app:444', 'null']) assert.equal(isTrustedOrigin(request(value)), false);
});
test('Vercel fallback trusts server deployment metadata, never forwarded host headers', () => {
    clean(); process.env.VERCEL = '1'; process.env.VERCEL_PROJECT_PRODUCTION_URL = 'dayspring-ui.vercel.app'; process.env.VERCEL_URL = 'dayspring-ui-preview-123.vercel.app';
    assert.equal(isTrustedOrigin(request('https://dayspring-ui.vercel.app')), true);
    assert.equal(isTrustedOrigin(request('https://dayspring-ui-preview-123.vercel.app')), true);
    assert.equal(isTrustedOrigin(request('https://evil.test', { host: 'evil.test', 'x-forwarded-host': 'evil.test' })), false);
});
test('explicit origins override Vercel defaults and cross-site requests remain rejected', () => {
    clean(); process.env.VERCEL = '1'; process.env.VERCEL_PROJECT_PRODUCTION_URL = 'dayspring-ui.vercel.app'; process.env.APP_ORIGIN = 'https://church.example';
    assert.equal(isTrustedOrigin(request('https://dayspring-ui.vercel.app')), false);
    assert.equal(isTrustedOrigin(request('https://church.example')), true);
    assert.equal(isTrustedOrigin(request('https://church.example', { 'sec-fetch-site': 'cross-site' })), false);
});
test('production without an explicit or platform-supplied origin fails closed', () => {
    clean(); assert.equal(isTrustedOrigin(request('https://dayspring-ui.vercel.app')), false);
    process.env.APP_ORIGIN = 'https://dayspring-ui.vercel.app/admin/login';
    assert.equal(isTrustedOrigin(request('https://dayspring-ui.vercel.app')), false);
});
