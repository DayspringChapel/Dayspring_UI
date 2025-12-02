import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://dayspring-backend-4ar8.onrender.com';

export async function POST(request) {
    try {
        const targetEndpoint = request.headers.get('X-Target-Endpoint');
        const authHeader = request.headers.get('Authorization');

        if (!targetEndpoint) {
            return NextResponse.json(
                { error: 'Missing X-Target-Endpoint header' },
                { status: 400 }
            );
        }

        // Get the FormData from the request
        const formData = await request.formData();

        const headers = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Forward the FormData to the backend
        const response = await fetch(`${API_BASE_URL}${targetEndpoint}`, {
            method: 'POST',
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
