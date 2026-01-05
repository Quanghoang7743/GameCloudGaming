// Stream Manager - Main streaming orchestrator
// Handles WebSocket connection, transport setup, and pipeline management

import { WebRTCTransport } from './transport/webrtc';
import {
    StreamSettings,
    VideoCodecSupport,
    Transport,
    Logger,
    andVideoCodecs,
    hasAnyCodec
} from './types';
import { getStreamerSize, getVideoCodecHint, createPrettyList } from './utils';
import { StreamInput } from './input';
import type {
    StreamClientMessage,
    StreamServerMessage,
    StreamCapabilities
} from '@/lib/api/types';

export interface StreamStats {
    fps: number;
    bitrate: number; // Kbps
    latency: number; // ms
    resolution: { width: number; height: number };
    codec: string;
    packetsLost: number;
    jitter: number; // ms
}

export interface StreamManagerConfig {
    hostId: number;
    appId: number;
    settings: StreamSettings;
    wsUrl: string;
    onMessage?: (type: string, data: any) => void;
    onError?: (error: string) => void;
    onStatsUpdate?: (stats: StreamStats) => void;
}

export class StreamManager {
    private config: StreamManagerConfig;
    private ws: WebSocket | null = null;
    private transport: Transport | null = null;
    private input: StreamInput;

    private iceServers: RTCIceServer[] | null = null;
    private streamerSize: [number, number];

    // Media elements
    private videoElement: HTMLVideoElement | null = null;
    private audioElement: HTMLAudioElement | null = null;

    // Stats tracking
    private statsInterval: NodeJS.Timeout | null = null;
    private lastFrameCount: number = 0;
    private lastStatsTime: number = 0;
    private currentStats: StreamStats = {
        fps: 0,
        bitrate: 0,
        latency: 0,
        resolution: { width: 0, height: 0 },
        codec: 'unknown',
        packetsLost: 0,
        jitter: 0
    };

    // Logger
    private logger: Logger = {
        debug: (msg) => console.log(`[Stream] ${msg}`),
        info: (msg) => console.info(`[Stream] ${msg}`),
        warn: (msg) => console.warn(`[Stream] ${msg}`),
        error: (msg) => console.error(`[Stream] ${msg}`)
    };

    // Message buffer for early messages
    private wsSendBuffer: StreamClientMessage[] = [];

    constructor(config: StreamManagerConfig) {
        this.config = config;

        // Calculate stream size
        const viewerSize: [number, number] = [
            window.innerWidth,
            window.innerHeight
        ];
        this.streamerSize = getStreamerSize(config.settings, viewerSize);

        // Create input handler
        this.input = new StreamInput();
    }

    /**
     * Initialize streaming connection
     */
    async initialize(videoElement: HTMLVideoElement): Promise<void> {
        this.videoElement = videoElement;

        // Setup WebSocket
        this.logger.info('Initializing stream connection');

        this.ws = new WebSocket(this.config.wsUrl);
        this.ws.addEventListener('open', this.onWsOpen.bind(this));
        this.ws.addEventListener('close', this.onWsClose.bind(this));
        this.ws.addEventListener('error', this.onWsError.bind(this));
        this.ws.addEventListener('message', this.onWsMessage.bind(this));

        // Send init message
        this.sendWsMessage({
            Init: {
                host_id: this.config.hostId,
                app_id: this.config.appId,
                video_frame_queue_size: this.config.settings.videoFrameQueueSize,
                audio_sample_queue_size: this.config.settings.audioSampleQueueSize
            }
        });
    }

    /**
     * WebSocket event handlers
     */
    private onWsOpen(): void {
        this.logger.info('WebSocket connected');

        // Send buffered messages
        for (const message of this.wsSendBuffer) {
            this.ws?.send(JSON.stringify(message));
        }
        this.wsSendBuffer = [];
    }

    private onWsClose(): void {
        this.logger.warn('WebSocket closed');
        this.config.onError?.('Connection closed');
    }

    private onWsError(event: Event): void {
        this.logger.error('WebSocket error');
        console.error(event);
        this.config.onError?.('WebSocket error');
    }

    private onWsMessage(event: MessageEvent): void {
        if (typeof event.data !== 'string') return;

        try {
            const message: StreamServerMessage = JSON.parse(event.data);
            this.handleServerMessage(message);
        } catch (error) {
            this.logger.error(`Failed to parse message: ${error}`);
        }
    }

