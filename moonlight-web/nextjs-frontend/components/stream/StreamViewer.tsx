'use client';

import { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface StreamViewerProps {
    videoRef: React.RefObject<HTMLVideoElement | null> | ((element: HTMLVideoElement | null) => void);
    onVideoClick?: () => void;
}

export function StreamViewer({ videoRef, onVideoClick }: StreamViewerProps) {
    useEffect(() => {
        // Request fullscreen on mobile devices
        const video = typeof videoRef === 'function' ? null : videoRef.current;
        if (video) {
            // Set video properties for optimal streaming
            video.playsInline = true;
            video.controls = false;
        }
    }, [videoRef]);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                bgcolor: 'black',
                overflow: 'hidden',
            }}
            onClick={onVideoClick}
        >
            <video
                ref={videoRef as any}
                autoPlay
                playsInline
                muted={false}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                }}
            />
        </Box>
    );
}
