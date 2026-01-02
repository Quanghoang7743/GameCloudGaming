'use client'
import { Alert, Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const onClickCreateAccount = () => {
        router.push("/register")
    }

    const validateForm = (): boolean => {
        setError('')
        setSuccess('')

        if (!username) {
            setError('Username or email is required')
            return false
        }
        if (!password) {
            setError('Password is required')
            return false
        }

        return true
    }

    const handleLogin = async () => {
        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)

            // Use login from AuthContext
            await login(username, password)

            setSuccess('Login successful! Redirecting...')

            // Redirect to home page after successful login
            setTimeout(() => {
                router.push('/')
            }, 1500)

        } catch (error: any) {
            // Handle different error scenarios
            let errorMessage = 'Login failed. Please try again.'

            if (error.response?.status === 401) {
                errorMessage = 'Incorrect username or password'
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.detail || 'Account is inactive'
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail
            }

            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleLogin()
        }
    }

    return (
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} height={'100vh'} width={"100%"}>
            <Box sx={{ width: "100%", height: "100%", backgroundColor: "#fff" }}>
                <Image src={'/banner/Banner1.jpg'} width={1920} height={1080} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Banner" />
            </Box>
            <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <Stack spacing={1} alignContent={"flex-start"} width={"50%"} mb={2}>
                    <Typography sx={{ fontSize: "44px", fontWeight: "600" }}>
                        VIVEX ID
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: "400" }}>Login to your account</Typography>
                </Stack>

                {error && (
                    <Stack width={"50%"} mb={2}>
                        <Alert severity="error">{error}</Alert>
                    </Stack>
                )}

                {success && (
                    <Stack width={"50%"} mb={2}>
                        <Alert severity="success">{success}</Alert>
                    </Stack>
                )}

                <Stack direction={"column"} spacing={2} width={"50%"}>
                    <Stack direction={"column"} spacing={1} width={"100%"}>
                        <TextField
                            fullWidth
                            placeholder='Username or Email'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </Stack>
                    <Stack direction={"column"} spacing={1} width={"100%"}>
                        <TextField
                            fullWidth
                            placeholder='Password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                    </Stack>
                </Stack>
                <Stack direction={"row"} justifyContent={"flex-end"} spacing={2} width={"50%"} mt={2} mb={2}>
                    <Box component={"button"} onClick={onClickCreateAccount} sx={{ fontSize: "14px", fontWeight: "600" }} disabled={loading}>
                        Create Account
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box component={"button"} sx={{ fontSize: "14px", fontWeight: "600" }} disabled={loading}>
                        Forgot Password?
                    </Box>
                </Stack>
                <Button
                    sx={{ width: "50%", height: "50px", border: "1px solid #fff" }}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    <Typography sx={{ fontSize: "14px", fontWeight: "600" }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Typography>
                </Button>
            </Box>
        </Box>
    )
}
