import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSafeProxyUpload, supportsDirectUploads, uploadToCloudinary, prepareDirectUploads } from '../lib/directUploads.js';

function grant() {
    const id = crypto.randomUUID();
    return { id, uploadUrl: 'https://api.cloudinary.com/v1_1/synthetic/video/upload', apiKey: 'public-fixture-key', signature: 'synthetic-signature', publicId: `dayspring/direct/${id.replaceAll('-', '')}`, parameters: { timestamp: '1', overwrite: 'false' }, chunkBytes: 6 * 1024 * 1024, expiresAt: new Date(Date.now() + 600000).toISOString() };
}
const file = (mb, name = 'fixture.mp4') => new File([new Uint8Array(mb * 1024 * 1024)], name, { type: 'video/mp4' });
const form = (...files) => { const result = new FormData(); result.append('title', 'Community training'); result.append('category', '5'); result.append('contentType', '2'); files.forEach(value => result.append('files', value)); return result; };

test('only supported public-media endpoints use Cloudinary; private uploads stay on their existing path', () => {
    assert.equal(supportsDirectUploads('/api/v1/MediaContent/uploads', 'POST'), true);
    assert.equal(supportsDirectUploads('/api/v1/site-settings/hero', 'PUT'), true);
    assert.equal(supportsDirectUploads('/api/v1/Sermons/create', 'POST'), true);
    assert.equal(supportsDirectUploads('/api/v1/forms/private-files', 'POST'), false);
    assert.equal(supportsDirectUploads('/api/v1/MediaContent/uploads', 'GET'), false);
});

test('large videos go to Cloudinary in ranged chunks with one upload id and no application credential', async () => {
    const video = file(13), ticket = grant(), requests = [], progress = [];
    await uploadToCloudinary(video, ticket, value => progress.push(value), async (url, body, headers, notify) => {
        requests.push({ url, bytes: body.get('file').size, headers }); notify(1);
        assert.equal(body.get('api_key'), ticket.apiKey); assert.equal(body.get('signature'), ticket.signature);
        assert.equal(headers.Authorization, undefined);
        return { done: requests.length === 3, public_id: ticket.publicId };
    });
    assert.deepEqual(requests.map(value => value.bytes), [6, 6, 1].map(value => value * 1024 * 1024));
    assert.equal(new Set(requests.map(value => value.headers['X-Unique-Upload-Id'])).size, 1);
    assert.equal(requests[2].headers['Content-Range'], `bytes ${12 * 1024 * 1024}-${video.size - 1}/${video.size}`);
    assert.equal(progress.at(-1), video.size);
});

test('only small references and form fields reach the app; retries reuse uploaded assets', async () => {
    const body = form(file(7)); let signatures = 0, chunks = 0;
    const authorize = async payload => { signatures++; assert.equal(payload.context.category, '5'); assert.equal(payload.bytes, 7 * 1024 * 1024); return grant(); };
    let current;
    const sign = async payload => { current = await authorize(payload); return current; };
    const transport = async () => { chunks++; return { done: true, public_id: current.publicId }; };
    const first = await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner', transport);
    assert.equal([...first.form.values()].some(value => value instanceof Blob), false);
    assert.match(first.form.get('files'), /^dsupload:/); assert.equal(first.form.get('title'), 'Community training');
    const second = await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner', transport);
    assert.equal(signatures, 1); assert.equal(chunks, 2);
    assert.equal(first.form.get('files'), second.form.get('files'));
    second.complete();
    await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner', transport);
    assert.equal(signatures, 2);
});

test('owner or source-setting changes cannot reuse a previous upload authorization', async () => {
    const body = form(file(1)); let current, signatures = 0;
    const sign = async () => { signatures++; current = grant(); return current; };
    const transport = async () => ({ public_id: current.publicId });
    await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner1', transport);
    await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner2', transport);
    body.set('category', '6');
    await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner2', transport);
    assert.equal(signatures, 3);
});

test('unsigned or arbitrary upload destinations and incomplete provider responses are rejected', async () => {
    await assert.rejects(() => uploadToCloudinary(file(1), { ...grant(), uploadUrl: 'https://untrusted.test/upload' }, () => {}), /Invalid upload destination/);
    await assert.rejects(() => uploadToCloudinary(file(1), grant(), () => {}, async () => ({ done: false })), /did not finish/);
});

test('unsupported large proxy uploads fail locally instead of sending a Vercel 413 request', () => {
    assert.throws(() => assertSafeProxyUpload(form(file(7))), /website proxy/);
    const metadata = new FormData(); metadata.append('File', 'dsupload:synthetic'); assert.doesNotThrow(() => assertSafeProxyUpload(metadata));
    assert.equal(supportsDirectUploads('/api/v1/event-programs/11111111-1111-1111-1111-111111111111/videos', 'POST'), true);
});

test('an invalid signature discards the cached grant so a retry gets a fresh authorization', async () => {
    const body = form(file(1)); let current, signatures = 0;
    const sign = async () => { signatures++; current = grant(); return current; };
    await assert.rejects(() => prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner', async () => { const error = new Error('Invalid Signature'); error.status = 401; throw error; }), /Invalid Signature/);
    await prepareDirectUploads(body, '/api/v1/MediaContent/uploads', 'POST', sign, 'owner', async () => ({ public_id: current.publicId }));
    assert.equal(signatures, 2);
});
