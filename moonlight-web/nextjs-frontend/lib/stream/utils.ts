// Stream utility functions

import { StreamSettings } from './types';

/**
 * Calculate streamer resolution based on settings
 */
export function getStreamerSize(
    settings: StreamSettings,
    viewerScreenSize: [number, number]
): [number, number] {
    let width: number, height: number;

    if (settings.videoSize === '720p') {
        width = 1280;
        height = 720;
    } else if (settings.videoSize === '1080p') {
        width = 1920;
        height = 1080;
    } else if (settings.videoSize === '1440p') {
        width = 2560;
        height = 1440;
    } else if (settings.videoSize === '4k') {
        width = 3840;
        height = 2160;
    } else if (settings.videoSize === 'custom') {
        width = settings.videoSizeCustom.width;
        height = settings.videoSizeCustom.height;
    } else { // native
        width = viewerScreenSize[0];
        height = viewerScreenSize[1];
    }

    return [width, height];
}

/**
 * Create pretty list formatting
 */
export function createPrettyList(list: string[]): string {
    if (list.length === 0) return '[]';
    if (list.length === 1) return `[${list[0]}]`;

    return `[${list.join(', ')}]`;
}

/**
 * Get video codec hint based on user settings
 */
import { VideoCodecSupport, emptyVideoCodecs, allVideoCodecs } from './types';

export function getVideoCodecHint(settings: StreamSettings): VideoCodecSupport {
    const hint = emptyVideoCodecs();

    if (settings.videoCodec === 'h264') {
        hint.H264 = true;
        hint.H264_HIGH8_444 = true;
    } else if (settings.videoCodec === 'h265') {
        hint.H265 = true;
        hint.H265_MAIN10 = true;
        hint.H265_REXT8_444 = true;
        hint.H265_REXT10_444 = true;
    } else if (settings.videoCodec === 'av1') {
        hint.AV1 = true;
        hint.AV1_MAIN8 = true;
        hint.AV1_MAIN10 = true;
        hint.AV1_REXT8_444 = true;
        hint.AV1_REXT10_444 = true;
    } else if (settings.videoCodec === 'auto') {
        return allVideoCodecs();
    }

    return hint;
}

/**
 * Default stream settings
 */
export function getDefaultStreamSettings(): StreamSettings {
    return {
        videoSize: '1080p',
        videoSizeCustom: { width: 1920, height: 1080 },
        videoCodec: 'auto',
        fps: 60,
        bitrate: 20000,
        packetSize: 1024,
        playAudioLocal: true,
        dataTransport: 'auto',
        canvasRenderer: 'auto',
        videoFrameQueueSize: 10,
        audioSampleQueueSize: 10,
        mouseScrollMode: 'auto',
    };
}