    /**
     * Handle messages from server
     */
    private async handleServerMessage(message: StreamServerMessage): Promise<void> {
        if ('DebugLog' in message) {
            const log = message.DebugLog;
            this.logger.info(`[Server] ${log.message}`);
            this.config.onMessage?.('debug', log.message);
        }

        else if ('Setup' in message) {
            // Received ICE servers configuration
            this.iceServers = message.Setup.ice_servers;

            const serverUrls = this.iceServers
                .map(s => s.urls)
                .flat();

            this.logger.info(`ICE Servers: ${createPrettyList(serverUrls)}`);

            // Start connection
            await this.startConnection();
        }

        else if ('WebRtc' in message) {
            // Forward to transport
            if (this.transport instanceof WebRTCTransport) {
                this.transport.onReceiveMessage(message.WebRtc);
            }
        }

        else if ('ConnectionComplete' in message) {
            const { capabilities, format, width, height, fps } = message.ConnectionComplete;

            this.logger.info(`Stream started: ${width}x${height} @ ${fps}fps, format: ${format}`);

            // Update stats with resolution and codec
            this.currentStats.resolution = { width, height };
            this.currentStats.codec = String(format);

            this.config.onMessage?.('connectionComplete', {
                capabilities,
                width,
                height,
                fps
            });

            // Start stats collection
            this.startStatsCollection();

            // Setup is complete, video should start playing
        }

        else if ('UpdateApp' in message) {
            this.config.onMessage?.('app', message.UpdateApp.app);
        }

        else if ('ConnectionTerminated' in message) {
            const code = message.ConnectionTerminated.error_code;
            this.logger.error(`Connection terminated: ${code}`);
            this.config.onError?.(`Connection terminated: ${code}`);
        }
    }

    /**
     * Start connection based on transport settings
     */
    private async startConnection(): Promise<void> {
        this.logger.info(`Starting ${this.config.settings.dataTransport} transport`);

        if (this.config.settings.dataTransport === 'auto' ||
            this.config.settings.dataTransport === 'webrtc') {
            await this.tryWebRTCTransport();
        } else {
            throw new Error('WebSocket transport not yet implemented');
        }
    }

    /**
     * Initialize WebRTC transport
     */
    private async tryWebRTCTransport(): Promise<void> {
        this.logger.info('Initializing WebRTC transport');

        // Tell server we want WebRTC
        this.sendWsMessage({ SetTransport: 'WebRTC' });

        if (!this.iceServers) {
            throw new Error('No ICE servers available');
        }

        // Create transport
        const transport = new WebRTCTransport(this.logger);
        transport.onsendmessage = (message) => {
            this.sendWsMessage({ WebRtc: message });
        };

        transport.onclose = (reason) => {
            this.logger.error(`Transport closed: ${reason}`);
            this.config.onError?.(reason);
        };

        // Initialize peer connection
        transport.initPeer({ iceServers: this.iceServers });

        this.transport = transport;

        // Setup input channels
        this.input.setTransport(transport);
        this.input.onStreamStart(this.streamerSize);

        // Setup video pipeline
        const videoCodecSupport = await this.setupVideoPipeline();
        if (!videoCodecSupport) {
            throw new Error('No supported video codecs');
        }

        // Setup audio pipeline
        await this.setupAudioPipeline();

        // Start streaming
        await this.startStream(videoCodecSupport);
    }

    /**
     * Setup video rendering pipeline
     */
    private async setupVideoPipeline(): Promise<VideoCodecSupport | null> {
        if (!this.transport || !this.videoElement) {
            throw new Error('Transport or video element not initialized');
        }

        // Get codec hint from settings
        const codecHint = getVideoCodecHint(this.config.settings);
        this.logger.info(`Codec hint: ${JSON.stringify(codecHint)}`);

        if (!hasAnyCodec(codecHint)) {
            throw new Error('No codec hint specified');
        }

        // Setup video channel
        const transportCodecSupport = await this.transport.setupHostVideo({
            type: ['videotrack', 'data']
        });

        this.logger.info(`Transport codecs: ${JSON.stringify(transportCodecSupport)}`);

        // Calculate supported codecs (intersection)
        const supportedCodecs = andVideoCodecs(codecHint, transportCodecSupport);

        if (!hasAnyCodec(supportedCodecs)) {
            throw new Error('No matching codecs between hint and transport');
        }

        // Attach video track to element
        const videoChannel = this.transport.getChannel(0); // HOST_VIDEO = 0
        if (videoChannel.type === 'videotrack') {
            videoChannel.onTrack = (track: MediaStreamTrack) => {
                if (this.videoElement) {
                    const stream = new MediaStream([track]);
                    this.videoElement.srcObject = stream;
                    this.videoElement.play().catch(e => {
                        this.logger.error(`Failed to play video: ${e}`);
                    });
                }
            };
        }

        return supportedCodecs;
    }

    /**
     * Setup audio playback pipeline
     */
    private async setupAudioPipeline(): Promise<void> {
        if (!this.transport) {
            throw new Error('Transport not initialized');
        }

        // Setup audio channel
        this.transport.setupHostAudio({ type: ['audiotrack', 'data'] });

        // Attach audio track to element
        const audioChannel = this.transport.getChannel(1); // HOST_AUDIO = 1
        if (audioChannel.type === 'audiotrack') {
            audioChannel.onTrack = (track: MediaStreamTrack) => {
                // Create audio element if needed
                if (!this.audioElement) {
                    this.audioElement = document.createElement('audio');
                    this.audioElement.autoplay = true;
                }

                const stream = new MediaStream([track]);
                this.audioElement.srcObject = stream;
                this.audioElement.play().catch(e => {
                    this.logger.warn(`Failed to play audio: ${e}`);
                });
            };
        }
    }

