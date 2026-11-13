// Local public-page acceptance with synthetic broadcasts; never changes a real stream.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a disposable local frontend.');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    for (const width of [390, 1280]) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        let active = false, hidden = false, embedAllowed = true, failure = false, second = false, authReads = 0;
        const errors = [];
        await context.addInitScript(() => {
            Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
            Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__sharedLink = value; } } });
        });
        await context.route('**/*', route => {
            const url = new URL(route.request().url());
            const json = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
            if (url.origin !== origin) return route.abort();
            if (url.pathname.startsWith('/api/auth/')) { authReads++; return route.fulfill({ status: 401 }); }
            if (url.pathname === '/api/livestream') {
                if (failure) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
                return json({ youTube: { active, embedAllowed, url: 'https://www.youtube.com/watch?feature=shared&v=abcdefghijk', description: 'Sunday worship' }, instagram: { active: second, url: 'https://www.instagram.com/church/live' }, hideWatchOnline: hidden });
            }
            if (url.pathname.startsWith('/api/')) return json([]);
            return route.continue();
        });
        const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${origin}/live`);
        await page.getByRole('heading', { name: 'Watch live', exact: true }).waitFor();
        await page.getByRole('heading', { name: 'We’re not broadcasting right now' }).waitFor();
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://www.dayspring-vlbc.org/live');
        await page.getByRole('button', { name: 'Share livestream', exact: true }).click();
        await page.getByText('Livestream link copied.', { exact: true }).waitFor();
        assert.equal(await page.evaluate(() => window.__sharedLink), 'https://www.dayspring-vlbc.org/live');
        await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.__nativeShare = data.url; } }));
        await page.getByRole('button', { name: 'Share livestream', exact: true }).click();
        await page.getByText('Livestream link shared.', { exact: true }).waitFor();
        assert.equal(await page.evaluate(() => window.__nativeShare), 'https://www.dayspring-vlbc.org/live');
        active = true;
        await page.getByRole('button', { name: 'Refresh live status', exact: true }).click();
        const player = page.getByTitle('YouTube Live Stream', { exact: true }); await player.waitFor();
        const embed = new URL(await player.getAttribute('src')); assert.equal(embed.pathname, '/embed/abcdefghijk'); assert.equal(embed.searchParams.get('origin'), origin);
        assert.equal(await player.getAttribute('referrerpolicy'), 'strict-origin-when-cross-origin');
        failure = true;
        await page.getByRole('button', { name: 'Refresh live status', exact: true }).click();
        await page.getByRole('alert').filter({ hasText: 'We could not refresh the broadcast.' }).waitFor(); assert.equal(await player.count(), 1);
        failure = false; embedAllowed = false;
        await page.getByRole('button', { name: 'Refresh live status', exact: true }).click();
        await page.getByRole('link', { name: 'Watch live on YouTube ↗', exact: true }).waitFor();
        assert.equal(await player.count(), 0);
        second = true;
        await page.getByRole('button', { name: 'Refresh live status', exact: true }).click();
        await page.getByRole('button', { name: 'Instagram', exact: true }).click();
        await page.getByRole('link', { name: 'Watch live on Instagram ↗', exact: true }).waitFor();
        hidden = true;
        await page.evaluate(() => window.dispatchEvent(new Event('focus')));
        await page.getByRole('heading', { name: 'We’re not broadcasting right now' }).waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}px`);
        assert.equal(authReads, 0); assert.deepEqual(errors, []);
        await context.close();
    }
    console.log('PASS: public /live page, canonical link, copy/native sharing, offline-to-live refresh, platform switching, restricted embeds, error recovery and mobile/desktop layouts.');
} finally { await browser.close(); }
