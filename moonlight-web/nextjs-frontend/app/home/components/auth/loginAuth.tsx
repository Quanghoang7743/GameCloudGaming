'use client'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LoginAuth() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const handleLogin = () => {
        if (isAuthenticated) {
            router.push('/home')
        } else {
            const params = new URLSearchParams({
                redirect_uri: '/home',
                source: 'home_banner',
                action: 'join'
            });
            router.push(`/login?${params.toString()}`);
        }
    }
    return (
        <>
            <Button
                sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#000",
                    background: 'linear-gradient(45deg, #F30FFF 0%, #A45DFF 51%, #32CEFF 100%)',
                    padding: "5px 15px",
                    borderRadius: "10px",
                }}
                onClick={handleLogin}
            >
                Get Started
            </Button>
        </>
    )
}
