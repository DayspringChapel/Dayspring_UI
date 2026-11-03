import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Run only against a local frontend.');
const output = process.env.DAYSPRING_QA_OUTPUT; if (output) await mkdir(output, { recursive: true });
const user = { id: 'synthetic-user', userName: 'Session test', roleId: 'synthetic-role', role: 'Session test role', permissions: [], access: { configured: true, resources: ['dashboard'], widgets: [], scopeValid: true } };
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
let latest;
async function setup(initial) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); let mode = initial; let checks = 0;
    await context.addInitScript(() => { const original = Storage.prototype.getItem; Storage.prototype.getItem = function (key) { return key.startsWith('dayspring_tour_seen_') ? '1' : original.call(this, key); }; });
    await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.hostname !== '127.0.0.1') return route.abort();
        if (url.pathname === '/api/auth/session/activity') return route.fulfill({ status:204 });
        if (url.pathname === '/api/auth/session') {
            checks++; const status = mode === 'limited' ? 429 : mode === 'expired' ? 401 : mode === 'outage' || mode === 'transient' && checks < 3 ? 503 : 200;
            return route.fulfill({ status, headers: status === 429 ? { 'retry-after': '2' } : {}, contentType: 'application/json', body: JSON.stringify(status === 200 ? user : { message: status === 401 ? 'Sign in to continue.' : 'Service temporarily unavailable' }) });
        }
        if (url.pathname.startsWith('/api/backend/')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(url.pathname.endsWith('/access/dashboard') ? { cards: [], resources: [] } : []) });
        return route.continue();
    });
    const page = await context.newPage(); latest = page; const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    return { context, page, errors, count: () => checks, mode: (value) => { mode = value; } };
}
try {
    const transient = await setup('transient'); await transient.page.goto(`${origin}/admin/dashboard`); await transient.page.getByRole('heading', { name: 'Welcome, Session test' }).waitFor();
    assert.equal(transient.count(), 3); assert.equal(await transient.page.getByRole('heading', { name: 'Server temporarily unavailable' }).count(), 0); assert.deepEqual(transient.errors, []); await transient.context.close();
    const limited = await setup('limited'); await limited.page.goto(`${origin}/admin/dashboard`); await limited.page.getByRole('heading', { name: 'Session check interrupted' }).waitFor(); assert.equal(limited.count(), 1); assert.equal(await limited.page.getByText(/Try again in \d+s/).count(),0);
    await limited.page.evaluate(() => window.dispatchEvent(new Event('focus'))); await limited.page.waitForTimeout(350); assert.equal(limited.count(), 1, 'Focus does not bypass cooldown.'); limited.mode('healthy'); await limited.page.waitForTimeout(2100); await limited.page.getByRole('button', { name: 'Try again', exact: true }).click(); await limited.page.getByRole('heading', { name: 'Welcome, Session test' }).waitFor(); assert.equal(limited.count(), 2); await limited.context.close();
    const returning = await setup('healthy'); const page = returning.page; await page.goto(`${origin}/admin/dashboard`); await page.getByRole('heading', { name: 'Welcome, Session test' }).waitFor();
    returning.mode('outage'); const before = returning.count(); await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await page.getByRole('heading', { name: 'Server temporarily unavailable' }).waitFor(); assert.equal(returning.count() - before, 4);
    for (const width of [320, 390, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); if (output) await page.screenshot({ path: path.join(output, `session-recovery-${width}.png`), fullPage: true }); }
    returning.mode('healthy'); let reloads = 0; page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) reloads++; }); await page.getByRole('button', { name: 'Try again', exact: true }).click(); await page.getByRole('heading', { name: 'Welcome, Session test' }).waitFor(); assert.equal(reloads, 0, 'Retry does not reload the page.');
    returning.mode('outage'); await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await page.getByRole('heading', { name: 'Server temporarily unavailable' }).waitFor(); returning.mode('healthy'); await page.evaluate(() => window.dispatchEvent(new Event('online'))); await page.getByRole('heading', { name: 'Welcome, Session test' }).waitFor();
    returning.mode('expired'); await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await page.waitForURL('**/admin/login'); assert.equal(await page.getByRole('heading', { name: 'Server temporarily unavailable' }).count(), 0); assert.deepEqual(returning.errors, []); await returning.context.close();
    const idle = await setup('healthy'); await idle.page.clock.install({ time:Date.now() });
    await idle.page.goto(`${origin}/admin/dashboard`); await idle.page.getByRole('heading',{name:'Welcome, Session test'}).waitFor();
    await idle.page.clock.fastForward(29*60000); await idle.page.getByRole('heading',{name:'Welcome, Session test'}).click();
    await idle.page.clock.fastForward(29*60000); assert.ok(new URL(idle.page.url()).pathname.startsWith('/admin/dashboard'),'Interaction keeps the session active.');
    await idle.page.clock.fastForward(61000); await idle.page.waitForURL('**/admin/login?reason=idle'); await idle.context.close();
    console.log('PASS: transient session outage retries, returning-tab recovery, bounded persistent failures, retry without reload, online recovery, rate-limit cooldown, expired-session login redirect, responsive recovery UI and automatic 30-minute inactivity logout.');
} catch (error) { if (latest && !latest.isClosed()) { if (output) await latest.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }); console.error((await latest.locator('body').innerText()).slice(-2000)); } throw error; } finally { await browser.close(); }
