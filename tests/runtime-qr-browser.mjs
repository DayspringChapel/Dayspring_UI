// Optional optical regression. Dependencies are supplied by the local QA runtime.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const { PNG } = require(process.env.DAYSPRING_PNG_MODULE || 'pngjs');
const jsQR = require(process.env.DAYSPRING_QR_MODULE || 'jsqr');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Use disposable localhost instances.');
const login = await fetch(`${origin}/api/auth/session`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ userNameOrEmail: 'foundation@church.test', password: 'Foundation-local-only-123' }) });
assert.equal(login.status, 200);
const cookie = login.headers.getSetCookie().find((value) => value.startsWith('__Host-dayspring_session=')).split(';')[0];
const listing = await fetch(`${origin}/api/backend/api/v1/forms`, { headers: { Cookie: cookie } });
assert.equal(listing.status, 200);
const form = (await listing.json()).items[0]; assert.ok(form, 'Create a synthetic form before QR verification.');
const response = await fetch(`${origin}/api/backend/api/v1/forms/${form.id}/qr`, { headers: { Cookie: cookie } });
assert.equal(response.status, 200); const svg = await response.text();
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    const page = await browser.newPage();
    await page.setContent(`<img alt="Branded form QR" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`);
    const image = page.getByRole('img');
    await image.evaluate((element) => element.decode());
    for (const size of [240, 360, 720]) {
        await image.evaluate((element, pixels) => { element.style.width = `${pixels}px`; element.style.height = `${pixels}px`; }, size);
        const png = PNG.sync.read(await image.screenshot());
        const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
        assert.equal(decoded?.data, `${origin}/forms/${form.id}`, `Branded QR must decode at ${size}px.`);
    }
    console.log('Branded form QR optically decoded to its exact form URL at 240, 360 and 720 pixels.');
} finally { await browser.close(); }
