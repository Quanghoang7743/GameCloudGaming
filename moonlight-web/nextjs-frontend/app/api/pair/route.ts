import { NextRequest, NextResponse } from 'next/server';

const RUST_BACKEND_URL = 'http://localhost:8080';
const PYTHON_BACKEND_URL = 'http://localhost:8001';

async function verifyJwtAndGetUsername(jwtToken: string): Promise<string | null> {
    try {
        const response = await fetch(`${PYTHON_BACKEND_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` },
        });

        if (!response.ok) return null;

        const userData = await response.json();
        return userData.username || userData.email;
    } catch (error) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jwtToken = authHeader.substring(7);
        const username = await verifyJwtAndGetUsername(jwtToken);

        if (!username) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const rustUrl = `${RUST_BACKEND_URL}/api/pair`;

        console.log(`[POST /api/pair] Forwarding to Rust: ${rustUrl}`);
        console.log('[POST /api/pair] Request body:', body);

        const rustResponse = await fetch(rustUrl, {
            method: 'POST',
            headers: {
                'X-Forwarded-User': username,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[POST /api/pair] Rust response status:', rustResponse.status);

        if (!rustResponse.ok) {
            const text = await rustResponse.text();
            console.error('[POST /api/pair] Error response:', text);
            try {
                const data = JSON.parse(text);
                return NextResponse.json(data, { status: rustResponse.status });
            } catch {
                return NextResponse.json({ error: text || 'Pairing failed' }, { status: rustResponse.status });
            }
        }

        // Backend sends 2 lines but we only care about first
        // (second line is usually "PairError" until user confirms)
        const text = await rustResponse.text();
        const lines = text.split('\n').filter(l => l.trim());

        if (lines.length === 0) {
            return NextResponse.json({ error: 'Empty response' }, { status: 500 });
        }

        // Return first line (PIN or success message)
        const firstMessage = JSON.parse(lines[0]);
        return NextResponse.json(firstMessage);

    } catch (error) {
        console.error('[POST /api/pair] Exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
