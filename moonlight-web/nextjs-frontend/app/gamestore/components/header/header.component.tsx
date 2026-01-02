'use client'
import { AppBar, Box, Container, Toolbar } from '@mui/material'
import React from 'react'
import LogoComponent from '../logoheader/logo.component'
import { NavbarComponent } from '../navbar/navbar.component'
import LoginAuth from '../auth/loginAuth'
import { GameCloud } from '../gamecloud/gamecloud'
import { useAuth } from '@/app/context/AuthContext'
import { AvatarUser } from '@/app/(account)/(profile)/components/avatarUser/avataruser'

export default function HeaderComponent() {
    const auth = useAuth()
    const user = auth.user
    return (
        <>
            <AppBar
                position='fixed'
                elevation={0}
                sx={{
                    top: 0,
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.174) 0%, rgba(255,255,255,0.05) 100%)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                }}
            >
                <Container maxWidth='xl'>
                    <Toolbar
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box display={"flex"} alignItems={"center"} gap={3}>
                            <LogoComponent />
                            {/* <NavbarComponent /> */}
                            <GameCloud />
                        </Box>
                        <Box display={'flex'} gap={2} alignItems={'center'}>
                            {user ? (
                                <Box>
                                    <AvatarUser />
                                </Box>
                            ) : (
                                <LoginAuth />
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    )
}
