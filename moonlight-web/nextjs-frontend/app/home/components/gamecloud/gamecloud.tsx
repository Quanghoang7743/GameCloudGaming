'use client'
import { useAuth } from '@/app/context/AuthContext'
import { Button, keyframes, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'


export const GameCloud = () => {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const pulseAnimation = keyframes`
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    `;
    const handlePlayGame = () => {
        if (isAuthenticated) {
            router.push('/hosts')
        } else {
            const params = new URLSearchParams({
                redirect_uri: '/hosts',
                source: 'home_banner',
                action: 'join'
            });
            router.push(`/login?${params.toString()}`);
        }
    }
    return (
        <>
            <Button sx={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#fff",
                padding: "5px 10px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                position: "relative",
            }}
                onClick={handlePlayGame}
            >
                <Typography component="span"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        animation: `${pulseAnimation} 2s infinite ease-in-out`,
                    }}
                >
                    <Image src="/active.svg" alt="active" width={10} height={10} />
                </Typography>
                Cloud Gaming
            </Button>
        </>
    )
}
