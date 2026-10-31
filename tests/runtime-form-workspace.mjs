// Disposable-local acceptance: real role sessions, drag/sections, collection, creator-issued PDFs.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const { PNG } = require(process.env.DAYSPRING_PNG_MODULE || 'pngjs');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN; const api = process.env.DAYSPRING_SMOKE_API; const output = process.env.DAYSPRING_QA_OUTPUT;
for (const value of [origin, api]) if (!value || !['127.0.0.1', 'localhost'].includes(new URL(value).hostname)) throw new Error('Use synthetic localhost fixtures only.');
if (output) await mkdir(output, { recursive: true });
const rootLogin = await fetch(`${origin}/api/auth/session`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ userNameOrEmail: 'foundation@church.test', password: 'Foundation-local-only-123' }) });
assert.equal(rootLogin.status, 200); const cookie = rootLogin.headers.getSetCookie().find((value) => value.startsWith('__Host-dayspring_session=')).split(';')[0];
async function admin(resource, body, method = body ? 'POST' : 'GET') { const response = await fetch(`${origin}/api/backend/api/v1/${resource}`, { method, headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }); assert.equal(response.status, 200, await response.clone().text()); return response.json(); }
const roles = await admin('Roles/manage'); const church = (await admin('churches')).find((value) => value.name === 'DaySpring Chapel');
const browser = await chromium.launch({ headless: true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath: process.env.DAYSPRING_CHROMIUM } : {}) });
let latestPage;
async function screenshot(page, name) { if (output) await page.screenshot({ path: path.join(output, name), fullPage: true, animations: 'disabled' }); }
async function confirm(page, label) { await page.getByRole('dialog').getByRole('button', { name: label, exact: true }).click(); }
async function pdf(download, artifact) { const bytes = await readFile(await download.path()); assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); if (output && artifact) await writeFile(path.join(output, artifact), bytes); }
try {
    for (const role of ['churchAdmin', 'churchMedia', 'superAdmin']) {
        const suffix = crypto.randomUUID().slice(0, 8); const email = `workspace-${role}-${suffix}@church.test`; const password = 'Workspace-browser-password-123';
        const registration = await fetch(`${api}/api/v1/Users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userName: `workspace-${role}-${suffix}`, email, password, securityQuestion1: 'Test?', securityAnswer1: 'Synthetic local fixture' }) });
        assert.equal(registration.status, 200); const user = (await registration.json()).data;
        await admin(`churches/${church.id}/memberships`, { userId: user.id, roleId: roles.find((item) => item.name === role).id }, 'PUT');
        const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce', timezoneId: 'Africa/Lagos', hasTouch: true });
        await context.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
        const page = await context.newPage(); latestPage = page; const errors = []; page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/admin/login`); await page.getByLabel('Email', { exact: true }).fill(email); await page.getByLabel('Password', { exact: true }).fill(password); await page.getByRole('button', { name: /^login$/i }).click(); await page.waitForURL('**/admin/dashboard');
        await page.goto(`${origin}/admin/forms`); await page.getByRole('button', { name: /create a form/i }).click();
        const title = `Training attendance ${role} ${suffix}`;
        await page.getByLabel('Form title', { exact: false }).fill(title); await page.getByLabel('Introduction', { exact: true }).fill('Complete these short sections to register your training attendance.');
        if (role === 'churchMedia') {
            await page.getByRole('button', { name: /add a question/i }).first().click(); await page.getByLabel('Label', { exact: true }).last().fill('Email address'); await page.getByLabel('Question type').last().selectOption('email');
            await page.getByRole('button', { name: 'Add section', exact: true }).click(); await page.getByLabel('Label', { exact: true }).last().fill('Training details');
            await page.getByRole('button', { name: /add a question/i }).first().click(); await page.getByLabel('Label', { exact: true }).last().fill('Training date'); await page.getByLabel('Question type').last().selectOption('date'); await page.getByLabel('Required', { exact: true }).last().check();
            const summary = (name) => page.locator('details[data-field-key]').filter({ has: page.locator(':scope > summary').filter({ hasText: name }) }).first();
            await page.getByRole('button', { name: 'Drag Email address to reorder', exact: true }).dragTo(summary('Full name').locator(':scope > summary'));
            const labels = () => page.locator('details[data-field-key]>summary').allTextContents();
            assert.ok((await labels())[1].includes('Email address'), 'Desktop drag reorders questions.');
            await page.setViewportSize({ width: 390, height: 844 }); await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1);
            await summary('Email address').scrollIntoViewIfNeeded();
            const source = await page.getByRole('button', { name: 'Drag Full name to reorder', exact: true }).boundingBox(); const target = await summary('Email address').locator(':scope > summary').boundingBox();
            const cdp = await context.newCDPSession(page);
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: source.x + source.width / 2, y: source.y + source.height / 2 }] });
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: target.x + 40, y: target.y + target.height / 2 }] });
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            assert.ok((await labels())[1].includes('Full name'), 'Touch drag reorders questions.'); await cdp.detach();
            await page.setViewportSize({ width: 1440, height: 1050 });
            const section = summary('Training details'); await section.locator(':scope > summary').click(); await section.getByRole('button', { name: 'Move up', exact: true }).click();
            assert.ok((await labels())[0].includes('Training details')); assert.ok((await labels())[1].includes('Training date'), 'Moving a section preserves its questions.');
            await screenshot(page, 'section-builder-desktop.png');
            await page.getByRole('button', { name: 'Theme', exact: true }).click(); await page.getByRole('button', { name: 'Dayspring theme', exact: true }).click();
            await page.getByRole('button', { name: 'Certificate', exact: true }).click(); await page.getByRole('switch').check();
        }
        await page.getByRole('button', { name: 'Save form', exact: true }).click(); await page.waitForURL(/\/admin\/forms\/[a-f0-9-]{36}$/);
        const id = new URL(page.url()).pathname.split('/').at(-1); await page.getByRole('heading', { name: title, exact: true }).waitFor();
        await page.getByRole('button', { name: 'Publish form', exact: true }).click(); await confirm(page, 'Publish form'); await page.getByText('Collecting responses', { exact: true }).waitFor();
        assert.equal((await admin(`administrative-workflows/requests?status=Pending&subjectType=Form&search=${encodeURIComponent(title)}`)).total, 0);
        const respondent = await context.newPage(); await respondent.goto(`${origin}/forms/${id}`); await respondent.getByRole('heading', { name: title, exact: true }).waitFor(); assert.equal(await respondent.getByRole('navigation').count(), 0, 'Respondent page has no church-site navigation.');
        if (role !== 'churchMedia') { await respondent.getByRole('textbox', { name: /Full name/ }).fill('Role acceptance respondent'); await respondent.getByRole('button', { name: 'Submit form', exact: true }).click(); await respondent.getByRole('heading', { name: 'Your form has been submitted' }).waitFor(); await context.close(); continue; }
        await page.getByRole('button', { name: 'Suspend form', exact: true }).click(); await page.getByText('Temporarily suspended', { exact: true }).waitFor(); await respondent.reload(); await respondent.getByText('Response collection is temporarily paused.', { exact: false }).waitFor();
        assert.equal(await respondent.getByRole('button', { name: 'Submit form', exact: true }).count(), 0);
        await page.getByRole('button', { name: 'Resume form', exact: true }).click(); await page.getByText('Collecting responses', { exact: true }).waitFor(); await respondent.reload();
        await respondent.getByRole('button', { name: 'Next section →', exact: true }).click(); assert.ok(await respondent.getByLabel('Training date', { exact: false }).isVisible(), 'Required questions block section navigation.');
        await respondent.getByLabel('Training date', { exact: false }).fill('2026-11-03'); await respondent.getByRole('button', { name: 'Next section →', exact: true }).click(); await respondent.getByRole('textbox', { name: /Full name/ }).fill('Training participant'); await respondent.getByRole('textbox', { name: 'Email address', exact: true }).fill('synthetic@church.test');
        await screenshot(respondent, 'standalone-sections.png'); await respondent.getByRole('button', { name: 'Submit form', exact: true }).click(); await respondent.getByRole('heading', { name: 'Your form has been submitted' }).waitFor();
        const code = await respondent.locator('code').filter({ hasText: /^DS/ }).last().textContent();
        await page.getByRole('tab', { name: 'Responses', exact: true }).click(); await page.locator('details').filter({ hasText: 'Training participant' }).locator(':scope > summary').click(); await page.getByRole('button', { name: 'Confirm attendance', exact: true }).click(); await page.locator('summary').getByText('Attendance confirmed', { exact: true }).waitFor();
        await page.getByRole('tab', { name: 'Analysis', exact: true }).click(); await page.getByRole('heading', { name: 'Total submissions', exact: true }).waitFor();
        await page.getByRole('tab', { name: 'Certificates', exact: true }).click(); await page.getByRole('heading', { name: 'Certificate design', exact: true }).waitFor();
        const png = new PNG({ width: 840, height: 595 }); for (let i = 0; i < png.data.length; i += 4) { png.data[i] = 250; png.data[i + 1] = 247; png.data[i + 2] = 240; png.data[i + 3] = 255; }
        await page.getByLabel('Certificate background (PDF, PNG or JPEG)', { exact: true }).setInputFiles({ name: 'training.png', mimeType: 'image/png', buffer: PNG.sync.write(png) });
        await page.getByRole('button', { name: 'Save template', exact: true }).click(); await page.getByRole('button', { name: 'Preview template PDF', exact: true }).waitFor();
        const preview = page.waitForEvent('download'); await page.getByRole('button', { name: 'Preview template PDF', exact: true }).click(); await pdf(await preview);
        await page.getByLabel('Who should receive a certificate?', { exact: false }).selectOption('Approved'); await page.getByRole('button', { name: 'Prepare certificates', exact: true }).click(); await page.getByRole('button', { name: 'Issue 1 certificates', exact: true }).waitFor({ timeout: 60000 });
        const draftDownload = page.waitForEvent('download'); await page.getByRole('button', { name: 'Review PDF', exact: true }).click(); await pdf(await draftDownload);
        await page.getByLabel('I reviewed the prepared certificates and recipient list.', { exact: true }).check(); await screenshot(page, 'training-certificates-desktop.png');
        await page.getByRole('button', { name: 'Issue 1 certificates', exact: true }).click(); await confirm(page, 'Issue certificates'); await page.getByText('Certificates issued. Participants', { exact: false }).waitFor();
        const actualDownload = respondent.waitForEvent('download'); await respondent.getByRole('button', { name: 'Download my certificate', exact: true }).click(); await pdf(await actualDownload, 'issued-training-certificate.pdf');
        const scoped = await fetch(`${origin}/api/backend/api/v1/forms/${id}/certificates`, { headers: { Cookie: cookie } }); assert.equal(scoped.status, 403, 'Another creator cannot use this form’s certificate authority.');
        await page.getByRole('tab', { name: 'Share & settings', exact: true }).click(); const past = new Date(Date.now() - 600000); const inputValue = new Date(past.getTime() + 3600000).toISOString().slice(0, 16);
        await page.getByLabel('Stop collecting', { exact: true }).fill(inputValue); await page.getByRole('button', { name: 'Save collection settings', exact: true }).click(); await page.getByText('Collection period ended', { exact: true }).waitFor(); await respondent.goto(`${origin}/forms/${id}`); await respondent.getByText('This form is no longer collecting responses.', { exact: false }).waitFor();
        await page.getByLabel('Stop collecting', { exact: true }).fill(''); await page.getByLabel('Enable basic response analysis', { exact: true }).uncheck(); await page.getByRole('button', { name: 'Save collection settings', exact: true }).click(); await page.getByText('Collecting responses', { exact: true }).waitFor();
        await page.getByRole('tab', { name: 'Analysis', exact: true }).click(); await page.getByRole('heading', { name: 'Analysis is switched off' }).waitFor();
        await page.getByRole('button', { name: 'Stop collecting', exact: true }).click(); await confirm(page, 'Stop collecting'); await page.getByText('Collection stopped', { exact: true }).waitFor();
        for (const width of [320, 390, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); if (width <= 1024) await page.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Workspace must fit ${width}px.`); }
        await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('tab', { name: 'Overview', exact: true }).click(); await screenshot(page, 'form-workspace-mobile.png');
        assert.deepEqual(errors, []); assert.ok(code); await context.close();
    }
    console.log('Creator form acceptance passed: three roles publish directly; desktop/touch drag, section navigation/validation, standalone pages, pause/stop/date controls, optional analysis, Media-owned template generation/review/issuance and private PDF retrieval work.');
} catch (error) { if (latestPage && !latestPage.isClosed()) await screenshot(latestPage, 'failure.png'); throw error; }
finally { await browser.close(); }
