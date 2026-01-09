'use client'
import useMenuSelectedStore, { USER_ACTIONS } from '@/app/zustand-store/menu-select-store'
import { Box, Button, ClickAwayListener, Divider, Stack, Typography } from '@mui/material'
import React from 'react'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TollIcon from '@mui/icons-material/Toll';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MenuWraper() {
    const menuState = useMenuSelectedStore()
    const { logout } = useAuth()
    const router = useRouter()

    const isOpenMenu = () => {
        return !!menuState.selected && menuState.action === USER_ACTIONS.SELECT_MENU
    }

    const handleCloseMenu = () => {
        menuState.clear()
    }

    const handleSignOut = async () => {
        try {
            await logout()
            handleCloseMenu()
            window.location.href = '/home'
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    if (!isOpenMenu()) {
        return null
    }

    return (
        <ClickAwayListener onClickAway={handleCloseMenu}>
            <Box
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    position: 'absolute',
                    top: 50,
                    left: -100,
                    width: '300px',
                    zIndex: 9999,
                    padding: '10px',
                    borderRadius: '10px',
                    backdropFilter: "blur(16px) saturate(180%)",
                    WebkitBackdropFilter: "blur(16px) saturate(180%)",
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase" }}>Menu</Typography>
                <Stack spacing={1} pb={1} pt={1}>
                    <Button sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>

                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                            <AccountBalanceWalletIcon sx={{ fontSize: "20px", color: "#fff" }} />
                            <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>Account Balance</Typography>
                        </Stack>
                    </Button>
                    <Button sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>

                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                            <CardGiftcardIcon sx={{ fontSize: "20px", color: "#fff" }} />
                            <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>Gifts</Typography>
                        </Stack>
                    </Button>
                    <Button sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>

                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                            <PersonOutlineIcon sx={{ fontSize: "20px", color: "#fff" }} />
                            <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>Account</Typography>
                        </Stack>
                    </Button>
                    <Button sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>

                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                            <TollIcon sx={{ fontSize: "20px", color: "#fff" }} />
                            <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>Coupons</Typography>
                        </Stack>
                    </Button>
                </Stack>
                <Divider />
                <Stack spacing={1} pt={1}>
                    <Button
                        onClick={handleSignOut}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            justifyContent: 'space-between',
                            padding: '10px',
                            borderRadius: '10px',
                        }}>

                        <Stack direction={"row"} gap={1} alignItems={"center"}>
                            <LogoutIcon sx={{ fontSize: "20px", color: "#fff" }} />
                            <Typography sx={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>Sign out</Typography>
                        </Stack>
                    </Button>
                </Stack>
            </Box>
        </ClickAwayListener>
    )
}
