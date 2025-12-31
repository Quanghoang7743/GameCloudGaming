// WebSocket Manager for signaling
// Handles WebSocket connection to backend for stream signaling

export type MessageHandler = (data: any) => void;

export class WebSocketManager {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, MessageHandler[]> = new Map();
    private reconnectTimer: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(private url: string) { }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket closed');
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    send(type: string, data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        } else {
            console.error('WebSocket not connected');
        }
    }

    on(messageType: string, handler: MessageHandler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType)!.push(handler);
    }

    off(messageType: string, handler: MessageHandler) {
        const handlers = this.messageHandlers.get(messageType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    private handleMessage(data: any) {
        const { type, ...rest } = data;
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => handler(rest));
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

            this.reconnectTimer = setTimeout(() => {
                this.connect().catch(console.error);
            }, delay);
        } else {
            console.error('Max reconnect attempts reached');
        }
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
    }
}
