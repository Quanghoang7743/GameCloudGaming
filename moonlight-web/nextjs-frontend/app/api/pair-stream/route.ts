import { NextRequest, NextResponse } from 'next/server';

const RUST_BACKEND_URL = 'http://localhost:8080';
const PYTHON_BACKEND_URL = 'http://localhost:8001';

async function verifyJwtAndGetUsername(jwtToken: string): Promise<string | null> {
    try {
        const response = await fetch(`${PYTHON_BACKEND_URL}/auth/me`, {
            headers: { 'Cookie': `access_token=${jwtToken}` },
        });

        if (!response.ok) return null;

        const userData = await response.json();
        return userData.username || userData.email;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('access_token')?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = await verifyJwtAndGetUsername(accessToken);

        if (!username) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const rustUrl = `${RUST_BACKEND_URL}/api/pair`;

        console.log(`[POST /api/pair-stream] Forwarding to Rust: ${rustUrl}`);
        console.log('[POST /api/pair-stream] Request body:', body);

        const rustResponse = await fetch(rustUrl, {
            method: 'POST',
            headers: {
                'X-Forwarded-User': username,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[POST /api/pair-stream] Rust response status:', rustResponse.status);

        if (!rustResponse.ok) {
            const text = await rustResponse.text();
            console.error('[POST /api/pair-stream] Error response:', text);
            try {
                const data = JSON.parse(text);
                return NextResponse.json(data, { status: rustResponse.status });
            } catch {
                return NextResponse.json({ error: text || 'Pairing failed' }, { status: rustResponse.status });
            }
        }

        // CRITICAL: Stream the response body directly without buffering
        console.log('[POST /api/pair-stream] Streaming response to client');

        return new NextResponse(rustResponse.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no', // Disable nginx buffering
            },
        });

    } catch (error) {
        console.error('[POST /api/pair-stream] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
