// Run only against disposable local instances and synthetic bootstrap credentials.
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
const api = process.env.DAYSPRING_SMOKE_API;
for (const value of [origin, api]) if (!value || !['127.0.0.1', 'localhost'].includes(new URL(value).hostname)) throw new Error('Use disposable localhost instances.');
const password = 'Certificate-local-test-123';
async function login(email, secret = password) {
    const r = await fetch(`${origin}/api/auth/session`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ userNameOrEmail: email, password: secret }) });
    assert.equal(r.status, 200, await r.clone().text());
    return r.headers.getSetCookie().find((v) => /(?:^|__)dayspring_session=/.test(v) || v.startsWith('__Host-dayspring_session=')).split(';')[0];
}
async function call(path, cookie, body, method = body === undefined ? 'GET' : 'POST', extra = {}) {
    const r = await fetch(`${origin}/api/backend/api/v1/${path}`, { method, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...extra }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    return r;
}
async function ok(path, cookie, body, method, extra) { const r = await call(path, cookie, body, method, extra); assert.equal(r.status, 200, `${path}: ${await r.clone().text()}`); const text = await r.text(); try { return JSON.parse(text); } catch { return text; } }
const root = await login('foundation@church.test', 'Foundation-local-only-123');
const suffix = crypto.randomUUID().slice(0, 8);
async function user(name, permissions) {
    const email = `${name}-${suffix}@church.test`;
    const reg = await fetch(`${api}/api/v1/Users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userName: `${name}-${suffix}`, email, password, securityQuestion1: 'Synthetic fixture?', securityAnswer1: 'Local-only fixture' }) });
    assert.equal(reg.status, 200, await reg.clone().text());
    const role = await ok('Roles/create', root, { name: `${name}-${suffix}`, permissions });
    await ok('Roles/assign-role', root, { userEmail: email, roleName: role.name });
    return { cookie: await login(email), id: (await reg.json()).data.id, roleId: role.id };
}
const uploader = await user('os-uploader', ['forms.create', 'forms.edit', 'forms.publish', 'forms.responses.view', 'forms.responses.review', 'forms.responses.export', 'forms.analytics.view', 'forms.submit_for_approval', 'certificates.generate', 'certificates.records.view', 'certificates.templates.create', 'certificates.templates.edit', 'approvals.view']);
const reviewer = await user('os-reviewer', ['forms.approve', 'approvals.view', 'approvals.act', 'certificates.approve', 'certificates.issue', 'certificates.revoke', 'certificates.records.view']);
const definition = { title: `OS training ${suffix}`, description: 'Synthetic end-to-end test', attachCertificate: true, fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'rating', label: 'Rating', type: 'rating', required: true, minimum: 1, maximum: 5 }], settings: { requireApproval: true, showOnWebsite: true, timeZone: 'Africa/Lagos', accessMode: 'Public' } };
let form = await ok('forms', uploader.cookie, definition, 'POST', { 'Idempotency-Key': crypto.randomUUID() });
assert.equal((await call(`forms/${form.id}/submit-for-approval`, uploader.cookie, { expectedRevision: form.revision })).status, 409);
form = await ok(`forms/${form.id}/publication`, uploader.cookie, { expectedRevision: form.revision, published: true });
const key = crypto.randomUUID(); const answers = { formRevision: form.revision, answers: { name: 'Synthetic OS Recipient', rating: '5' } };
const receipt = await ok(`forms/${form.id}/submissions`, null, answers, 'POST', { 'Idempotency-Key': key });
assert.equal((await ok(`forms/${form.id}/submissions`, null, answers, 'POST', { 'Idempotency-Key': key })).reference, receipt.reference);
const analytics = await ok(`forms/${form.id}/analytics`, uploader.cookie);
assert.equal(analytics.total, 1); assert.equal(analytics.fields.find((f) => f.key === 'rating').numbers.average, 5);
const exportResponse = await call(`forms/${form.id}/export`, uploader.cookie); assert.equal(exportResponse.status, 200);
const xlsx = await exportResponse.arrayBuffer(); assert.equal(new Uint8Array(xlsx)[0], 80);
const qr = await call(`forms/${form.id}/qr`, uploader.cookie); assert.equal(qr.status, 200); assert.equal((await qr.text()).includes('#f58634'), true);
await ok(`forms/${form.id}/submissions/${receipt.reference}/review`, uploader.cookie, { expectedRevision: 1, status: 'Approved', comment: 'Completed' });
const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' }); pdf.setDrawColor(217, 117, 44); pdf.setLineWidth(3); pdf.rect(24, 24, 794, 547); pdf.setTextColor(20, 38, 59); pdf.setFontSize(30); pdf.text('CERTIFICATE OF COMPLETION', 421, 160, { align: 'center' });
const templateData = new FormData(); templateData.append('name', `Training ${suffix}`); templateData.append('file', new File([pdf.output('arraybuffer')], 'template.pdf', { type: 'application/pdf' }));
templateData.append('fields', JSON.stringify([{ key: 'recipient_name', label: 'Recipient name', x: 50, y: 46, fontSize: 30, color: '#14263b', align: 'Center', font: 'DejaVu Sans' }, { key: 'programme', label: 'Programme', x: 50, y: 60, fontSize: 20, color: '#14263b', align: 'Center', font: 'DejaVu Sans' }, { key: 'verification_qr', label: 'Verify', x: 80, y: 72, fontSize: 24, color: '#14263b', align: 'Left', font: 'DejaVu Sans' }]));
const templateResponse = await fetch(`${origin}/api/backend/api/v1/certificate-management/templates`, { method: 'POST', headers: { Origin: origin, Cookie: uploader.cookie }, body: templateData });
assert.equal(templateResponse.status, 200, await templateResponse.clone().text()); const template = await templateResponse.json();
const importData = new FormData(); importData.append('file', new File([xlsx], 'recipients.xlsx'));
const imported = await fetch(`${origin}/api/backend/api/v1/certificate-management/imports/preview`, { method: 'POST', headers: { Origin: origin, Cookie: uploader.cookie }, body: importData });
assert.equal(imported.status, 200); assert.equal((await imported.json()).rows.length, 1);
const batchRequest = { templateId: template.id, title: 'Training completion', formId: form.id, mappings: { recipient_name: ['name'] }, reviewStatus: 'Approved', operationKey: crypto.randomUUID() };
const created = await ok('certificate-management/batches/from-form', uploader.cookie, batchRequest);
assert.equal((await ok('certificate-management/batches/from-form', uploader.cookie, batchRequest)).batch.id, created.batch.id);
assert.equal((await call(`certificate-management/batches/${created.batch.id}/issue`, reviewer.cookie, { expectedRevision: created.batch.revision })).status, 409);
let detail;
const deadline = Date.now() + 90000;
while (Date.now() < deadline) { detail = await ok(`certificate-management/batches/${created.batch.id}`, uploader.cookie); if (detail.batch.status === 'Generated') break; if (detail.job.status === 'Failed') throw new Error(detail.job.error); await new Promise((resolve) => setTimeout(resolve, 1000)); }
assert.equal(detail.batch.status, 'Generated', 'Start a standalone Worker-mode instance to process the durable job.');
const batchApproval = await ok(`certificate-management/batches/${detail.batch.id}/submit-for-approval`, uploader.cookie, { expectedRevision: detail.batch.revision });
await ok(`administrative-workflows/requests/${batchApproval.id}/decision`, reviewer.cookie, { expectedRevision: 1, decision: 'Approve', comment: 'Synthetic certificates reviewed' });
await ok(`certificate-management/batches/${detail.batch.id}/issue`, reviewer.cookie, { expectedRevision: detail.batch.revision });
const issued = await ok(`certificate-management/batches/${detail.batch.id}/issue`, reviewer.cookie, { expectedRevision: detail.batch.revision });
const certificate = issued.items[0];
assert.equal((await ok(`certificate-management/verify/${certificate.verificationToken}`, null)).valid, true);
const download = await call('certificates/retrieve', null, { code: receipt.certificateCode }); assert.equal(download.status, 200);
assert.equal(download.headers.get('content-type').includes('application/pdf'), true);
await ok(`certificate-management/records/${certificate.id}/revoke`, reviewer.cookie, { expectedRevision: certificate.revision, reason: 'Synthetic test revocation' });
assert.equal((await ok(`certificate-management/verify/${certificate.verificationToken}`, null)).valid, false);
assert.equal((await call('certificates/retrieve', null, { code: receipt.certificateCode })).status, 410);
// Cross-church resource access must fail even for the same old session after context selection.
const otherChurch = await ok('churches', root, { name: `Other church ${suffix}`, color: '#d9752c' });
const otherCookie = `${root}; dayspring_church=${otherChurch.id}`;
assert.equal((await call(`forms/${form.id}/submissions`, otherCookie)).status, 404);
assert.equal((await call(`certificate-management/batches/${created.batch.id}`, otherCookie)).status, 404);
assert.equal((await call('Users/get-all', otherCookie)).status, 403);
// Existing token permissions are replaced by current database permissions.
await ok(`Roles/${uploader.roleId}/update`, root, { name: `os-uploader-${suffix}`, permissions: [] }, 'PUT');
assert.equal((await call(`forms/${form.id}/analytics`, uploader.cookie)).status, 403);
const loginPage = await fetch(`${origin}/admin/login`); const csp = loginPage.headers.get('content-security-policy'); const html = await loginPage.text();
assert.ok(csp?.includes("'strict-dynamic'")); assert.ok(/nonce="[A-Za-z0-9+/=]+"/.test(html));
console.log('OS runtime smoke passed: direct creator publication, persistence/replay, SQL analytics, XLSX export/import, branded QR, PDF template rendering, durable standalone-worker generation, batch approval/issuance, private form-code delivery, revocation, cross-church isolation, permission revocation and nonce CSP.');
