import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { formFields, retrieveCertificate } from '../lib/formCertificates.js';

afterEach(() => mock.restoreAll());

test('form versions preserve older field definitions', () => {
    assert.deepEqual(formFields({ fieldsJson: JSON.stringify([{ Key: 'name', Label: 'Original name', Type: 'text', Required: true }]) }),
        [{ key: 'name', label: 'Original name', type: 'text', required: true, options: [] }]);
});

test('certificate code is sent in the POST body and not exposed in a URL', async () => {
    const code = 'DS-PRIVATE-CODE';
    mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(url, '/api/backend/api/v1/certificates/retrieve');
        assert.equal(url.includes(code), false);
        assert.equal(options.method, 'POST');
        assert.equal(options.cache, 'no-store');
        assert.equal(JSON.parse(options.body).code, code);
        return new Response('%PDF-1.4\n%%EOF', { headers: { 'Content-Type': 'application/pdf' } });
    });
    const result = await retrieveCertificate(code);
    assert.equal(result.status, 'Issued');
    assert.equal(result.file.type, 'application/pdf');
});

test('pending preparation is shown instead of a fake or premature download', async () => {
    mock.method(globalThis, 'fetch', async () => Response.json({ status: 'Pending', message: 'Awaiting approval' }, { status: 202 }));
    assert.deepEqual(await retrieveCertificate('code'), { status: 'Pending', message: 'Awaiting approval' });
});

test('revocation and invalid codes do not return a file', async () => {
    for (const status of [404, 410]) {
        mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Certificate unavailable' }, { status }));
        await assert.rejects(retrieveCertificate('code'), (error) => error.status === status);
        mock.restoreAll();
    }
});
