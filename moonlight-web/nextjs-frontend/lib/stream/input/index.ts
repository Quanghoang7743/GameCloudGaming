/**
 * StreamInput - Input handling for streaming
 * Captures mouse and keyboard events and forwards them via WebRTC data channels
 */

import { ByteBuffer } from '../buffer';
import { StreamMouseButton, TransportChannelId } from '../constants';
import { Transport, DataTransportChannel } from '../types';
import { convertToKey, convertToModifiers } from './keyboard';
import { convertToButton } from './mouse';

export type MouseMode = 'relative' | 'follow' | 'pointAndDrag';
export type MouseScrollMode = 'highres' | 'normal';

export type StreamInputConfig = {
    mouseMode: MouseMode;
    mouseScrollMode: MouseScrollMode;
};

export function defaultStreamInputConfig(): StreamInputConfig {
    return {
        mouseMode: 'follow',
        mouseScrollMode: 'highres',
    };
}

function trySendChannel(channel: DataTransportChannel | null, buffer: ByteBuffer) {
    if (!channel) {
        return;
    }

    buffer.flip();
    const readBuffer = buffer.getRemainingBuffer();
    if (readBuffer.length === 0) {
        throw new Error('Illegal buffer size');
    }
    const arrayBuffer = readBuffer.buffer as ArrayBuffer;
    channel.send(arrayBuffer);
}

export class StreamInput {
    private buffer: ByteBuffer = new ByteBuffer(1024);
    private config: StreamInputConfig;
    private streamerSize: [number, number] = [0, 0];

    private keyboard: DataTransportChannel | null = null;
    private mouseReliable: DataTransportChannel | null = null;
    private mouseAbsolute: DataTransportChannel | null = null;
    private mouseRelative: DataTransportChannel | null = null;

    private pressedKeys: Set<number> = new Set();

    constructor(config?: StreamInputConfig) {
        this.config = defaultStreamInputConfig();
        if (config) {
            this.setConfig(config);
        }
    }

    private getDataChannel(transport: Transport, id: number): DataTransportChannel {
        const channel = transport.getChannel(id);
        if (channel.type === 'data') {
            return channel as DataTransportChannel;
        }
        throw new Error(`Failed to get channel ${id} as data transport channel`);
    }

    setTransport(transport: Transport) {
        this.keyboard = this.getDataChannel(transport, TransportChannelId.KEYBOARD);
        this.mouseReliable = this.getDataChannel(transport, TransportChannelId.MOUSE_RELIABLE);
        this.mouseAbsolute = this.getDataChannel(transport, TransportChannelId.MOUSE_ABSOLUTE);
        this.mouseRelative = this.getDataChannel(transport, TransportChannelId.MOUSE_RELATIVE);
    }

    setConfig(config: StreamInputConfig) {
        Object.assign(this.config, config);
    }

    getConfig(): StreamInputConfig {
        return this.config;
    }

    onStreamStart(streamerSize: [number, number]) {
        this.streamerSize = streamerSize;
    }

    // -- Keyboard

    onKeyDown(event: KeyboardEvent) {
        this.sendKeyEvent(true, event);
    }

    onKeyUp(event: KeyboardEvent) {
        this.sendKeyEvent(false, event);
    }

    private sendKeyEvent(isDown: boolean, event: KeyboardEvent) {
        const key = convertToKey(event);
        if (key == null) {
            return;
        }

        if (isDown) {
            if (this.pressedKeys.has(key)) {
                return;
            }
            this.pressedKeys.add(key);
        } else {
            if (!this.pressedKeys.has(key)) {
                return;
            }
            this.pressedKeys.delete(key);
        }

        const modifiers = convertToModifiers(event);

        console.debug('[Input]', isDown ? 'DOWN' : 'UP', event.code, key, modifiers.toString(16));
        this.sendKey(isDown, key, modifiers);
    }

    raiseAllKeys() {
        for (const key of this.pressedKeys) {
            this.sendKey(false, key, 0);
        }
        this.pressedKeys.clear();
    }

    sendKey(isDown: boolean, key: number, modifiers: number) {
        this.buffer.reset();

        this.buffer.putU8(0); // Key event type

        this.buffer.putBool(isDown);
        this.buffer.putU8(modifiers);
        this.buffer.putU16(key);

        trySendChannel(this.keyboard, this.buffer);
    }

    sendText(text: string) {
        this.buffer.reset();

        this.buffer.putU8(1); // Text event type

        this.buffer.putU8(text.length);
        this.buffer.putUtf8Raw(text);

        trySendChannel(this.keyboard, this.buffer);
    }

    // -- Mouse

