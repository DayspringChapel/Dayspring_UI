// Opt-in smoke test against disposable local instances. Never targets a deployed site.
import assert from 'node:assert/strict';
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
const api = process.env.DAYSPRING_SMOKE_API;
for (const value of [origin, api]) {
    if (!value || !['127.0.0.1', 'localhost'].includes(new URL(value).hostname))
        throw new Error('Set DAYSPRING_SMOKE_ORIGIN and DAYSPRING_SMOKE_API to disposable localhost instances.');
}
const headers = { Origin: origin, 'Content-Type': 'application/json' };
assert.equal((await fetch(`${api}/health/live`)).status, 200);
assert.equal((await fetch(`${api}/health/ready`)).status, 200);
assert.equal((await fetch(`${origin}/api/auth/session`)).status, 401);
assert.equal((await fetch(`${origin}/api/auth/session`, {
    method: 'POST', headers: { ...headers, Origin: 'https://untrusted.test' }, body: '{}',
})).status, 403);
const login = await fetch(`${origin}/api/auth/session`, {
    method: 'POST', headers,
    body: JSON.stringify({ userNameOrEmail: 'foundation@church.test', password: 'Foundation-local-only-123', remember: true }),
});
assert.equal(login.status, 200);
const user = await login.json();
assert.equal(user.success, true);
assert.equal(user.sessionToken, undefined);
assert.equal(user.token, undefined);
assert.equal(user.refreshToken, undefined);
const cookieHeader = login.headers.get('set-cookie') || '';
assert.equal(cookieHeader.startsWith('__Host-dayspring_session='), true);
assert.equal(/httponly/i.test(cookieHeader), true);
assert.equal(/secure/i.test(cookieHeader), true);
assert.equal(/samesite=lax/i.test(cookieHeader), true);
const cookie = cookieHeader.split(';')[0];
const staff = { ...headers, Cookie: cookie };
const me = await fetch(`${origin}/api/auth/session`, { headers: staff });
assert.equal(me.status, 200);
assert.equal((await me.json()).permissions.includes('audit.view'), true);
assert.equal(me.headers.get('cache-control'), 'no-store');
assert.equal((await fetch(`${origin}/api/backend/api/v1/audit`, { headers: staff })).status, 200);
assert.equal((await fetch(`${origin}/api/backend/api/v1/Users/login`, { method: 'POST', headers: staff, body: '{}' })).status, 404);
const key = crypto.randomUUID();
const body = JSON.stringify({ name: `Smoke ${crypto.randomUUID().slice(0, 8)}`, permissions: [] });
const post = () => fetch(`${origin}/api/backend/api/v1/Roles/create`, {
    method: 'POST', headers: { ...staff, 'Idempotency-Key': key }, body,
});
const first = await post();
assert.equal(first.status, 200);
const firstResult = await first.json();
const replay = await post();
assert.equal(replay.status, 200);
assert.equal(replay.headers.get('idempotency-replayed'), 'true');
assert.equal((await replay.json()).id, firstResult.id);
const conflict = await fetch(`${origin}/api/backend/api/v1/Roles/create`, {
    method: 'POST', headers: { ...staff, 'Idempotency-Key': key }, body: JSON.stringify({ name: 'Changed request', permissions: [] }),
});
assert.equal(conflict.status, 409);
assert.equal((await fetch(`${origin}/api/auth/session`, { method: 'DELETE', headers: { ...staff, Origin: 'https://untrusted.test' } })).status, 403);
assert.equal((await fetch(`${origin}/api/auth/session`, { method: 'DELETE', headers: staff })).status, 204);
// Replaying a copied cookie after logout must fail at the backend, not just in the browser.
assert.equal((await fetch(`${origin}/api/auth/session`, { headers: staff })).status, 401);
const loginPage = await fetch(`${origin}/admin/login`);
assert.equal(loginPage.status, 200);
assert.equal((await loginPage.text()).includes('Dayspring OS'), true);
console.log('Runtime smoke passed: readiness, session restore, cookie flags, CSRF, authorization, idempotency replay/conflict, server logout revocation, and admin branding.');
