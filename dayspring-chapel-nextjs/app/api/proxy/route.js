import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://dayspring-backend-4ar8.onrender.com';

export async function POST(request) {
    try {
        const body = await request.json();
        const { endpoint, method = 'GET', data, headers = {} } = body;

        console.log(`[Proxy POST] Forwarding ${method} request to: ${API_BASE_URL}${endpoint}`);
        console.log(`[Proxy POST] Request Data:`, JSON.stringify(data).substring(0, 500));

        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
        console.log(`[Proxy POST] Response status from backend: ${response.status}`);

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        return NextResponse.json(
            { data: responseData, status: response.status },
            { status: response.status }
        );
    } catch (error) {
        console.error('[Proxy POST] Error occurred:', error);
        console.error('[Proxy POST] Stack trace:', error.stack);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');
        const token = request.headers.get('authorization');

        console.log('[Proxy GET] Endpoint:', endpoint);
        console.log('[Proxy GET] Full URL:', request.url);

        const authHeader = request.headers.get('authorization');
        console.log('[Proxy GET] Raw Authorization Header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');

        const headers = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
            console.log('[Proxy GET] Forwarding Authorization header');
        } else {
            console.warn('[Proxy GET] No Authorization header found in request!');
        }

        const backendUrl = `${API_BASE_URL}${endpoint}`;
        console.log('[Proxy GET] Fetching:', backendUrl);

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers,
        });

        console.log('[Proxy GET] Response status:', response.status);

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        console.log('[Proxy GET] Response data type:', typeof responseData);

        return NextResponse.json(
            { data: responseData, status: response.status },
            { status: response.status }
        );
    } catch (error) {
        console.error('[Proxy GET] Error:', error);
        console.error('[Proxy GET] Error stack:', error.stack);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');
        const token = request.headers.get('authorization');

        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        return NextResponse.json(
            { data: responseData, status: response.status },
            { status: response.status }
        );
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
