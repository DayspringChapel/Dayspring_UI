// Local fixtures only: no real broadcast or provider is contacted.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN, output = process.env.DAYSPRING_QA_OUTPUT;
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a local UI.');
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function(key) { return key.startsWith('dayspring_tour_seen_') ? '1' : get.call(this, key); }; });
    const settings = { youTubeAutoDetect: true, youTubeBroadcastCreated: false, youTube: { active: false, url: '', description: '' }, facebook: {}, instagram: {}, social: {} };
    let stopCalls = 0, createCalls = 0, failStop = false;
    await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        const json = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
        if (url.origin !== origin) return route.abort();
        if (url.pathname === '/api/auth/session/activity') return route.fulfill({ status: 204 });
        if (url.pathname === '/api/auth/session') return json({ id: 'fixture', userName: 'Media', role: 'churchMedia', permissions: ['CanManageLivestream'], legacyChurch: true });
        if (url.pathname === '/api/livestream' || url.pathname === '/api/livestream/refresh') return json({ ...settings, youTubeDetectionState: 'Offline' });
        if (url.pathname.endsWith('/livestream/youtube/start')) {
            createCalls++; settings.youTubeBroadcastCreated = true; settings.youTube.active = true;
            settings.youTube.url = 'https://www.youtube.com/watch?v=AqLocal12345';
            return json({ success: true, ingestionUrl: 'rtmps://synthetic.example.test/live', streamKey: 'synthetic-never-live-key' });
        }
        if (url.pathname.endsWith('/livestream/youtube/stop')) {
            stopCalls++;
            if (failStop) return json({ success: false, errorMessage: 'Synthetic provider stop failed. Retry.' });
            settings.youTubeBroadcastCreated = false; settings.youTube.active = false;
            return json({ success: true, errorMessage: null });
        }
        if (url.pathname.endsWith('/site-settings/livestream')) return json(settings);
        if (url.pathname.startsWith('/api/')) return json([]);
        return route.continue();
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/admin/settings`);
    const create = page.getByRole('button', { name: 'Create a YouTube broadcast', exact: true });
    const stop = page.getByRole('button', { name: 'Stop / cancel YouTube broadcast', exact: true });
    await create.waitFor(); await create.click();
    await page.getByText('Broadcast created', { exact: true }).waitFor();
    assert.equal(createCalls, 1); assert.equal(await create.isDisabled(), true); assert.equal(await stop.isEnabled(), true);
    await page.getByText('YouTube encoder connection', { exact: true }).click();
    const key = page.getByLabel('YouTube stream key', { exact: true });
    assert.equal(await key.getAttribute('type'), 'password');
    assert.ok(!(await page.locator('body').innerText()).includes('synthetic-never-live-key'));
    await page.getByRole('button', { name: 'Reveal key', exact: true }).click(); assert.equal(await key.getAttribute('type'), 'text');
    await page.getByRole('tab', { name: 'OBS · direct website', exact: true }).click();
    await page.getByRole('heading', { name: 'OBS to the website', exact: true }).waitFor();
    await page.getByText('Not configured', { exact: true }).waitFor(); assert.equal(await page.getByRole('button', { name: /Create|Stop/ }).count(), 0);
    await page.getByRole('tab', { name: 'Other live links', exact: true }).click();
    await page.getByRole('textbox', { name: 'Facebook manual livestream URL' }).waitFor();
    await page.getByRole('tab', { name: 'YouTube', exact: true }).click();
    await page.getByText('YouTube encoder connection', { exact: true }).click(); assert.equal(await key.getAttribute('type'), 'password');
    await stop.click(); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click(); assert.equal(stopCalls, 0);
    failStop = true;
    await stop.click(); await page.getByRole('dialog').getByRole('button', { name: 'Stop broadcast', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Synthetic provider stop failed' }).waitFor();
    assert.equal(await stop.isEnabled(), true); assert.equal(settings.youTubeBroadcastCreated, true);
    failStop = false;
    await stop.click(); await page.getByRole('dialog').getByRole('button', { name: 'Stop broadcast', exact: true }).click();
    await page.getByText('Ready to connect', { exact: true }).waitFor(); assert.equal(stopCalls, 2);
    assert.equal(await stop.isDisabled(), true); assert.equal(await page.getByText('YouTube encoder connection', { exact: true }).count(), 0);
    for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const tab of ['YouTube', 'OBS · direct website', 'Other live links']) {
            await page.getByRole('tab', { name: tab, exact: true }).click();
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${tab}, ${width}`);
            if (output && [390, 1280].includes(width)) await page.locator('section[aria-label="Livestream workspace"]').screenshot({ path: path.join(output, `stream-${width}-${tab.split(' ')[0]}.png`) });
        }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: separate YouTube/OBS/other-link sections, create, confirmation/cancel, provider-failure recovery, stop success, masked/revealed encoder keys and four responsive widths.');
    await context.close();
} finally { await browser.close(); }