    /**
     * Send start stream message
     */
    private async startStream(videoCodecSupport: VideoCodecSupport): Promise<void> {
        // Calculate supported formats bitmask
        let formatsBits = 0;
        if (videoCodecSupport.H264) formatsBits |= (1 << 0);
        if (videoCodecSupport.H265) formatsBits |= (1 << 2);
        if (videoCodecSupport.AV1) formatsBits |= (1 << 6);

        const message: StreamClientMessage = {
            StartStream: {
                bitrate: this.config.settings.bitrate,
                packet_size: this.config.settings.packetSize,
                fps: this.config.settings.fps,
                width: this.streamerSize[0],
                height: this.streamerSize[1],
                play_audio_local: this.config.settings.playAudioLocal,
                video_supported_formats: formatsBits,
                video_colorspace: 'Rec709',
                video_color_range_full: false
            }
        };

        this.logger.info(`Starting stream: ${this.streamerSize[0]}x${this.streamerSize[1]} @ ${this.config.settings.fps}fps`);
        this.logger.debug(`Codec support: ${JSON.stringify(videoCodecSupport)}`);

        this.sendWsMessage(message);
    }

    /**
     * Send message to server via WebSocket
     */
    private sendWsMessage(message: StreamClientMessage): void {
        const raw = JSON.stringify(message);

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(raw);
        } else {
            // Buffer for later
            this.wsSendBuffer.push(message);
        }
    }

    /**
     * Start periodic stats collection
     */
    private startStatsCollection(): void {
        if (this.statsInterval) {
            return; // Already running
        }

        this.lastStatsTime = performance.now();
        this.lastFrameCount = 0;

        // Update stats every second
        this.statsInterval = setInterval(async () => {
            await this.collectStats();
        }, 1000);
    }

    /**
     * Collect current stream statistics
     */
    private async collectStats(): Promise<void> {
        try {
            // FPS calculation from video element
            if (this.videoElement) {
                const videoStats = (this.videoElement as any).getVideoPlaybackQuality?.();
                if (videoStats) {
                    const now = performance.now();
                    const timeDelta = (now - this.lastStatsTime) / 1000; // seconds
                    const frameDelta = videoStats.totalVideoFrames - this.lastFrameCount;

                    this.currentStats.fps = Math.round(frameDelta / timeDelta);

                    this.lastFrameCount = videoStats.totalVideoFrames;
                    this.lastStatsTime = now;
                }
            }

            // WebRTC stats
            if (this.transport instanceof WebRTCTransport) {
                const rtcStats = await this.transport.getStats();

                // Extract bitrate, packets lost, jitter
                for (const [_id, stat] of Object.entries(rtcStats)) {
                    const s = stat as any;

                    if (s.type === 'inbound-rtp' && s.mediaType === 'video') {
                        // Bitrate (bytes per second → kbps)
                        if (s.bytesReceived !== undefined) {
                            this.currentStats.bitrate = Math.round((s.bytesReceived * 8) / 1000);
                        }

                        // Packets lost
                        if (s.packetsLost !== undefined) {
                            this.currentStats.packetsLost = s.packetsLost;
                        }

                        // Jitter
                        if (s.jitter !== undefined) {
                            this.currentStats.jitter = Math.round(s.jitter * 1000); // Convert to ms
                        }
                    }

                    // Round-trip time (latency)
                    if (s.type === 'candidate-pair' && s.state === 'succeeded') {
                        if (s.currentRoundTripTime !== undefined) {
                            this.currentStats.latency = Math.round(s.currentRoundTripTime * 1000); // Convert to ms
                        }
                    }
                }
            }

            // Notify callback
            this.config.onStatsUpdate?.(this.currentStats);

        } catch (error) {
            this.logger.warn(`Stats collection error: ${error}`);
        }
    }

    /**
     * Stop stats collection
     */
    private stopStatsCollection(): void {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
    }

    /**
     * Get current stream stats
     */
    getStats(): StreamStats {
        return { ...this.currentStats };
    }

    /**
     * Cleanup and close connection
     */
    async cleanup(): Promise<void> {
        this.logger.info('Cleaning up stream manager');

        // Stop stats collection
        this.stopStatsCollection();

        if (this.transport) {
            await this.transport.close();
            this.transport = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        if (this.audioElement) {
            this.audioElement.srcObject = null;
            this.audioElement.remove();
            this.audioElement = null;
        }
    }

    /**
     * Get current transport stats (legacy method)
     */
    async getTransportStats(): Promise<Record<string, any>> {
        if (this.transport instanceof WebRTCTransport) {
            return await this.transport.getStats();
        }
        return {};
    }

    /**
     * Get input handler for attaching event listeners
     */
    getInput(): StreamInput {
        return this.input;
    }
}
