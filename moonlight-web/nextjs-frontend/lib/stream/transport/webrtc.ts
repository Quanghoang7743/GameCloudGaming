// WebRTC Transport Implementation
// Handles WebRTC peer connection, signaling, and media channels

import {
    Transport,
    TransportChannel,
    VideoCodecSupport,
    emptyVideoCodecs,
    Logger
} from '../types';
import { TransportChannelId } from '../constants';
import type { StreamSignalingMessage } from '@/lib/api/types';

export class WebRTCTransport implements Transport {
    implementationName = 'webrtc';

    private logger: Logger | null = null;
    private peer: RTCPeerConnection | null = null;
    private channels: Map<TransportChannelId, TransportChannel> = new Map();

    private videoTrack: MediaStreamTrack | null = null;
    private audioTrack: MediaStreamTrack | null = null;

    private videoReceiver: RTCRtpReceiver | null = null;

    // Signaling
    onsendmessage?: ((message: any) => void);
    onclose?: ((reason: string) => void);

    // ICE candidates buffer (for early candidates before peer is ready)
    private iceCandidates: RTCIceCandidateInit[] = [];
    private remoteDescription: RTCSessionDescriptionInit | null = null;

    constructor(logger?: Logger) {
        this.logger = logger || null;
    }

    /**
     * Initialize RTCPeerConnection
     */
    initPeer(configuration: RTCConfiguration): void {
        this.logger?.debug('Creating WebRTC Peer Connection');

        if (this.peer) {
            this.logger?.warn('Peer already exists');
            return;
        }

        this.peer = new RTCPeerConnection(configuration);

        // Event listeners
        this.peer.addEventListener('negotiationneeded', this.onNegotiationNeeded.bind(this));
        this.peer.addEventListener('icecandidate', this.onIceCandidate.bind(this));
        this.peer.addEventListener('track', this.onTrack.bind(this));
        this.peer.addEventListener('connectionstatechange', this.onConnectionStateChange.bind(this));
        this.peer.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange.bind(this));

        this.initChannels();

