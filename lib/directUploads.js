const receiptCache = new WeakMap();
export const UPLOAD_PROGRESS_EVENT = 'dayspring:upload-progress';
export function supportsDirectUploads(path, method) {
    path = path.toLowerCase().replace(/\/$/, ''); method = method.toUpperCase();
    return method === 'PUT' && path === '/api/v1/site-settings/hero' || method === 'POST' && (['/api/v1/mediacontent/upload', '/api/v1/mediacontent/uploads', '/api/v1/mediacontent/memory-shorts/uploads', '/api/v1/sermons/create', '/api/v1/event-programs'].includes(path) || /^\/api\/v1\/event-programs\/[a-f0-9-]{36}\/flyer$/.test(path)) || method === 'PATCH' && /^\/api\/v1\/mediacontent\/[a-f0-9-]{36}\/update$/.test(path);
}

export function reportUpload(detail) {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(UPLOAD_PROGRESS_EVENT, { detail }));
}

function xhrUpload(url, form, headers, progress) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest(); request.open('POST', url); request.timeout = 180000;
        Object.entries(headers).forEach(([name, value]) => request.setRequestHeader(name, value));
        request.upload.onprogress = event => { if (event.lengthComputable) progress(event.loaded / event.total); };
        request.onerror = () => reject(new Error('Upload connection was interrupted. Check your connection and try again.'));
        request.ontimeout = () => reject(new Error('The upload timed out. Check your connection and try again.'));
        request.onload = () => {
            let value; try { value = JSON.parse(request.responseText); } catch { reject(new Error('The upload provider returned an invalid response.')); return; }
            if (request.status < 200 || request.status >= 300) { reject(new Error(value.error?.message || `The upload provider rejected the file (${request.status}).`)); return; }
            resolve(value);
        };
        request.send(form);
    });
}

export async function uploadToCloudinary(file, grant, progress, transport = xhrUpload) {
    const target = new URL(grant.uploadUrl);
    if (target.protocol !== 'https:' || target.hostname !== 'api.cloudinary.com' || !/^\/v1_1\/[^/]+\/(?:image|video)\/upload$/.test(target.pathname)) throw new Error('Invalid upload destination.');
    const chunked = target.pathname.includes('/video/') && file.size > grant.chunkBytes;
    const size = chunked ? grant.chunkBytes : file.size;
    if (!Number.isSafeInteger(size) || size <= 0 || chunked && size < 5 * 1024 * 1024) throw new Error('Invalid upload chunk size.');
    const uploadId = crypto.randomUUID();
    for (let start = 0; start < file.size; start += size) {
        const end = Math.min(start + size, file.size), form = new FormData();
        Object.entries(grant.parameters).forEach(([name, value]) => form.append(name, String(value)));
        form.append('api_key', grant.apiKey); form.append('signature', grant.signature);
        form.append('file', file.slice(start, end), file.name);
        const headers = chunked ? { 'X-Unique-Upload-Id': uploadId, 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` } : {};
        const response = await transport(target.href, form, headers, ratio => progress(Math.min(file.size, start + (end - start) * ratio)));
        if (end === file.size && (response.done === false || response.public_id !== grant.publicId)) throw new Error('The video upload did not finish. Please retry.');
        progress(end);
    }
}

export async function prepareDirectUploads(form, path, method, authorize, owner = '', transport) {
    const entries = [...form.entries()], files = entries.filter(([, value]) => value instanceof Blob && value.size > 0);
    if (!files.length || !supportsDirectUploads(path, method)) return { form, active: false, complete() {}, invalidate() {} };
    if (files.length > 50) throw new Error('Upload up to 50 files at a time.');
    const context = Object.fromEntries(entries.filter(([key, value]) => ['category', 'contenttype', 'mode'].includes(key.toLowerCase()) && typeof value === 'string').map(([key, value]) => [key.toLowerCase(), value]));
    const total = files.reduce((sum, [, file]) => sum + file.size, 0), id = crypto.randomUUID(); let sent = 0;
    const output = new FormData(), used = [];
    const publish = (phase, name, percent) => reportUpload({ id, phase, name, percent: Math.round(percent) });
    for (const [field, value] of entries) {
        if (!(value instanceof Blob)) { output.append(field, value); continue; }
        if (!value.size) throw new Error('An uploaded file is empty.');
        const key = JSON.stringify([owner, path.toLowerCase(), method, field.toLowerCase(), context]);
        let cache = receiptCache.get(value); if (!cache) { cache = new Map(); receiptCache.set(value, cache); }
        let item = cache.get(key);
        if (!item || Date.parse(item.grant.expiresAt) <= Date.now()) {
            publish('authorizing', value.name, sent / total * 95);
            let grant;
            const extension = value.name.split('.').at(-1).toLowerCase();
            const mime = value.type || ({ mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' })[extension] || '';
            try { grant = await authorize({ path, method, field, fileName: value.name, contentType: mime, bytes: value.size, context }); }
            catch (error) { if (error.message?.includes('404')) throw new Error('Large uploads require the backend direct-upload update. Deploy it first.'); throw error; }
            item = { grant, uploaded: false }; cache.set(key, item);
        }
        if (!item.uploaded) {
            await uploadToCloudinary(value, item.grant, bytes => publish('uploading', value.name, (sent + bytes) / total * 95), transport);
            item.uploaded = true;
        }
        sent += value.size; output.append(field, `dsupload:${item.grant.id}`); used.push({ cache, key });
    }
    publish('saving', files.length === 1 ? files[0][1].name : `${files.length} files`, 95);
    return {
        form: output, active: true,
        complete() { used.forEach(({ cache, key }) => cache.delete(key)); publish('complete', 'Upload saved', 100); },
        invalidate() { used.forEach(({ cache, key }) => cache.delete(key)); },
        fail(message) { reportUpload({ id, phase: 'error', name: message, percent: 0 }); }
    };
}
