'use client'
import { Button, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function BtnJoin() {
    const router = useRouter()
    const handleJoin = () => {
        const params = new URLSearchParams({
            redirect_uri: '/hosts',
            source: 'home_banner',
            action: 'join'
        });

        router.push(`/login?${params.toString()}`);
    }
    return (
        <Button
            onClick={handleJoin}
            sx={{
                backgroundColor: "#FFC107",
                color: "#000",
                fontSize: "24px",
                fontWeight: 600,
                padding: "16px 32px",
                borderRadius: "8px",
                "&:hover": {
                    backgroundColor: "#FFD54F"
                }
            }}>
            <Typography>Join Now</Typography>
        </Button>
    )
}