        // Process any buffered messages
        if (this.remoteDescription) {
            this.handleRemoteDescription(this.remoteDescription);
        } else {
            this.onNegotiationNeeded();
        }
        this.tryDequeueIceCandidates();
    }

    /**
     * Initialize data channels
     */
    private initChannels(): void {
        if (!this.peer) return;

        // Create keyboard channel
        const keyboardChannel = this.peer.createDataChannel('keyboard', {
            ordered: false,
            maxRetransmits: 0
        });

        this.channels.set(TransportChannelId.KEYBOARD, {
            type: 'data',
            send: (data: ArrayBuffer) => {
                if (keyboardChannel.readyState === 'open') {
                    keyboardChannel.send(data);
                }
            }
        });

        // Create mouse reliable channel
        const mouseReliableChannel = this.peer.createDataChannel('mouse_reliable', {
            ordered: true
        });

        this.channels.set(TransportChannelId.MOUSE_RELIABLE, {
            type: 'data',
            send: (data: ArrayBuffer) => {
                if (mouseReliableChannel.readyState === 'open') {
                    mouseReliableChannel.send(data);
                }
            }
        });

        // Create mouse absolute channel
        const mouseAbsoluteChannel = this.peer.createDataChannel('mouse_absolute', {
            ordered: false,
            maxRetransmits: 0
        });

        this.channels.set(TransportChannelId.MOUSE_ABSOLUTE, {
            type: 'data',
            send: (data: ArrayBuffer) => {
                if (mouseAbsoluteChannel.readyState === 'open') {
                    mouseAbsoluteChannel.send(data);
                }
            },
            estimatedBufferedBytes: () => mouseAbsoluteChannel.bufferedAmount
        });

        // Create mouse relative channel
        const mouseRelativeChannel = this.peer.createDataChannel('mouse_relative', {
            ordered: false,
            maxRetransmits: 0
        });

        this.channels.set(TransportChannelId.MOUSE_RELATIVE, {
            type: 'data',
            send: (data: ArrayBuffer) => {
                if (mouseRelativeChannel.readyState === 'open') {
                    mouseRelativeChannel.send(data);
                }
            }
        });
    }

    /**
     * Handle negotiation needed event
     */
    private async onNegotiationNeeded(): Promise<void> {
        if (!this.peer) return;

        try {
            await this.peer.setLocalDescription();
            const localDescription = this.peer.localDescription;

            if (!localDescription) {
                this.logger?.error('Failed to set local description');
                return;
            }

            this.logger?.debug(`Sending local description: ${localDescription.type}`);

            this.onsendmessage?.({
                WebRtc: {
                    Description: {
                        ty: localDescription.type,
                        sdp: localDescription.sdp || ''
                    }
                }
            });
        } catch (error) {
            this.logger?.error(`Negotiation failed: ${error}`);
        }
    }

    /**
     * Handle ICE candidate event
     */
    private onIceCandidate(event: RTCPeerConnectionIceEvent): void {
        if (event.candidate) {
            const candidate = event.candidate.toJSON();

            // Detailed logging for debugging
            this.logger?.debug(`[ICE] New candidate: type=${event.candidate.type}, protocol=${event.candidate.protocol}, address=${event.candidate.address || 'unknown'}`);
            this.logger?.debug(`[ICE] Candidate string: ${candidate.candidate}`);

            this.onsendmessage?.({
                WebRtc: {
                    AddIceCandidate: {
                        candidate: candidate.candidate || '',
                        sdp_mid: candidate.sdpMid || null,
                        sdp_mline_index: candidate.sdpMLineIndex || null,
                        username_fragment: candidate.usernameFragment || null
                    }
                }
            });
        } else {
            this.logger?.debug('[ICE] All local candidates gathered (end-of-candidates)');
        }
    }

    /**
     * Handle incoming track (video/audio)
     */
    private onTrack(event: RTCTrackEvent): void {
        const track = event.track;

        this.logger?.debug(`Received ${track.kind} track`);

        if (track.kind === 'video') {
            this.videoTrack = track;
            this.videoReceiver = event.receiver;

            // Set content hint for low latency
            if ('contentHint' in track) {
                track.contentHint = 'motion';
            }

            // Notify video channel listeners
            const videoChannel = this.channels.get(TransportChannelId.HOST_VIDEO);
            if (videoChannel?.onTrack) {
                videoChannel.onTrack(track);
            }
        } else if (track.kind === 'audio') {
            this.audioTrack = track;

            // Notify audio channel listeners
            const audioChannel = this.channels.get(TransportChannelId.HOST_AUDIO);
            if (audioChannel?.onTrack) {
                audioChannel.onTrack(track);
            }
        }
    }

    /**
     * Handle connection state changes
     */
    private onConnectionStateChange(): void {
        if (!this.peer) return;

        const state = this.peer.connectionState;
        this.logger?.debug(`Connection state: ${state}`);

        if (state === 'failed' || state === 'closed') {
            this.onclose?.('Connection failed');
        } else if (state === 'connected') {
            // Set low latency hints
            this.setLowLatencyHints();
        }
    }

    private onIceConnectionStateChange(): void {
        if (!this.peer) return;

        const iceState = this.peer.iceConnectionState;
        const gatheringState = this.peer.iceGatheringState;

        this.logger?.info(`[ICE] Connection state: ${iceState}, Gathering state: ${gatheringState}`);

        if (iceState === 'failed') {
            this.logger?.error('[ICE] Connection failed - check firewall, STUN servers, or network');
        } else if (iceState === 'disconnected') {
            this.logger?.warn('[ICE] Connection disconnected - may recover automatically');
        } else if (iceState === 'connected') {
            this.logger?.info('[ICE] Connection established successfully!');
        }
    }

    /**
     * Set low latency jitter buffer hints
     */
    private setLowLatencyHints(): void {
        if (!this.peer) return;

        for (const receiver of this.peer.getReceivers()) {
            try {
                // @ts-ignore - These are experimental properties
                receiver.jitterBufferTarget = 0;
                receiver.playoutDelayHint = 0;
            } catch (e) {
                // Ignore if not supported
            }
        }
    }

    /**
     * Receive signaling message from server
     */
    onReceiveMessage(message: any): void {
        if ('Description' in message) {
            const description = message.Description;
            this.handleRemoteDescription({
                type: description.ty as RTCSdpType,
                sdp: description.sdp
            });
        } else if ('AddIceCandidate' in message) {
            const candidate = message.AddIceCandidate;
            this.addIceCandidate({
                candidate: candidate.candidate,
                sdpMid: candidate.sdp_mid,
                sdpMLineIndex: candidate.sdp_mline_index,
                usernameFragment: candidate.username_fragment
            });
        }
    }

    /**
     * Handle remote SDP description
     */
    private async handleRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void> {
        this.logger?.debug(`Received remote description: ${sdp.type}`);

        if (!this.peer) {
            // Buffer for later
            this.remoteDescription = sdp;
            return;
        }

        this.remoteDescription = null;

        try {
            await this.peer.setRemoteDescription(sdp);

            // If we received an offer, send answer
            if (sdp.type === 'offer') {
                await this.peer.setLocalDescription();
                const localDescription = this.peer.localDescription;

                if (localDescription) {
                    this.onsendmessage?.({
                        WebRtc: {
                            Description: {
                                ty: localDescription.type,
                                sdp: localDescription.sdp || ''
                            }
                        }
                    });
                }
            }
        } catch (error) {
            this.logger?.error(`Failed to set remote description: ${error}`);
        }
    }

    /**
     * Add ICE candidate
     */
    private async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        this.logger?.debug('Received ICE candidate');

        if (!this.peer) {
            // Buffer for later
            this.iceCandidates.push(candidate);
            return;
        }

        try {
            await this.peer.addIceCandidate(candidate);
        } catch (error) {
            this.logger?.error(`Failed to add ICE candidate: ${error}`);
        }
    }

    /**
     * Process buffered ICE candidates
     */
    private async tryDequeueIceCandidates(): Promise<void> {
        if (!this.peer) return;

        for (const candidate of this.iceCandidates) {
            try {
                await this.peer.addIceCandidate(candidate);
            } catch (error) {
                this.logger?.error(`Failed to add buffered ICE candidate: ${error}`);
            }
        }

        this.iceCandidates = [];
    }

    /**
     * Setup video channel
     */
    async setupHostVideo(options: { type: string[] }): Promise<VideoCodecSupport> {
        // Check codec support via RTCRtpReceiver capabilities
        const codecs = emptyVideoCodecs();

        if ('getCapabilities' in RTCRtpReceiver) {
            const capabilities = RTCRtpReceiver.getCapabilities('video');

            if (capabilities) {
                // Check for H264 support
                const hasH264 = capabilities.codecs.some(c =>
                    c.mimeType.toLowerCase().includes('h264')
                );
                codecs.H264 = hasH264;
                codecs.H264_HIGH8_444 = hasH264;

                // Check for H265 support
                const hasH265 = capabilities.codecs.some(c =>
                    c.mimeType.toLowerCase().includes('h265') ||
                    c.mimeType.toLowerCase().includes('hevc')
                );
                codecs.H265 = hasH265;
                codecs.H265_MAIN10 = hasH265;

                // Check for AV1 support
                const hasAV1 = capabilities.codecs.some(c =>
                    c.mimeType.toLowerCase().includes('av1')
                );
                codecs.AV1 = hasAV1;
                codecs.AV1_MAIN8 = hasAV1;
            }
        }

        // Create video channel
        this.channels.set(TransportChannelId.HOST_VIDEO, {
            type: 'videotrack',
            onTrack: null
        });

        return codecs;
    }

    /**
     * Setup audio channel
     */
    setupHostAudio(options: { type: string[] }): void {
        // Create audio channel
        this.channels.set(TransportChannelId.HOST_AUDIO, {
            type: 'audiotrack',
            onTrack: null
        });
    }

    /**
     * Get transport channel by ID
     */
    getChannel(id: TransportChannelId): TransportChannel {
        const channel = this.channels.get(id);
        if (!channel) {
            throw new Error(`Channel ${id} not initialized`);
        }
        return channel;
    }

    /**
     * Close connection
     */
    async close(): Promise<void> {
        this.logger?.debug('Closing WebRTC transport');
        this.peer?.close();
        this.peer = null;
        this.channels.clear();
    }

    /**
     * Get WebRTC stats
     */
    async getStats(): Promise<Record<string, any>> {
        if (!this.videoReceiver) return {};

        const stats = await this.videoReceiver.getStats();
        const statsData: Record<string, any> = {};

        for (const [_key, value] of stats) {
            if ('decoderImplementation' in value) {
                statsData.decoder = value.decoderImplementation;
            }
            if ('framesPerSecond' in value) {
                statsData.fps = value.framesPerSecond;
            }
            if ('packetsLost' in value) {
                statsData.packetsLost = value.packetsLost;
            }
        }

        return statsData;
    }
}
