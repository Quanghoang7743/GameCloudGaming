'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, IconButton, CircularProgress, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { StreamViewer } from '@/components/stream/StreamViewer';
import { StreamControls } from '@/components/stream/StreamControls';
import { WebRTCPeer } from '@/lib/webrtc/peer';
import { WebSocketManager } from '@/lib/api/websocket';

export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const hostId = params.hostId as string;
    const appId = params.appId as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<WebRTCPeer | null>(null);
    const wsRef = useRef<WebSocketManager | null>(null);

    const [controlsOpen, setControlsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        initializeStream();

        return () => {
            cleanup();
        };
    }, [hostId, appId]);

    const initializeStream = async () => {
        try {
            setLoading(true);
            setError(null);

            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
            const ws = new WebSocketManager(`${wsUrl}/api/host/stream`);
            wsRef.current = ws;

            await ws.connect();

            // Initialize WebRTC peer
            const peer = new WebRTCPeer({
                hostId,
                appId,
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:stun1.l.google.com:19302',
                        ],
                    },
                ],
            });
            peerRef.current = peer;

            if (videoRef.current) {
                await peer.initialize(videoRef.current);

                // Create and send offer
                const offer = await peer.createOffer();
                ws.send('offer', { offer });

                // Listen for answer
                ws.on('answer', async ({ answer }) => {
                    await peer.handleAnswer(answer);
                });

                // Listen for ICE candidates
                ws.on('iceCandidate', async ({ candidate }) => {
                    await peer.addIceCandidate(candidate);
                });

                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to initialize stream:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect');
            setLoading(false);
        }
    };

    const cleanup = () => {
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.disconnect();
            wsRef.current = null;
        }
    };

    const handleDisconnect = () => {
        cleanup();
        router.push(`/games/${hostId}`);
    };

    const handleToggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Update fullscreen state on change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'black',
                    color: 'white'
                }}
            >
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Connecting to stream...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'black',
                    color: 'white'
                }}
            >
                <Typography variant="h6" color="error" gutterBottom>
                    Connection Failed
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {error}
                </Typography>
                <IconButton onClick={handleDisconnect} color="primary">
                    Go Back
                </IconButton>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <StreamViewer
                videoRef={videoRef}
                onVideoClick={() => setControlsOpen(!controlsOpen)}
            />

            {/* Menu button */}
            {!controlsOpen && (
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                        },
                    }}
                    onClick={() => setControlsOpen(true)}
                >
                    <MenuIcon />
                </IconButton>
            )}

            <StreamControls
                open={controlsOpen}
                onClose={() => setControlsOpen(false)}
                onDisconnect={handleDisconnect}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                stats={stats}
            />
        </Box>
    );
}
