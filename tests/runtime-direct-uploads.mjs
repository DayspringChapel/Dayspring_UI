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

    console.log('Opening next upload workspace.');

    await page.goto(`${origin}/admin/media/create`, { waitUntil: 'domcontentloaded' });

    await page.locator('select').first().selectOption('5'); await page.getByLabel('Upload Video File', { exact: true }).check();

    await page.locator('#file-input').setInputFiles(video); await page.locator('input[name="title"]').fill('Synthetic service recording'); await page.locator('textarea[name="description"]').fill('Synthetic video for local upload acceptance.');

    const upload = page.getByRole('button', { name: 'Upload Media', exact: true });

    await upload.click(); await page.getByText('Synthetic storage failure. Retry.', { exact: true }).first().waitFor();

    assert.equal(finalizations, 0);

    await upload.click(); await page.getByText('Synthetic form validation failed. Update the title and retry.', { exact: true }).first().waitFor();

    const beforeRetry = cloudPosts;

    await page.locator('input[name="title"]').fill('Corrected synthetic service recording'); await upload.click();

    await page.waitForURL('**/admin/media'); assert.equal(cloudPosts, beforeRetry, 'A metadata retry must reuse the already uploaded asset.');

    assert.equal(authorizations, 1); assert.equal(finalizations, 2);

    console.log('Opening next upload workspace.');

    await page.goto(`${origin}/admin/settings`, { waitUntil: 'domcontentloaded' }); await page.getByLabel(/^Mode/).selectOption('1');

    await page.getByLabel('Upload new video', { exact: false }).setInputFiles(video);

    await page.getByText(/direct-upload-fixture\.mp4: 1280.*720/).waitFor();

    await page.getByRole('button', { name: 'Save Hero', exact: true }).click(); await page.getByText('Hero settings saved.', { exact: true }).waitFor();

    assert.equal(heroFinalizations, 1); assert.equal(authorizations, 2);

    await page.getByRole('status').filter({ hasText: 'Upload saved' }).waitFor();

    assert.deepEqual(errors, []);

    console.log(`PASS: ${bytes}-byte video uploads straight to Cloudinary in chunks; all Vercel finalization requests are under 20 KB; storage and metadata failures retry safely; media and hero paths preserve progress and existing forms.`);

    console.log(`Finalization request sizes: ${finalizedBodies.join(', ')} bytes.`);

} catch (error) { console.error(error); throw error; } finally { await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 5000))]); }
