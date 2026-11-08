// Local synthetic settings persistence and status UI acceptance.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend.');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    await context.addInitScript(() => { const read = Storage.prototype.getItem; Storage.prototype.getItem = function(key) { return key.startsWith('dayspring_tour_seen_') ? '1' : read.call(this, key); }; });
    let settings = { youTubeAutoDetect: true, youTube: { active: false, url: '', description: '' }, facebook: {}, instagram: {}, social: {} };
    let saved;
    await context.route('**/*', route => {
        const url = new URL(route.request().url());
        const json = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
        if (url.origin !== origin) return route.abort();
        if (url.pathname === '/api/auth/session/activity') return route.fulfill({ status: 204 });
        if (url.pathname === '/api/auth/session') return json({ id: 'synthetic', userName: 'Media', role: 'churchMedia', permissions: ['CanManageLivestream'], legacyChurch: true });
        if (url.pathname === '/api/livestream') return json({ ...settings, youTubeDetectionState: settings.youTubeAutoDetect ? 'Live' : 'Manual' });
        if (url.pathname.endsWith('/site-settings/livestream')) {
            if (route.request().method() === 'PUT') { saved = route.request().postDataJSON(); settings = { ...saved, youTube: saved.youtube }; }
            return json(settings);
        }
        if (url.pathname.startsWith('/api/')) return json([]);
        return route.continue();
    });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/admin/settings`);
    const input = page.getByRole('textbox', { name: 'YouTube manual livestream URL' });
    await page.getByLabel('Automatically detect YouTube Live', { exact: true }).waitFor();
    assert.equal(await input.isDisabled(), true);
    await page.getByLabel('Add a YouTube live link', { exact: true }).check();
    assert.equal(await input.isEnabled(), true);
    await input.fill('https://www.youtube.com/watch?v=AqLocal12345');
    await page.getByRole('button', { name: 'Go live on YouTube', exact: true }).click();
    await page.getByRole('button', { name: 'Save Settings', exact: true }).click();
    await page.getByText('✓ Saved', { exact: true }).waitFor();
    assert.equal(saved.youTubeAutoDetect, false); assert.equal(saved.youtube.active, true);
    await page.reload();
    await page.getByLabel('Add a YouTube live link', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Add a YouTube live link', { exact: true }).isChecked(), true);
    await page.getByLabel('Automatically detect YouTube Live', { exact: true }).check();
    await page.getByRole('button', { name: 'Save Settings', exact: true }).click();
    await page.getByText('✓ Saved', { exact: true }).waitFor(); assert.equal(saved.youTubeAutoDetect, true);
    await page.getByRole('button', { name: 'Refresh live status' }).click();
    await page.getByRole('status').filter({ hasText: 'YouTube is live' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    console.log('PASS: automatic/manual mode save and reload, disabled manual controls in automatic mode, public status display and responsive source selection.');
    await context.close();
} finally { await browser.close(); }
