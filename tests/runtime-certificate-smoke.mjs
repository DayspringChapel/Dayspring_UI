// Run only against migrated disposable localhost instances with synthetic fixture users.
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
const api = process.env.DAYSPRING_SMOKE_API;
for (const value of [origin, api]) {
    if (!value || !['127.0.0.1', 'localhost'].includes(new URL(value).hostname))
        throw new Error('Certificate smoke tests require disposable localhost instances.');
}
const headers = { Origin: origin, 'Content-Type': 'application/json' };
async function login(email) {
    const response = await fetch(`${origin}/api/auth/session`, { method: 'POST', headers,
        body: JSON.stringify({ userNameOrEmail: email, password: 'Certificate-local-test-123' }) });
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie').split(';')[0];
}
async function request(path, body, cookie, method = 'POST', extra = {}) {
    return fetch(`${origin}/api/backend/api/v1/${path}`, { method,
        headers: { ...headers, ...(cookie ? { Cookie: cookie } : {}), ...extra },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
assert.equal((await fetch(`${api}/health/ready`)).status, 200);
const uploader = await login('certificate-uploader@church.test');
const approver = await login('certificate-approver@church.test');
try {
    const definition = { title: `Certificate flow ${crypto.randomUUID().slice(0, 8)}`, description: 'Synthetic runtime test', attachCertificate: true,
        fields: [{ key: 'name', label: 'Full name', type: 'text', required: true }, { key: 'email', label: 'Email', type: 'email', required: true }] };
    const create = await request('forms', definition, uploader);
    assert.equal(create.status, 200);
    let form = await create.json();
    const publish = await request(`forms/${form.id}/publication`, { published: true, expectedRevision: form.revision }, uploader);
    assert.equal(publish.status, 200);
    form = await publish.json();
    const body = { formRevision: form.revision, answers: { name: 'Synthetic Recipient', email: 'recipient@example.test' } };
    const key = crypto.randomUUID();
    const submit = () => request(`forms/${form.id}/submissions`, body, null, 'POST', { 'Idempotency-Key': key });
    const completion = await submit();
    assert.equal(completion.status, 200);
    assert.equal(completion.headers.get('cache-control'), 'no-store');
    const receipt = await completion.json();
    assert.equal(receipt.certificateCode.startsWith('DS-'), true);
    assert.equal(receipt.certificateCode.length, 42);
    assert.equal((await (await submit()).json()).certificateCode === receipt.certificateCode, true);
    const retrieve = () => request('certificates/retrieve', { code: receipt.certificateCode });
    assert.equal((await retrieve()).status, 202);
    assert.equal((await request('certificates/retrieve', { code: 'not-a-code' })).status, 404);
    const doc = new jsPDF();
    doc.text('Synthetic certificate for a local integration test', 20, 30);
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    const data = new FormData();
    data.set('file', new Blob([bytes], { type: 'application/pdf' }), 'recipient.pdf');
    const upload = await fetch(`${origin}/api/backend/api/v1/forms/${form.id}/submissions/${receipt.reference}/certificate`, {
        method: 'POST', headers: { Origin: origin, Cookie: uploader }, body: data,
    });
    assert.equal(upload.status, 200);
    let certificate = await upload.json();
    assert.equal((await request(`certificates/${certificate.id}/preview`, undefined, null, 'GET')).status, 401);
    assert.equal((await request(`certificates/${certificate.id}/approve`, { expectedRevision: certificate.revision }, uploader)).status, 403);
    const approval = await request(`certificates/${certificate.id}/approve`, { expectedRevision: certificate.revision }, approver);
    assert.equal(approval.status, 200);
    certificate = await approval.json();
    assert.equal((await retrieve()).status, 202);
    assert.equal((await request(`certificates/${certificate.id}/issue`, { expectedRevision: certificate.revision }, uploader)).status, 403);
    const approvedRevision = certificate.revision;
    const issue = await request(`certificates/${certificate.id}/issue`, { expectedRevision: approvedRevision }, approver);
    assert.equal(issue.status, 200);
    certificate = await issue.json();
    const replay = await request(`certificates/${certificate.id}/issue`, { expectedRevision: approvedRevision }, approver);
    assert.equal(replay.status, 200);
    assert.equal((await replay.json()).issuedAt, certificate.issuedAt);
    const pdf = await retrieve();
    assert.equal(pdf.status, 200);
    assert.equal(pdf.headers.get('cache-control'), 'no-store');
    assert.equal(pdf.headers.get('content-type').includes('application/pdf'), true);
    assert.equal(Buffer.from(await pdf.arrayBuffer()).equals(Buffer.from(bytes)), true);
    const responses = await request(`forms/${form.id}/submissions`, undefined, uploader, 'GET');
    const rows = await responses.json();
    assert.equal(rows.items.length, 1);
    assert.equal(rows.items[0].certificate.status, 'Issued');
    assert.equal(rows.items[0].certificateCode, undefined);
    const disabled = await request(`forms/${form.id}`, { ...definition, attachCertificate: false, expectedRevision: form.revision }, uploader, 'PUT');
    assert.equal(disabled.status, 200);
    form = await disabled.json();
    const without = await request(`forms/${form.id}/submissions`, { formRevision: form.revision, answers: { name: 'Second recipient', email: 'second@example.test' } },
        null, 'POST', { 'Idempotency-Key': crypto.randomUUID() });
    assert.equal(without.status, 200);
    assert.equal((await without.json()).certificateCode, null);
    assert.equal((await retrieve()).status, 200); // Existing codes survive the toggle changing.
    const revoked = await request(`certificates/${certificate.id}/revoke`, { expectedRevision: certificate.revision, reason: 'Synthetic test revocation' }, approver);
    assert.equal(revoked.status, 200);
    assert.equal((await retrieve()).status, 410);
    const page = await fetch(`${origin}/certificates/download`);
    assert.equal(page.status, 200);
    assert.equal((await page.text()).includes('Certificate download code'), true);
    console.log('Certificate runtime smoke passed: admin toggle, persisted completion code, replay, private PDF upload, approval/issuance permissions, exact PDF retrieval, toggle-off behavior and revocation.');
} finally {
    for (const cookie of [uploader, approver]) await fetch(`${origin}/api/auth/session`, { method: 'DELETE', headers: { Origin: origin, Cookie: cookie } });
}
