'use client'
import { Button, Stack } from '@mui/material'
import { useRouter } from 'next/navigation';
import React from 'react'

export default function PlayAndLearnUI() {
    const router = useRouter();
    const handleGetStarted = () => {
        const params = new URLSearchParams({
            redirect_uri: '/hosts',
            source: 'home_banner',
            action: 'get_started'
        });

        router.push(`/login?${params.toString()}`);
    }

    return (
        <>
            <Stack direction={"row"} spacing={2} alignItems={"center"} mt={5}>
                <Button
                    onClick={handleGetStarted}
                    sx={{
                        backgroundColor: "#39FF14",
                        color: "#000",
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: 600,
                        padding: "12px 24px",
                        borderRadius: "5px",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        },
                    }}
                >
                    Get Started
                </Button>
                <Button
                    sx={{
                        backgroundColor: "#1A1A2E",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: 600,
                        padding: "12px 24px",
                        borderRadius: "5px",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        },
                    }}
                >
                    Learn More
                </Button>
            </Stack>
        </>
    )
}
