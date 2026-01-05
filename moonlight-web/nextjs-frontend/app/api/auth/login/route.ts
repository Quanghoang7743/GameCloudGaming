import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:8001';

/**
 * Proxy POST /api/auth/login to Python backend
 * Forwards set-cookie headers back to client
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text(); // Get raw body (form data)
        const contentType = request.headers.get('content-type') || '';

        const response = await fetch(`${PYTHON_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
            },
            body: body,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Create NextResponse with data
        const nextResponse = NextResponse.json(data, { status: 200 });

        // Forward all Set-Cookie headers from Python backend
        // Must iterate manually since getSetCookie might not be available
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
                nextResponse.headers.append('Set-Cookie', value);
            }
        });

        return nextResponse;

    } catch (error) {
        console.error('[POST /api/auth/login] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
