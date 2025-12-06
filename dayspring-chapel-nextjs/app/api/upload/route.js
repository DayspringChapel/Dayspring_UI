import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://dayspring-backend-4ar8.onrender.com';

export async function POST(request) {
    try {
        const targetEndpoint = request.headers.get('X-Target-Endpoint');
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

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

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
        const targetEndpoint = request.headers.get('X-Target-Endpoint');
        const authHeader = request.headers.get('Authorization');

        if (!targetEndpoint) {
            return NextResponse.json(
                { error: 'Missing X-Target-Endpoint header' },
                { status: 400 }
            );
        }

        const formData = await request.formData();

        const headers = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${API_BASE_URL}${targetEndpoint}`, {
            method: 'PATCH',
            headers,
            body: formData,
        });

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

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
