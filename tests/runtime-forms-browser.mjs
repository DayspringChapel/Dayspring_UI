// Optional browser regression, using a local Playwright installation and disposable fixtures.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const { PNG } = require(process.env.DAYSPRING_PNG_MODULE || 'pngjs');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
const api = process.env.DAYSPRING_SMOKE_API;
for (const value of [origin, api]) if (!value || !['127.0.0.1', 'localhost'].includes(new URL(value).hostname)) throw new Error('Use disposable localhost instances.');
const output = process.env.DAYSPRING_QA_OUTPUT; if (output) await mkdir(output, { recursive: true });
const login = await fetch(`${origin}/api/auth/session`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ userNameOrEmail: 'foundation@church.test', password: 'Foundation-local-only-123' }) });
assert.equal(login.status, 200); const rootCookie = login.headers.getSetCookie().find((v) => v.startsWith('__Host-dayspring_session=')).split(';')[0];
async function admin(path, body, method = body ? 'POST' : 'GET') {
    const r = await fetch(`${origin}/api/backend/api/v1/${path}`, { method, headers: { Origin: origin, Cookie: rootCookie, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(r.status, 200, await r.clone().text()); return r.json();
}
const roles = await admin('Roles/manage'); const churches = await admin('churches'); const church = churches.find((c) => c.name === 'DaySpring Chapel');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
try {
    for (const role of ['churchAdmin', 'churchMedia', 'superAdmin']) {
        const suffix = crypto.randomUUID().slice(0, 8); const email = `forms-${role}-${suffix}@church.test`; const password = 'Forms-browser-test-password-123';
        const register = await fetch(`${api}/api/v1/Users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userName: `forms-${role}-${suffix}`, email, password, securityQuestion1: 'Synthetic fixture?', securityAnswer1: 'Local test only' }) });
        assert.equal(register.status, 200, await register.clone().text()); const user = (await register.json()).data;
        await admin(`churches/${church.id}/memberships`, { userId: user.id, roleId: roles.find((r) => r.name === role).id }, 'PUT');
        const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
        await context.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
        const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(`${origin}/admin/login`); await page.getByLabel('Email', { exact: true }).fill(email); await page.getByLabel('Password', { exact: true }).fill(password);
        await page.getByRole('button', { name: /^login$/i }).click(); await page.waitForURL('**/admin/dashboard');
        await page.goto(`${origin}/admin/forms`); await page.getByRole('heading', { name: 'Your form library' }).waitFor();
        if (role === 'churchMedia') {
            await page.getByRole('button', { name: 'Media', exact: true }).click();
            assert.equal(await page.getByRole('button', { name: 'Forms & certificates', exact: true }).getAttribute('aria-expanded'), 'true');
            await page.getByRole('button', { name: 'Media library', exact: true }).click();
            await page.waitForURL('**/admin/media');
            await page.goto(`${origin}/admin/forms`); await page.getByRole('heading', { name: 'Your form library' }).waitFor();
        }
        await page.getByRole('button', { name: /create a form/i }).click(); await page.getByRole('heading', { name: 'Create something meaningful' }).waitFor();
        const title = `Welcome & connection ${role} ${suffix}`;
        await page.getByLabel('Form title', { exact: false }).fill(title);
        await page.getByLabel('Introduction', { exact: true }).fill('We are glad you are here. Share a little about yourself and we will help you find your place in the community.');
        await page.getByRole('button', { name: 'Add a question', exact: false }).first().click();
        await page.getByLabel('Label', { exact: true }).last().fill('Email address');
        await page.getByRole('combobox').last().selectOption('email');
        if (role === 'churchMedia') {
            await page.getByRole('button', { name: 'Preview', exact: true }).click();
            if (output) await page.screenshot({ path: path.join(output, 'forms-studio-desktop.png'), fullPage: true });
            await page.getByRole('button', { name: 'Theme', exact: true }).click();
            await page.getByRole('button', { name: 'Ocean theme', exact: true }).click();
            await page.getByLabel('Background color', { exact: true }).fill('#edf7f0');
            await page.getByLabel('Background pattern').selectOption('Dots');
            const png = new PNG({ width: 200, height: 80 });
            for (let i = 0; i < png.data.length; i += 4) { png.data[i] = 34; png.data[i + 1] = 118; png.data[i + 2] = 140; png.data[i + 3] = 255; }
            await page.getByLabel('Header image', { exact: true }).setInputFiles({ name: 'header.png', mimeType: 'image/png', buffer: PNG.sync.write(png) });
            await page.getByRole('button', { name: 'Remove header image' }).waitFor();
            if (output) await page.screenshot({ path: path.join(output, 'forms-theme-desktop.png'), fullPage: true });
            await page.setViewportSize({ width: 390, height: 844 });
            await page.waitForFunction(() => { const aside = document.querySelector('aside'); return !aside || aside.getBoundingClientRect().right <= 1; });
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'The mobile editor must not overflow.');
            if (output) await page.screenshot({ path: path.join(output, 'forms-theme-mobile.png'), fullPage: true });
            await page.setViewportSize({ width: 1440, height: 1050 });
        }
        await page.getByRole('button', { name: 'Save form', exact: false }).click(); await page.waitForURL(/\/admin\/forms\/[a-f0-9-]{36}$/); await page.goto(`${origin}/admin/forms`); await page.getByRole('heading', { name: 'Your form library' }).waitFor();
        await page.getByLabel('Search forms').fill(title); await page.getByRole('heading', { name: title, exact: true }).waitFor();
        assert.equal(await page.getByText('You do not have access', { exact: false }).count(), 0);
        if (role === 'churchMedia') {
            await page.getByRole('button', { name: `Edit ${title}`, exact: true }).click();
            await page.getByRole('heading', { name: 'Edit your form', exact: true }).waitFor();
            await page.getByRole('button', { name: 'Theme', exact: true }).click();
            await page.getByRole('button', { name: 'Remove header image' }).waitFor();
            assert.equal(await page.getByLabel('Background color', { exact: true }).inputValue(), '#edf7f0');
            await page.getByRole('button', { name: 'Back to forms', exact: true }).click();
            await page.getByRole('heading', { name: 'Your form library' }).waitFor();
        }
        const group = page.getByRole('button', { name: 'Forms & certificates', exact: true });
        assert.equal(await group.getAttribute('aria-expanded'), 'true');
        await group.click(); assert.equal(await group.getAttribute('aria-expanded'), 'false');
        await group.click(); assert.equal(await group.getAttribute('aria-expanded'), 'true');
        assert.equal(await page.getByRole('button', { name: 'Form approvals', exact: true }).count(), 0);
        await page.goto(`${origin}/admin/forms`); await page.getByLabel('Search forms').fill(title); await page.getByRole('heading', { name: title, exact: true }).waitFor();
        if (role === 'churchMedia') {
            const form = (await admin(`forms?search=${encodeURIComponent(title)}`)).items[0];
            const preview = await admin(`forms/${form.id}/preview`);
            assert.equal(preview.settings.appearance.backgroundColor, '#edf7f0');
            assert.equal(preview.settings.appearance.accentColor, '#1d4ed8');
            assert.equal(preview.settings.appearance.backgroundPattern, 'Dots');
            assert.ok(preview.settings.appearance.headerImageDataUrl.startsWith('data:image/png;base64,'));
            await admin(`forms/${form.id}/publication`, { published: true, expectedRevision: form.revision }, 'POST');
            const publicPage = await context.newPage();
            await publicPage.goto(`${origin}/forms/${form.id}`);
            await publicPage.getByRole('heading', { name: title, exact: true }).waitFor();
            assert.equal(await publicPage.locator('[style*="--form-background"]').evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(237, 247, 240)');
            if (output) await publicPage.screenshot({ path: path.join(output, 'forms-public-theme.png'), fullPage: true });
            await publicPage.getByRole('textbox', { name: 'Full name', exact: false }).fill('Theme smoke respondent');
            await publicPage.getByRole('textbox', { name: 'Email address', exact: true }).fill('synthetic@church.test');
            await publicPage.getByRole('button', { name: 'Submit form', exact: true }).click();
            await publicPage.getByRole('heading', { name: 'Your form has been submitted', exact: true }).waitFor();
            await publicPage.close();
        }
        if (output && role === 'churchMedia') {
            await page.getByLabel('Search forms').fill(''); await page.getByRole('heading', { name: title, exact: true }).waitFor();
            await page.screenshot({ path: path.join(output, 'forms-library-desktop.png'), fullPage: true });
            await page.setViewportSize({ width: 390, height: 844 });
            await page.waitForFunction(() => { const aside = document.querySelector('aside'); return !aside || aside.getBoundingClientRect().right <= 1; });
            await page.screenshot({ path: path.join(output, 'forms-library-mobile.png'), fullPage: true, animations: 'disabled' });
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'The page must not overflow horizontally.');
        }
        assert.deepEqual(errors, [], `${role} browser errors`); await context.close();
    }
    console.log('Forms browser regression passed: actual Admin, Media and SuperAdmin sessions can create and save forms; grouped navigation, direct publication, persisted themes/header images, public submission, responsive library and CSP hydration work.');
} finally { await browser.close(); }
