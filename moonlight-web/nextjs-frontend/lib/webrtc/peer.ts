// WebRTC Peer Connection Manager
// Handles WebRTC connection to streaming host

export interface IceServer {
    urls: string[];
    username?: string;
    credential?: string;
}

export interface StreamConfig {
    iceServers: IceServer[];
    hostId: string;
    appId: string;
}

export class WebRTCPeer {
    private pc: RTCPeerConnection | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private dataChannel: RTCDataChannel | null = null;

    constructor(private config: StreamConfig) { }

    async initialize(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;

        // Create peer connection
        this.pc = new RTCPeerConnection({
            iceServers: this.config.iceServers,
        });

        // Handle ICE candidates
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendIceCandidate(event.candidate);
            }
        };

        // Handle incoming media tracks
        this.pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            if (this.videoElement && event.streams[0]) {
                this.videoElement.srcObject = event.streams[0];
            }
        };

        // Handle connection state changes
        this.pc.onconnectionstatechange = () => {
            console.log('Connection state:', this.pc?.connectionState);
        };
    }

    async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.pc) {
            throw new Error('Peer connection not initialized');
        }

        const offer = await this.pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });

        await this.pc.setLocalDescription(offer);
        return offer;
    }

    async handleAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.pc) {
            throw new Error('Peer connection not initialized');
        }

        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async addIceCandidate(candidate: RTCIceCandidateInit) {
        if (!this.pc) {
            throw new Error('Peer connection not initialized');
        }

        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    private sendIceCandidate(candidate: RTCIceCandidate) {
        // TODO: Send via WebSocket to backend
        console.log('ICE candidate:', candidate);
    }

    close() {
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    getStats(): Promise<RTCStatsReport> | null {
        return this.pc?.getStats() || null;
    }
}
