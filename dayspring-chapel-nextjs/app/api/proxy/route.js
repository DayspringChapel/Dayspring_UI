import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.BACKEND_API_URL || 'https://dayspring-backend-4ar8.onrender.com').replace(/\/$/, '');

function normalizeEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') return null;
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

async function readResponseData(response) {
    const text = await response.text();
    if (!text) return null;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    return text;
}

async function proxyToBackend({ endpoint, method = 'GET', data, headers = {} }) {
    const normalizedMethod = method.toUpperCase();
    const fetchOptions = {
        method: normalizedMethod,
        headers: { ...headers },
        cache: 'no-store',
    };

    if (data !== undefined && ['POST', 'PUT', 'PATCH'].includes(normalizedMethod)) {
        fetchOptions.body = JSON.stringify(data);
        if (!fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
            fetchOptions.headers['Content-Type'] = 'application/json';
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    const responseData = await readResponseData(response);

    return NextResponse.json({ data: responseData, status: response.status }, { status: response.status });
}

export async function POST(request) {
    try {
        let body = {};
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const { endpoint, method = 'GET', data, headers = {} } = body || {};
        const normalizedEndpoint = normalizeEndpoint(endpoint);
        if (!normalizedEndpoint) {
            return NextResponse.json({ error: 'Missing or invalid endpoint' }, { status: 400 });
        }

        const authHeader = request.headers.get('authorization');
        const forwardedHeaders = { ...headers };
        if (authHeader && !forwardedHeaders.Authorization && !forwardedHeaders.authorization) {
            forwardedHeaders.Authorization = authHeader;
        }

        return proxyToBackend({
            endpoint: normalizedEndpoint,
            method,
            data,
            headers: forwardedHeaders,
        });
    } catch (error) {
        console.error('[Proxy POST] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const normalizedEndpoint = normalizeEndpoint(searchParams.get('endpoint'));
        if (!normalizedEndpoint) {
            return NextResponse.json({ error: 'Missing or invalid endpoint' }, { status: 400 });
        }

        const authHeader = request.headers.get('authorization');
        const headers = { 'Content-Type': 'application/json' };
        if (authHeader) headers.Authorization = authHeader;

        return proxyToBackend({ endpoint: normalizedEndpoint, method: 'GET', headers });
    } catch (error) {
        console.error('[Proxy GET] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const normalizedEndpoint = normalizeEndpoint(searchParams.get('endpoint'));
        if (!normalizedEndpoint) {
            return NextResponse.json({ error: 'Missing or invalid endpoint' }, { status: 400 });
        }

        const authHeader = request.headers.get('authorization');
        const headers = { 'Content-Type': 'application/json' };
        if (authHeader) headers.Authorization = authHeader;

        return proxyToBackend({ endpoint: normalizedEndpoint, method: 'DELETE', headers });
    } catch (error) {
        console.error('[Proxy DELETE] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
