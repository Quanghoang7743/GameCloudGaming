import type { PostPairRequest } from './types';

export interface PairingCallbacks {
    onPin: (pin: string) => void;
    onSuccess: () => void;
    onError: (error: string) => void;
}

/**
 * Start pairing with single streaming connection.
 * Reads PIN from first message, then waits for success message.
 */
export async function startPairingStream(
    hostId: number,
    callbacks: PairingCallbacks
): Promise<void> {
    const request: PostPairRequest = { host_id: hostId };

    try {
        const response = await fetch('/api/pair-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            credentials: 'include',  // Send cookies
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Request failed' }));
            callbacks.onError(err.error || 'Pairing initialization failed');
            return;
        }

        if (!response.body) {
            callbacks.onError('No response body');
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let pinSent = false;

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                if (!pinSent) {
                    callbacks.onError('Connection closed before receiving PIN');
                }
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Split by newlines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                console.log('[Pairing] Received line:', trimmed);

                try {
                    const message = JSON.parse(trimmed);

                    // Handle string responses
                    if (typeof message === 'string') {
                        // "PairError" is just temp status, always ignore
                        if (message === 'PairError') {
                            console.log('[Pairing] Ignoring PairError (temp status)');
                            continue;
                        }
                        // Other string errors are real
                        console.error('[Pairing] Real error:', message);
                        callbacks.onError(message);
                        reader.cancel();
                        return;
                    }

                    // PIN message (first)
                    if ('Pin' in message && !pinSent) {
                        console.log('[Pairing] ✓ PIN received:', message.Pin);
                        pinSent = true;
                        callbacks.onPin(message.Pin);
                        continue;
                    }

                    // Success message (second, after user confirms)
                    if ('Paired' in message) {
                        console.log('[Pairing] ✓ Paired successfully!');
                        callbacks.onSuccess();
                        reader.cancel();
                        return;
                    }

                    console.warn('[Pairing] Unknown message:', message);
                } catch (e) {
                    console.error('[Pairing] Parse error:', trimmed, e);
                }
            }
        }

        // Stream ended without success
        if (!pinSent) {
            callbacks.onError('Stream ended unexpectedly');
        }
    } catch (error) {
        console.error('[Pairing] Exception:', error);
        callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
    }
}