    onMouseDown(event: MouseEvent, rect: DOMRect) {
        const button = convertToButton(event);
        if (button == null) {
            return;
        }

        if (this.config.mouseMode === 'relative' || this.config.mouseMode === 'follow') {
            this.sendMouseButton(true, button);
        } else if (this.config.mouseMode === 'pointAndDrag') {
            this.sendMousePositionClientCoordinates(event.clientX, event.clientY, rect, true, button);
        }
    }

    onMouseUp(event: MouseEvent) {
        const button = convertToButton(event);
        if (button == null) {
            return;
        }

        if (this.config.mouseMode === 'relative' || this.config.mouseMode === 'follow') {
            this.sendMouseButton(false, button);
        } else if (this.config.mouseMode === 'pointAndDrag') {
            this.sendMouseButton(false, button);
        }
    }

    onMouseMove(event: MouseEvent, rect: DOMRect) {
        if (this.config.mouseMode === 'relative') {
            this.sendMouseMoveClientCoordinates(event.movementX, event.movementY, rect);
        } else if (this.config.mouseMode === 'follow') {
            this.sendMousePositionClientCoordinates(event.clientX, event.clientY, rect, false);
        } else if (this.config.mouseMode === 'pointAndDrag') {
            if (event.buttons) {
                // Some button pressed
                this.sendMouseMoveClientCoordinates(event.movementX, event.movementY, rect);
            }
        }
    }

    onMouseWheel(event: WheelEvent) {
        if (this.config.mouseScrollMode === 'highres') {
            this.sendMouseWheelHighRes(event.deltaX, -event.deltaY);
        } else if (this.config.mouseScrollMode === 'normal') {
            this.sendMouseWheel(event.deltaX, -event.deltaY);
        }
    }

    sendMouseMove(movementX: number, movementY: number) {
        this.buffer.reset();

        this.buffer.putU8(0); // Mouse move event type
        this.buffer.putI16(movementX);
        this.buffer.putI16(movementY);

        trySendChannel(this.mouseRelative, this.buffer);
    }

    sendMouseMoveClientCoordinates(movementX: number, movementY: number, rect: DOMRect) {
        const scaledMovementX = (movementX / rect.width) * this.streamerSize[0];
        const scaledMovementY = (movementY / rect.height) * this.streamerSize[1];

        this.sendMouseMove(scaledMovementX, scaledMovementY);
    }

    sendMousePosition(x: number, y: number, referenceWidth: number, referenceHeight: number, reliable: boolean) {
        this.buffer.reset();

        this.buffer.putU8(1); // Mouse position event type
        this.buffer.putI16(x);
        this.buffer.putI16(y);
        this.buffer.putI16(referenceWidth);
        this.buffer.putI16(referenceHeight);

        if (reliable) {
            trySendChannel(this.mouseReliable, this.buffer);
        } else {
            const PACKET_SIZE = 1 + 2 + 2 + 2 + 2;

            if (this.mouseAbsolute && this.mouseAbsolute.estimatedBufferedBytes) {
                const estimatedBufferedBytes = this.mouseAbsolute.estimatedBufferedBytes();
                if (estimatedBufferedBytes != null && estimatedBufferedBytes > PACKET_SIZE) {
                    return;
                }
                trySendChannel(this.mouseAbsolute, this.buffer);
            }
        }
    }

    sendMousePositionClientCoordinates(
        clientX: number,
        clientY: number,
        rect: DOMRect,
        reliable: boolean,
        mouseButton?: number
    ) {
        const position = this.calcNormalizedPosition(clientX, clientY, rect);
        if (position) {
            const [x, y] = position;
            this.sendMousePosition(x * 4096.0, y * 4096.0, 4096.0, 4096.0, reliable);

            if (mouseButton !== undefined) {
                this.sendMouseButton(true, mouseButton);
            }
        }
    }

    sendMouseButton(isDown: boolean, button: number) {
        this.buffer.reset();

        this.buffer.putU8(2); // Mouse button event type
        this.buffer.putBool(isDown);
        this.buffer.putU8(button);

        trySendChannel(this.mouseReliable, this.buffer);
    }

    sendMouseWheelHighRes(deltaX: number, deltaY: number) {
        this.buffer.reset();

        this.buffer.putU8(3); // Mouse wheel highres event type
        this.buffer.putI16(deltaX);
        this.buffer.putI16(deltaY);

        trySendChannel(this.mouseRelative, this.buffer);
    }

    sendMouseWheel(deltaX: number, deltaY: number) {
        this.buffer.reset();

        this.buffer.putU8(4); // Mouse wheel event type
        this.buffer.putI8(deltaX);
        this.buffer.putI8(deltaY);

        trySendChannel(this.mouseRelative, this.buffer);
    }

    private calcNormalizedPosition(clientX: number, clientY: number, rect: DOMRect): [number, number] | null {
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        if (x < 0 || x > 1.0 || y < 0 || y > 1.0) {
            // Invalid position
            return null;
        }
        return [x, y];
    }
}
