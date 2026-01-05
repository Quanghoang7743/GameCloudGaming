'use client';

import { Box, Typography } from '@mui/material';
import { StreamStats } from '@/lib/stream/manager';

interface StreamStatsOverlayProps {
    stats: StreamStats;
    visible: boolean;
}

export function StreamStatsOverlay({ stats, visible }: StreamStatsOverlayProps) {
    if (!visible) return null;

    const getQualityColor = () => {
        if (stats.packetsLost > 100) return '#f44336'; // Red
        if (stats.packetsLost > 10) return '#ff9800'; // Orange
        return '#4caf50'; // Green
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                minWidth: 200,
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                zIndex: 1000,
                userSelect: 'none',
                pointerEvents: 'none',
            }}
        >
            <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Stream Stats
            </Typography>

            <Box sx={{ mt: 1 }}>
                {/* FPS */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">FPS:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {stats.fps}
                    </Typography>
                </Box>

                {/* Resolution */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Resolution:</Typography>
                    <Typography variant="body2">
                        {stats.resolution.width}x{stats.resolution.height}
                    </Typography>
                </Box>

                {/* Codec */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Codec:</Typography>
                    <Typography variant="body2">{stats.codec}</Typography>
                </Box>

                {/* Bitrate */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Bitrate:</Typography>
                    <Typography variant="body2">
                        {(stats.bitrate / 1000).toFixed(1)} Mbps
                    </Typography>
                </Box>

                {/* Latency */}
                {stats.latency > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Latency:</Typography>
                        <Typography variant="body2">{stats.latency} ms</Typography>
                    </Box>
                )}

                {/* Jitter */}
                {stats.jitter > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Jitter:</Typography>
                        <Typography variant="body2">{stats.jitter} ms</Typography>
                    </Box>
                )}

                {/* Packets Lost */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Lost Packets:</Typography>
                    <Typography variant="body2" sx={{ color: getQualityColor() }}>
                        {stats.packetsLost}
                    </Typography>
                </Box>

                {/* Network Quality Indicator */}
                <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Quality:</Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: getQualityColor(),
                                    boxShadow: `0 0 8px ${getQualityColor()}`,
                                }}
                            />
                            <Typography variant="body2" sx={{ color: getQualityColor(), fontWeight: 'bold' }}>
                                {stats.packetsLost > 100 ? 'Poor' : stats.packetsLost > 10 ? 'Fair' : 'Good'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Hint */}
            <Typography
                variant="caption"
                sx={{
                    display: 'block',
                    mt: 1.5,
                    pt: 1,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                }}
            >
                Press F3 to toggle
            </Typography>
        </Box>
    );
}
