import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = 'http://localhost:8001';

/**
 * Proxy GET /api/auth/me to Python backend
 * Forwards cookies automatically
 */
export async function GET(request: NextRequest) {
    try {
        // Get cookies from request
        const cookieHeader = request.headers.get('cookie') || '';

        const response = await fetch(`${PYTHON_BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || 'Failed to get user info' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[GET /api/auth/me] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
