import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:8001';

/**
 * Proxy POST /api/auth/logout to Python backend
 * Clears cookies
 */
export async function POST(request: NextRequest) {
    try {
        const cookieHeader = request.headers.get('cookie') || '';

        const response = await fetch(`${PYTHON_BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        const data = await response.json();

        // Create response
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward Set-Cookie headers (to clear cookies)
        const setCookies = response.headers.get('set-cookie');
        if (setCookies) {
            setCookies.split(',').forEach(cookie => {
                nextResponse.headers.append('Set-Cookie', cookie.trim());
            });
        }

        return nextResponse;

    } catch (error) {
        console.error('[POST /api/auth/logout] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
