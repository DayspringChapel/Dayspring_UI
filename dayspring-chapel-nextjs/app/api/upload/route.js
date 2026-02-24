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

export async function POST(request) {
    try {
        const targetEndpoint = normalizeEndpoint(request.headers.get('X-Target-Endpoint'));
        const authHeader = request.headers.get('Authorization');

        console.log('[Upload POST] Target endpoint:', targetEndpoint);
        console.log('[Upload POST] Auth header:', authHeader ? 'Present' : 'Missing');

        if (!targetEndpoint) {
            return NextResponse.json(
                { error: 'Missing X-Target-Endpoint header' },
                { status: 400 }
            );
        }

        // Get the FormData from the request
        const formData = await request.formData();

        // Log FormData entries for debugging
        console.log('[Upload POST] FormData entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`  - ${key}:`, typeof value === 'object' ? `File: ${value.name}` : value);
        }

        const headers = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const backendUrl = `${API_BASE_URL}${targetEndpoint}`;
        console.log('[Upload POST] Sending to:', backendUrl);

        // Forward the FormData to the backend
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers,
            body: formData,
        });

        console.log('[Upload POST] Response status:', response.status);

        const responseData = await readResponseData(response);

        console.log('[Upload POST] Response data:', JSON.stringify(responseData).substring(0, 500));

        return NextResponse.json(
            responseData,
            { status: response.status }
        );
    } catch (error) {
        console.error('[Upload POST] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const targetEndpoint = normalizeEndpoint(request.headers.get('X-Target-Endpoint'));
        const authHeader = request.headers.get('Authorization');

        console.log('[Upload PATCH] Target endpoint:', targetEndpoint);
        console.log('[Upload PATCH] Auth header:', authHeader ? 'Present' : 'Missing');

        if (!targetEndpoint) {
            return NextResponse.json(
                { error: 'Missing X-Target-Endpoint header' },
                { status: 400 }
            );
        }

        const formData = await request.formData();

        // Log FormData entries for debugging
        console.log('[Upload PATCH] FormData entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`  - ${key}:`, typeof value === 'object' ? `File: ${value.name}` : value);
        }

        const headers = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const backendUrl = `${API_BASE_URL}${targetEndpoint}`;
        console.log('[Upload PATCH] Sending to:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'PATCH',
            headers,
            body: formData,
        });

        console.log('[Upload PATCH] Response status:', response.status);

        const responseData = await readResponseData(response);

        console.log('[Upload PATCH] Response data:', JSON.stringify(responseData).substring(0, 500));

        return NextResponse.json(
            responseData,
            { status: response.status }
        );
    } catch (error) {
        console.error('Upload proxy error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
