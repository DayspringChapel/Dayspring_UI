// Synthetic public interactions only. No real YouTube message or reaction is sent.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend.');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    for (const width of [390, 1280]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 } });
        let mine = [], comments = [{id:'youtube-fixture',videoId:'abcdefghijk',authorName:'Grace',text:'A message from another viewer',source:'YouTube',postedAt:new Date().toISOString()}], fail = false, authReads = 0, posted = '';
        const errors = []; const id = 'abcdefghijk';
        await context.route('**/*', async route => {
            const request = route.request(), url = new URL(request.url());
            const json = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
            if (url.origin !== origin) return route.abort();
            if (url.pathname.startsWith('/api/auth/')) { authReads++; return route.fulfill({ status: 401 }); }
            if (url.pathname === '/api/livestream') return json({ youtube: { active: true, url: `https://youtu.be/${id}` } });
            if (url.pathname === `/api/live-engagement/${id}/comments`) {
                if (request.method() === 'POST') {
                    const value = request.postDataJSON(); posted = value.text;
                    comments.push({ id: crypto.randomUUID(), videoId: id, authorName: value.name || 'Anonymous1', text: value.text, source: 'Website', postedAt: new Date().toISOString() });
                    return json({ message: 'Comment posted.', held: false });
                }
                return json({comments,anonymousName:comments.some(c=>c.authorName === 'Anonymous1') ? 'Anonymous1' : null,sharingState:'Connected'});
            }
            if (url.pathname === `/api/live-engagement/${id}`) {
                if (request.method() === 'PUT') {
                    if (fail) { fail = false; return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Synthetic reaction outage' }) }); }
                    const value = request.postDataJSON(); mine = mine.filter(kind => kind !== value.kind); if (value.active) mine.push(value.kind);
                }
                return json({ counts: Object.fromEntries(['like', 'heart', 'amen', 'clap', 'joy'].map(kind => [kind, mine.includes(kind) ? 1 : 0])), mine, youTubeLikes: 123 });
            }
            if (url.pathname.startsWith('/api/')) return json([]);
            return route.continue();
        });
        const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${origin}/live`);
        await page.getByRole('heading', { name: /^Live conversation/ }).waitFor();
        await page.getByText('A message from another viewer', {exact:true}).waitFor();
        assert.equal(await page.getByTitle('YouTube live chat', {exact:true}).count(),0);
        assert.equal(await page.getByText('Website', {exact:true}).count(),0);
        const like = page.getByRole('button', { name: /^Like/ }); await like.click();
        await page.waitForFunction(() => document.querySelector('[aria-label="Live reactions"] button')?.getAttribute('aria-pressed') === 'true');
        await page.reload(); await page.getByRole('heading', { name: 'Join the conversation' }).waitFor();
        await page.waitForFunction(() => document.querySelector('[aria-label="Live reactions"] button')?.getAttribute('aria-pressed') === 'true');
        await like.click(); await page.waitForFunction(() => document.querySelector('[aria-label="Live reactions"] button')?.getAttribute('aria-pressed') === 'false');
        fail = true; await page.getByRole('button', { name: /^Amen/ }).click();
        await page.getByRole('alert').filter({ hasText: 'Synthetic reaction outage' }).waitFor(); assert.deepEqual(mine, []);
        await page.getByRole('button', { name: 'Refresh reactions' }).click();
        await page.getByRole('alert').filter({ hasText: 'Synthetic reaction outage' }).waitFor({ state: 'hidden' });
        await page.getByLabel('Your name (optional)', { exact: true }).fill(''); await page.getByLabel('Add a comment', { exact: true }).fill('Amen ');
        await page.getByRole('button', { name: 'Add prayer emoji' }).click(); await page.getByRole('button', { name: 'Post comment', exact: true }).click();
        await page.getByText('Comment posted.', { exact: true }).waitFor(); assert.equal(posted, 'Amen 🙏');
        await page.getByText('Amen 🙏', { exact: true }).waitFor();
        await page.getByText('Anonymous1', {exact:true}).waitFor();
        await page.getByText('You are Anonymous1 for this broadcast.', {exact:true}).waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}px`);
        assert.equal(authReads, 0); assert.deepEqual(errors, []); await context.close();
    }
    console.log('PASS: unified live conversation, imported comments without source badges, saved reactions, failure recovery and optional-name emoji comments on mobile/desktop.');
} finally { await browser.close(); }
