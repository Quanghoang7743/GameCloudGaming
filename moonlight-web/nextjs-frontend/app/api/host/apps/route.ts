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
    } catch (error) {
        return null;
    }
}

/**
 * GET /api/host/apps?host_id={hostId}
 * Fetch list of apps/games from a paired host
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
        const hostId = searchParams.get('host_id');

        if (!hostId) {
            return NextResponse.json({ error: 'host_id required' }, { status: 400 });
        }

        console.log(`[GET /api/host/apps] Fetching apps for host ${hostId}`);

        const rustResponse = await fetch(
            `${RUST_BACKEND_URL}/api/apps?host_id=${hostId}`,
            {
                method: 'GET',
                headers: { 'X-Forwarded-User': username },
            }
        );

        if (!rustResponse.ok) {
            const errorText = await rustResponse.text();
            console.error('[GET /api/host/apps] Rust backend error:', errorText);
            return NextResponse.json(
                { error: errorText || 'Failed to fetch apps' },
                { status: rustResponse.status }
            );
        }

        const apps = await rustResponse.json();
        return NextResponse.json(apps);

    } catch (error) {
        console.error('[GET /api/host/apps] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
