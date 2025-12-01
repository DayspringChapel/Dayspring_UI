import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://dayspring-backend-4ar8.onrender.com';

export async function POST(request) {
    try {
        const body = await request.json();
        const { endpoint, method = 'GET', data, headers = {} } = body;

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

export async function GET(request) {
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
            method: 'GET',
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
