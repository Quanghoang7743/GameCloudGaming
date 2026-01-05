'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, IconButton, CircularProgress, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { StreamViewer } from '@/components/stream/StreamViewer';
import { StreamStatsOverlay } from '@/components/stream/StreamStatsOverlay';
import { StreamControls } from '@/components/stream/StreamControls';
import { StreamManager, StreamStats } from '@/lib/stream/manager';
import { getDefaultStreamSettings } from '@/lib/stream/utils';

export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const hostId = parseInt(params.hostId as string);
    const appId = parseInt(params.appId as string);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamManagerRef = useRef<StreamManager | null>(null);

    const [controlsOpen, setControlsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [streamInfo, setStreamInfo] = useState<string>('Initializing...');
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState<StreamStats>({
        fps: 0,
        bitrate: 0,
        latency: 0,
        resolution: { width: 0, height: 0 },
        codec: 'unknown',
        packetsLost: 0,
        jitter: 0
    });

    const [videoMounted, setVideoMounted] = useState(false);

    // Poll for video element (since ref changes don't trigger re-render)
    useEffect(() => {
        console.log('[StreamPage] Setting up video element polling...');
        let pollCount = 0;
        const checkVideo = () => {
            pollCount++;
            console.log(`[StreamPage] Poll #${pollCount}: videoRef.current =`, videoRef.current);
            if (videoRef.current && !videoMounted) {
                console.log('[StreamPage] Video element detected!');
                setVideoMounted(true);
            }
        };

        // Check immediately
        checkVideo();

        // Then poll every 100ms until found (max 50 times = 5 seconds)
        const interval = setInterval(() => {
            if (pollCount < 50) {
                checkVideo();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [videoMounted]);

    // Initialize stream when video is mounted
    useEffect(() => {
        if (videoMounted) {
            console.log('[StreamPage] Initializing stream...');
            initializeStream();
        }

        return () => {
            if (videoMounted) {
                cleanup();
            }
        };
    }, [videoMounted, hostId, appId]);

    const initializeStream = async () => {
        try {
            console.log('[StreamPage] Starting stream initialization...', { hostId, appId });
            setLoading(true);
            setError(null);

            if (!videoRef.current) {
                console.warn('[StreamPage] Video element not ready, waiting...');
                return;
            }

            console.log('[StreamPage] Video element ready, proceeding with setup');

            // Get settings (default for now, can be customized later)
            const settings = getDefaultStreamSettings();

            // WebSocket URL with authentication token
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8080';

            // Get access token from cookie for WebSocket auth
            const accessToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('access_token='))
                ?.split('=')[1];

            if (!accessToken) {
                console.error('[StreamPage] No access token found in cookies!');
                setError('Authentication required');
                setLoading(false);
                return;
            }

            const wsUrl = `${wsProtocol}//${wsHost}/host/stream?token=${accessToken}`;
            console.log('[StreamPage] WebSocket URL constructed (token included)');

            // Create stream manager
            const manager = new StreamManager({
                hostId,
                appId,
                settings,
                wsUrl,
                onMessage: (type, data) => {
                    if (type === 'debug') {
                        setStreamInfo(data);
                    } else if (type === 'connectionComplete') {
                        setStreamInfo(`Stream: ${data.width}x${data.height} @ ${data.fps}fps`);
                        setLoading(false);
                    }
                },
                onError: (err) => {
                    console.error('Stream error:', err);
                    setError(err);
                    setLoading(false);
                },
                onStatsUpdate: (newStats) => {
                    setStats(newStats);
                }
            });

            streamManagerRef.current = manager;

            // Initialize streaming
            await manager.initialize(videoRef.current);

            // Setup input handlers
            const input = manager.getInput();
            const videoElement = videoRef.current;
            const container = videoElement.parentElement as HTMLElement;

            // Mouse events
            const handleMouseMove = (e: MouseEvent) => {
                const rect = videoElement.getBoundingClientRect();
                input.onMouseMove(e, rect);
            };

            const handleMouseDown = (e: MouseEvent) => {
                const rect = videoElement.getBoundingClientRect();
                input.onMouseDown(e, rect);
            };

            const handleMouseUp = (e: MouseEvent) => {
                input.onMouseUp(e);
            };

            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                input.onMouseWheel(e);
            };

            // Keyboard events
            const handleKeyDown = (e: KeyboardEvent) => {
                // F3 to toggle stats (don't preventDefault for this)
                if (e.key === 'F3') {
                    e.preventDefault();
                    setShowStats(prev => !prev);
                    return;
                }

                e.preventDefault();
                input.onKeyDown(e);
            };

            const handleKeyUp = (e: KeyboardEvent) => {
                e.preventDefault();
                input.onKeyUp(e);
            };

            // Attach listeners
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mousedown', handleMouseDown);
            container.addEventListener('mouseup', handleMouseUp);
            container.addEventListener('wheel', handleWheel, { passive: false });

            // Keyboard listeners on window (need focus)
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            // Cleanup function to remove listeners
            const cleanupListeners = () => {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mousedown', handleMouseDown);
                container.removeEventListener('mouseup', handleMouseUp);
                container.removeEventListener('wheel', handleWheel);
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            };

            // Store cleanup function
            (streamManagerRef.current as any).cleanupListeners = cleanupListeners;

        } catch (err) {
            console.error('Failed to initialize stream:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect');
            setLoading(false);
        }
    };

    const cleanup = () => {
        if (streamManagerRef.current) {
            // Cleanup event listeners
            if ((streamManagerRef.current as any).cleanupListeners) {
                (streamManagerRef.current as any).cleanupListeners();
            }

            // Cleanup stream manager
            streamManagerRef.current.cleanup();
            streamManagerRef.current = null;
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

    // Update stats periodically
    useEffect(() => {
        if (!loading && streamManagerRef.current) {
            const interval = setInterval(async () => {
                if (streamManagerRef.current) {
                    const newStats = await streamManagerRef.current.getStats();
                    setStats(newStats);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [loading]);

    return (
        <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Always render video (needed for ref) */}
            <StreamViewer
                videoRef={videoRef}
                onVideoClick={() => setControlsOpen(!controlsOpen)}
            />

            {/* Loading overlay */}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 1000,
                    }}
                >
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography color="white">{streamInfo}</Typography>
                </Box>
            )}

            {/* Error overlay */}
            {error && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.95)',
                        zIndex: 1000,
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
            )}

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

            {/* Stream Stats Overlay */}
            <StreamStatsOverlay stats={stats} visible={showStats} />

            <StreamControls
                open={controlsOpen}
                onClose={() => setControlsOpen(false)}
                onDisconnect={handleDisconnect}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
            />
        </Box>
    );
}
