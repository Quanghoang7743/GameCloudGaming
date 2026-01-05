import { NextRequest, NextResponse } from 'next/server';

const RUST_BACKEND_URL = 'http://localhost:8080';
const PYTHON_BACKEND_URL = 'http://localhost:8001';

async function verifyJwtAndGetUsername(jwtToken: string): Promise<string | null> {
    try {
        // Create a cookie header to send to Python backend
        const response = await fetch(`${PYTHON_BACKEND_URL}/auth/me`, {
            headers: {
                'Cookie': `access_token=${jwtToken}`,
            },
        });

        if (!response.ok) {
            console.error('[verifyJwt] Python /auth/me returned:', response.status);
            return null;
        }

        const userData = await response.json();
        return userData.username || userData.email;
    } catch (error) {
        console.error('[verifyJwt] Error:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get access_token from cookies
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            console.log('[GET /api/hosts] No access token in cookies!');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token and get username
        const username = await verifyJwtAndGetUsername(accessToken);

        if (!username) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 3. Forward to Rust backend with X-Forwarded-User header
        const rustResponse = await fetch(`${RUST_BACKEND_URL}/api/hosts`, {
            method: 'GET',
            headers: {
                'X-Forwarded-User': username,
            },
        });

        if (!rustResponse.ok) {
            const errorText = await rustResponse.text();
            return NextResponse.json(
                { error: 'Backend request failed' },
                { status: rustResponse.status }
            );
        }

        const responseText = await rustResponse.text();

        // Parse first JSON object (initial response)
        const lines = responseText.trim().split('\n');
        const firstLine = lines[0];
        const data = JSON.parse(firstLine);

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
