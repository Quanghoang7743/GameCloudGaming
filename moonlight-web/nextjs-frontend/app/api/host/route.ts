import { NextRequest, NextResponse } from 'next/server';

const RUST_BACKEND_URL = 'http://localhost:8080';
const PYTHON_BACKEND_URL = 'http://localhost:8001';

/**
 * Verify JWT token with Python backend
 */
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

/**
 * GET /api/host?id={hostId}
 */
export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('access_token')?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = await verifyJwtAndGetUsername(accessToken);

        if (!username) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const hostId = searchParams.get('id');

        const rustResponse = await fetch(
            `${RUST_BACKEND_URL}/api/host?host_id=${hostId}`,
            {
                method: 'GET',
                headers: { 'X-Forwarded-User': username },
            }
        );

        const data = await rustResponse.json();
        return NextResponse.json(data, { status: rustResponse.status });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/host - Add new host
 */
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

        // Forward query parameters (e.g. ?pair)
        const searchParams = request.nextUrl.searchParams.toString();
        const query = searchParams ? `?${searchParams}` : '';
        const rustUrl = `${RUST_BACKEND_URL}/api/host${query}`;

        const body = await request.json();

        console.log(`[POST /api/host] Calling Rust backend: ${rustUrl}`);
        console.log('[POST /api/host] Username:', username);

        const rustResponse = await fetch(rustUrl, {
            method: 'POST',
            headers: {
                'X-Forwarded-User': username,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[POST /api/host] Rust response status:', rustResponse.status);

        // Handle success
        if (rustResponse.status === 200) {
            const data = await rustResponse.json();
            return NextResponse.json(data);
        }

        // Handle error (text or JSON)
        const text = await rustResponse.text();
        try {
            const data = JSON.parse(text);
            console.error('[POST /api/host] Rust error response (JSON):', data);
            return NextResponse.json(data, { status: rustResponse.status });
        } catch (e) {
            console.error('[POST /api/host] Rust error response (Text):', text);
            return NextResponse.json({ error: text || 'Unknown error' }, { status: rustResponse.status });
        }

    } catch (error) {
        console.error('[POST /api/host] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/host?id={hostId}
 */
export async function DELETE(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('access_token')?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = await verifyJwtAndGetUsername(accessToken);

        if (!username) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const hostId = searchParams.get('id');

        console.log('[DELETE /api/host] Host ID:', hostId);
        console.log('[DELETE /api/host] Username:', username);

        if (!hostId) {
            console.error('[DELETE /api/host] No host_id provided');
            return NextResponse.json({ error: 'Missing host_id parameter' }, { status: 400 });
        }

        const rustUrl = `${RUST_BACKEND_URL}/api/host?host_id=${hostId}`;
        console.log('[DELETE /api/host] Calling Rust backend:', rustUrl);

        const rustResponse = await fetch(rustUrl, {
            method: 'DELETE',
            headers: { 'X-Forwarded-User': username },
        });

        console.log('[DELETE /api/host] Rust response status:', rustResponse.status);

        if (rustResponse.status === 200) {
            return new NextResponse(null, { status: 200 });
        }

        const data = await rustResponse.json();
        console.error('[DELETE /api/host] Rust error response:', data);
        return NextResponse.json(data, { status: rustResponse.status });

    } catch (error) {
        console.error('[DELETE /api/host] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
