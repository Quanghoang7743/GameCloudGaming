// Stream-specific type definitions

export interface StreamSettings {
    // Video settings
    videoSize: 'native' | '720p' | '1080p' | '1440p' | '4k' | 'custom';
    videoSizeCustom: { width: number; height: number };
    videoCodec: 'auto' | 'h264' | 'h265' | 'av1';
    fps: number;
    bitrate: number;
    packetSize: number;

    // Audio settings
    playAudioLocal: boolean;

    // Transport settings
    dataTransport: 'auto' | 'webrtc' | 'websocket';

    // Canvas renderer
    canvasRenderer: 'auto' | 'webcodecs' | 'broadway';

    // Queue sizes
    videoFrameQueueSize: number;
    audioSampleQueueSize: number;

    // Input settings
    mouseScrollMode: 'auto' | 'horizontal' | 'vertical';
    controllerConfig?: any;
}

export interface VideoCodecSupport {
    H264: boolean;
    H264_HIGH8_444: boolean;
    H265: boolean;
    H265_MAIN10: boolean;
    H265_REXT8_444: boolean;
    H265_REXT10_444: boolean;
    AV1: boolean;
    AV1_MAIN8: boolean;
    AV1_MAIN10: boolean;
    AV1_REXT8_444: boolean;
    AV1_REXT10_444: boolean;
}

export type VideoCodec =
    | 'H264'
    | 'H264_HIGH8_444'
    | 'H265'
    | 'H265_MAIN10'
    | 'H265_REXT8_444'
    | 'H265_REXT10_444'
    | 'AV1'
    | 'AV1_MAIN8'
    | 'AV1_MAIN10'
    | 'AV1_REXT8_444'
    | 'AV1_REXT10_444';

export interface VideoSetupInfo {
    codec: VideoCodec;
    fps: number;
    width: number;
    height: number;
}

export interface AudioSetupInfo {
    channels: number;
    sampleRate: number;
}

export type TransportChannelType = 'videotrack' | 'audiotrack' | 'data';

export interface TransportChannel {
    type: TransportChannelType;
    send?: (data: ArrayBuffer) => void;
    onTrack?: ((track: MediaStreamTrack) => void) | null;
    addTrackListener?: (callback: (track: MediaStreamTrack) => void) => void;
    addReceiveListener?: (callback: (data: ArrayBuffer) => void) => void;
    estimatedBufferedBytes?: () => number | null;
}

// Data channel type for input
export interface DataTransportChannel {
    type: 'data';
    send: (data: ArrayBuffer) => void;
    addReceiveListener?: (callback: (data: ArrayBuffer) => void) => void;
    estimatedBufferedBytes?: () => number | null;
}

export interface Transport {
    implementationName: string;
    onsendmessage?: (message: any) => void;
    onclose?: (reason: string) => void;

    initPeer(config: RTCConfiguration): void;
    onReceiveMessage(message: any): void;
    setupHostVideo(options: { type: string[] }): Promise<VideoCodecSupport>;
    setupHostAudio(options: { type: string[] }): void;
    getChannel(channel: TransportChannelId): TransportChannel;
    close(): Promise<void>;
}

export enum TransportChannelId {
    HOST_VIDEO = 0,
    HOST_AUDIO = 1,
    CLIENT_INPUT = 2,
}

export type TransportShutdown =
    | 'failednoconnect'
    | 'graceful'
    | 'error';

export interface Logger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

// Helper functions
export function emptyVideoCodecs(): VideoCodecSupport {
    return {
        H264: false,
        H264_HIGH8_444: false,
        H265: false,
        H265_MAIN10: false,
        H265_REXT8_444: false,
        H265_REXT10_444: false,
        AV1: false,
        AV1_MAIN8: false,
        AV1_MAIN10: false,
        AV1_REXT8_444: false,
        AV1_REXT10_444: false,
    };
}

export function allVideoCodecs(): VideoCodecSupport {
    return {
        H264: true,
        H264_HIGH8_444: true,
        H265: true,
        H265_MAIN10: true,
        H265_REXT8_444: true,
        H265_REXT10_444: true,
        AV1: true,
        AV1_MAIN8: true,
        AV1_MAIN10: true,
        AV1_REXT8_444: true,
        AV1_REXT10_444: true,
    };
}

export function andVideoCodecs(a: VideoCodecSupport, b: VideoCodecSupport): VideoCodecSupport {
    return {
        H264: a.H264 && b.H264,
        H264_HIGH8_444: a.H264_HIGH8_444 && b.H264_HIGH8_444,
        H265: a.H265 && b.H265,
        H265_MAIN10: a.H265_MAIN10 && b.H265_MAIN10,
        H265_REXT8_444: a.H265_REXT8_444 && b.H265_REXT8_444,
        H265_REXT10_444: a.H265_REXT10_444 && b.H265_REXT10_444,
        AV1: a.AV1 && b.AV1,
        AV1_MAIN8: a.AV1_MAIN8 && b.AV1_MAIN8,
        AV1_MAIN10: a.AV1_MAIN10 && b.AV1_MAIN10,
        AV1_REXT8_444: a.AV1_REXT8_444 && b.AV1_REXT8_444,
        AV1_REXT10_444: a.AV1_REXT10_444 && b.AV1_REXT10_444,
    };
}

export function hasAnyCodec(codecs: VideoCodecSupport): boolean {
    return Object.values(codecs).some(v => v);
}

export function getSelectedVideoCodec(formatRaw: number): VideoCodec | null {
    // Map format number to codec
    // TODO: Implement based on Rust backend format codes
    const codecMap: Record<number, VideoCodec> = {
        0: 'H264',
        1: 'H265',
        2: 'AV1',
    };
    return codecMap[formatRaw] || null;
}

export function createSupportedVideoFormatsBits(support: VideoCodecSupport): number {
    // Convert codec support to bitmask
    let bits = 0;
    if (support.H264) bits |= (1 << 0);
    if (support.H264_HIGH8_444) bits |= (1 << 1);
    if (support.H265) bits |= (1 << 2);
    if (support.H265_MAIN10) bits |= (1 << 3);
    if (support.H265_REXT8_444) bits |= (1 << 4);
    if (support.H265_REXT10_444) bits |= (1 << 5);
    if (support.AV1) bits |= (1 << 6);
    if (support.AV1_MAIN8) bits |= (1 << 7);
    if (support.AV1_MAIN10) bits |= (1 << 8);
    if (support.AV1_REXT8_444) bits |= (1 << 9);
    if (support.AV1_REXT10_444) bits |= (1 << 10);
    return bits;
}
