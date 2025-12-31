'use client'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LoginAuth() {
    const router = useRouter()

    const handleLogin = () => {
        router.push("/authentication")
    }
    return (
        <>
            <Button
                sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#fff",
                    backgroundColor: "#19df54ff",
                    padding: "5px 10px",
                    border: '2px solid #fff'
                }}
                onClick={handleLogin}
            >
                Get Started
            </Button>
        </>
    )
}
