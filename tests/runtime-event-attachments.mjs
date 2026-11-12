// Disposable browser verification: valid synthetic video, mocked Cloudinary,
// no production credentials or external uploads.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { stat } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN, video = process.env.DAYSPRING_UPLOAD_FIXTURE;
if (!origin || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname) || !video) throw new Error('Use a disposable local UI and synthetic video.');
const bytes = (await stat(video)).size; assert.ok(bytes > 4.5 * 1024 * 1024);
console.log('Launching disposable upload browser.');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
context.setDefaultTimeout(60000);
let current, authorizations = 0, cloudPosts = 0, finalizations = 0, heroFinalizations = 0, cloudFail = true, recordFail = true;
let page;
const errors = [], finalizedBodies = [];
const eventId = crypto.randomUUID(), libraryId = crypto.randomUUID(); let videoTags = 0, eventEdits = 0, videoCreates = 0;
const attachments = [];
const program = { id: eventId, title: 'Synthetic gathering', description: 'Synthetic event', date: new Date(Date.now() + 86400000).toISOString(), isPublished: true, revision: 2 };

try {
    await context.addInitScript(() => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function(key) { return key.startsWith('dayspring_tour_seen_') ? '1' : get.call(this, key); }; });
    await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        const json = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
        if (url.hostname === 'api.cloudinary.com') {
            const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Content-Range, X-Unique-Upload-Id' };
            if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
            assert.equal(request.method(), 'POST'); assert.equal(request.headers().authorization, undefined); assert.equal(request.headers().cookie, undefined);
            cloudPosts++;
            if (cloudFail) { cloudFail = false; return route.fulfill({ status: 500, headers: cors, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Synthetic storage failure. Retry.' } }) }); }
            const range = request.headers()['content-range']; assert.ok(range);
            const match = range.match(/^bytes (\d+)-(\d+)\/(\d+)$/); assert.ok(match); assert.equal(Number(match[3]), bytes);
            const done = Number(match[2]) + 1 === bytes;
            await new Promise(resolve => setTimeout(resolve, 150));
            return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ done, public_id: current.publicId }) });
        }
        if (url.origin !== origin) return route.abort();
        if (url.pathname === '/api/auth/session/activity') return route.fulfill({ status: 204 });
        if (url.pathname === '/api/auth/session') return json({ id: 'synthetic-uploader', userName: 'Media', role: 'churchMedia', permissions: ['CanUploadContent', 'CanViewMediaData', 'CanManageHero', 'CanManageMemoryShort', 'CanManageEvent', 'CanSubmitContent', 'CanReviewContent'], legacyChurch: true });
        const api = url.pathname.toLowerCase();
        if (api.endsWith('/uploads/authorize')) {
            const value = request.postDataJSON(); assert.equal(value.bytes, bytes); assert.equal(value.contentType, 'video/mp4');
            authorizations++; const id = crypto.randomUUID();
            current = { id, uploadUrl: 'https://api.cloudinary.com/v1_1/synthetic/video/upload', apiKey: 'synthetic-public-key', signature: 'synthetic-signature', parameters: { public_id: `dayspring/direct/${id.replaceAll('-', '')}`, overwrite: 'false', timestamp: '1' }, publicId: `dayspring/direct/${id.replaceAll('-', '')}`, expiresAt: new Date(Date.now() + 600000).toISOString(), chunkBytes: 6291456 };
            return json(current);
        }
        if (api.endsWith('/event-programs')) return json({ items: [program], flyers: [], videos: attachments });
        if (api.endsWith(`/event-programs/${eventId}`) && request.method() === 'PATCH') { eventEdits++; assert.match(request.postData(), /Updated synthetic event/); assert.match(request.postData(), /name="Revision"[\s\S]*?2/); return json({ message: 'Program updated and resubmitted.' }); }
        if (api.endsWith(`/event-programs/${eventId}/videos`)) {
            videoTags++; console.log('Attaching event video', videoTags); const body = request.postDataBuffer(); assert.ok(body.length < 20000); assert.ok(!body.toString().includes('filename='));
            const text = body.toString(); assert.match(text, /Trailer/);
            attachments.push({ id: crypto.randomUUID(), eventId, title: `Attached video ${videoTags}`, purpose: 'Trailer', youtubeUrl: text.includes('YoutubeUrl') ? 'https://youtu.be/abcdefghijk' : null, mediaContentId: text.includes('MediaContentId') ? libraryId : null, videoUrl: text.includes('dsupload:') || text.includes('MediaContentId') ? 'https://res.cloudinary.com/synthetic/video/upload/fixture.mp4' : null });
            return json({ message: 'Video attached to the event.' });
        }
        if (api.endsWith('/mediacontent') && request.method() === 'GET') return json({ data: [{ id: libraryId, title: 'Synthetic library video', category: 6, contentType: 2, eventId: crypto.randomUUID(), workflowStatus: 7 }] });
        if (api.endsWith('/mediacontent/upload') && request.method() === 'POST') { videoCreates++; const body = request.postDataBuffer(); assert.ok(body.length < 20000); assert.ok(!body.toString().includes('filename=')); assert.match(body.toString(), /name="ContentType"[\s\S]*?2/); return json({ data: { id: crypto.randomUUID() } }); }
        if (api.endsWith('/mediacontent/uploads') && request.method() === 'POST') {
            finalizations++; const body = request.postDataBuffer(); finalizedBodies.push(body.length); assert.ok(body.length < 20000); assert.match(body.toString(), /dsupload:/); assert.ok(!body.toString().includes('filename='));
            if (recordFail) { recordFail = false; return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Synthetic form validation failed. Update the title and retry.' }) }); }
            return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ status: true, data: [{ id: crypto.randomUUID(), title: 'Synthetic uploaded video' }] }) });
        }
        if (api.endsWith('/site-settings/hero')) {
            if (request.method() === 'PUT') { heroFinalizations++; const body = request.postDataBuffer(); assert.ok(body.length < 20000); assert.match(body.toString(), /dsupload:/); }
            return json({ mode: 0, items: [], rotationSeconds: 8, shuffle: false, constraints: { minWidth: 1280, minHeight: 720, imageFormats: ['JPG', 'PNG', 'WebP'], videoFormats: ['MP4', 'WebM'], imageMaxMb: 10, videoMaxMb: 100, maxImages: 10, aspectRatio: '16:9' } });
        }
        if (url.pathname.startsWith('/api/')) return json([]);
        return route.continue();
    });
    page = await context.newPage(); page.on('pageerror', error => { errors.push(error.message); console.log('Browser error', error.message); }); page.on('request', request => { if (request.url().includes('event-programs')) console.log('Event request', request.method(), new URL(request.url()).pathname); });
    cloudFail = false;
    await page.goto(`${origin}/admin/events`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Event videos' }).click();
    await page.getByLabel('Video purpose').selectOption('Trailer'); await page.getByLabel('Video source').selectOption('library'); await page.getByLabel('Library video').selectOption(libraryId);
    await page.getByRole('button', { name: 'Attach video to event' }).click();
    await page.waitForFunction(() => document.querySelectorAll('form[aria-label="Optional event video"] article').length === 1);
    await page.getByRole('button', { name: 'Attach video to event' }).waitFor({ state: 'visible' });
    console.log('Library video attached without creating normal media.');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel('Video source').selectOption('upload'); await page.getByLabel('Video file').setInputFiles(video);
    await page.getByRole('button', { name: 'Attach video to event' }).click();
    await page.waitForFunction(() => document.querySelectorAll('form[aria-label="Optional event video"] article').length === 2);
    console.log('Large event-only video uploaded on mobile.');
    await page.getByLabel('Video source').selectOption('youtube'); await page.getByLabel('YouTube video link').fill('https://youtu.be/abcdefghijk');
    await page.getByRole('button', { name: 'Attach video to event' }).click();
    await page.waitForFunction(() => document.querySelectorAll('form[aria-label="Optional event video"] article').length === 3);
    assert.equal(videoTags, 3); assert.equal(videoCreates, 0); assert.equal(authorizations, 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    console.log('PASS: one event holds three independent video attachments; 10.6 MB uploaded directly in chunks; no MediaContent upload was created; the mobile layout fits.');
} catch (error) { console.error(error); if (page) console.log(await page.evaluate(() => ({ invalid: [...document.querySelectorAll(':invalid')].map(x => ({ tag: x.tagName, name: x.name, message: x.validationMessage })), alerts: [...document.querySelectorAll('[role=alert]')].map(x => x.textContent), text: document.body.innerText.slice(-3500) }))); console.error(error); throw error; } finally { await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 5000))]); }
