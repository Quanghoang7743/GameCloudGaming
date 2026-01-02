"use client"
import { Alert, Box, Button, Checkbox, Divider, Stack, TextField, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'
import { API_ROUTER } from '@/lib/api/router'

export default function RegisterPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const validateForm = (): boolean => {
        setError('')
        setSuccess('')

        if (!username) {
            setError('Username is required')
            return false
        }
        if (!email) {
            setError('Email is required')
            return false
        }
        if (!password) {
            setError('Password is required')
            return false
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return false
        }
        if (!confirmPassword) {
            setError('Confirm Password is required')
            return false
        }
        if (password !== confirmPassword) {
            setError('Password and Confirm Password do not match')
            return false
        }
        if (!agreedToTerms) {
            setError('You must agree to the terms and conditions')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        console.log('=== handleSubmit called ===')
        console.log('Form data:', { username, email, password, confirmPassword, agreedToTerms })

        if (!validateForm()) {
            console.log('Validation failed')
            return
        }

        console.log('Validation passed, starting submit...')

        try {
            setLoading(true)
            const UserData = {
                username,
                password,
                email
            }

            const res = await axios.post("http://localhost:8001/users", UserData)

            if (res.status === 201) {
                setSuccess('Registration successful! Redirecting to login...')
                setTimeout(() => {
                    router.push("/login")
                }, 1500)
            } else {
                setError('Registration failed. Please try again.')
            }

        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.'
            setError(errorMessage)
        } finally {
            setLoading(false)
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
                    <Typography sx={{ fontSize: "20px", fontWeight: "400" }}>Register to your account</Typography>
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
                        <TextField fullWidth placeholder='Email' onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                    </Stack>
                    <Stack direction={"column"} spacing={1} width={"100%"}>
                        <TextField fullWidth placeholder='Username' onChange={(e) => setUsername(e.target.value)} disabled={loading} />
                    </Stack>
                    <Stack direction={"column"} spacing={1} width={"100%"}>
                        <TextField fullWidth placeholder='Password' type='password' onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    </Stack>
                    <Stack direction={"column"} spacing={1} width={"100%"}>
                        <TextField fullWidth placeholder='Confirm Password' type='password' onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                    </Stack>
                </Stack>
                <Stack direction={"row"} spacing={1} alignItems={"center"} justifyContent={"flex-start"} width={"52%"} mt={2}>
                    <Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} disabled={loading} />
                    <Typography sx={{ fontSize: "14px", fontWeight: "400" }}>I agree to the terms and conditions</Typography>
                </Stack>
                <Button sx={{ width: "50%", height: "50px", border: "1px solid #fff", mt: 2 }} onClick={handleSubmit} disabled={loading}>
                    <Typography sx={{ fontSize: "14px", fontWeight: "600" }}>
                        {loading ? 'Registering...' : 'Register'}
                    </Typography>
                </Button>
            </Box>
        </Box>
    )
}
