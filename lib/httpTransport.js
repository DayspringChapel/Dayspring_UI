const READ_METHODS = new Set(['GET', 'HEAD']);
const RETRYABLE_READ_STATUSES = new Set([429, 502, 503, 504]);

function delay(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason);
        const abort = () => { clearTimeout(timer); reject(signal.reason); };
        const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
        signal?.addEventListener('abort', abort, { once: true });
    });
}

export async function fetchWithReadRetry(url, options = {}, { maxRetries = 3, timeoutMs = 30000, retryRateLimited = true, wait = delay, random = Math.random } = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const read = READ_METHODS.has(method);
    for (let attempt = 0; ; attempt++) {
        options.signal?.throwIfAborted();
        let response;
        try {
            const timeout = AbortSignal.timeout(timeoutMs);
            const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
            response = await fetch(url, { ...options, method, signal });
        } catch (error) {
            if (options.signal?.aborted) throw error;
            if (!read) {
                const ambiguous = new Error('The result could not be confirmed. Check the record before trying again.', { cause: error });
                ambiguous.ambiguous = true;
                throw ambiguous;
            }
            if (attempt >= maxRetries) throw error;
        }
        if (response && (!read || !RETRYABLE_READ_STATUSES.has(response.status) || response.status === 429 && !retryRateLimited || attempt >= maxRetries)) return response;
        const retryAfter = response?.headers.get('retry-after');
        const parsed = retryAfter === null || retryAfter === undefined ? NaN :
            (/^\d+(\.\d+)?$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now());
        const waitMs = Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, 10000)) :
            Math.min(1000 * 2 ** attempt + Math.floor(random() * 250), 10000);
        await response?.body?.cancel();
        await wait(waitMs, options.signal);
    }
}
