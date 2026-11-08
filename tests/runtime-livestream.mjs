// Local synthetic browser acceptance. Never starts, ends or changes a real broadcast.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend.');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    for (const [key, width] of [['youTube', 390], ['youtube', 1280]]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        let active = false, hidden = false, reads = 0;
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await context.route('**/*', route => {
            const url = new URL(route.request().url());
            const json = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
            if (url.origin !== origin) return route.abort();
            if (url.pathname === '/api/livestream') {
                reads++;
                return json({ [key]: { active, url: 'https://www.youtube.com/watch?v=AqLocal12345' }, facebook: { active: false }, instagram: { active: false }, hideWatchOnline: hidden });
            }
            if (url.pathname.endsWith('/site-settings/hero')) return json({ mode: 0, items: [] });
            if (url.pathname === '/api/youtube-feed') return json({ videos: [] });
            if (url.pathname.startsWith('/api/')) return json([]);
            return route.continue();
        });
        await page.goto(origin);
        await page.waitForFunction(() => document.querySelector('h1')?.textContent.includes('DISCOVER PURPOSE'));
        while (reads === 0) await page.waitForTimeout(50);
        const button = page.getByRole('button', { name: 'LIVE NOW — WATCH', exact: true });
        assert.equal(await button.count(), 0);
        active = true;
        await page.evaluate(() => window.dispatchEvent(new Event('focus')));
        await button.waitFor();
        await button.click();
        const player = page.getByTitle('YouTube Live Stream', { exact: true });
        await player.waitFor();
        assert.match(await player.getAttribute('src'), /^https:\/\/www\.youtube\.com\/embed\/AqLocal12345\?/);
        assert.equal(await page.getByRole('link', { name: 'Open in YouTube →' }).getAttribute('href'), 'https://www.youtube.com/watch?v=AqLocal12345');
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        hidden = true;
        await page.evaluate(() => window.dispatchEvent(new Event('online')));
        await button.waitFor({ state: 'hidden' });
        hidden = false; active = false;
        await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
        await page.waitForTimeout(250);
        assert.equal(await button.count(), 0);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}px`);
        assert.deepEqual(errors, []);
        await context.close();
    }
    console.log('PASS: raw backend and normalized YouTube casing, inactive/hidden states, returning-tab live detection, YouTube player/link and mobile/desktop layouts.');
} finally { await browser.close(); }
