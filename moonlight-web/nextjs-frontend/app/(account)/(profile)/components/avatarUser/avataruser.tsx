import { useAuth } from '@/app/context/AuthContext'
import useMenuSelectedStore, { USER_ACTIONS } from '@/app/zustand-store/menu-select-store'
import { Box, Button, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import MenuWraper from '../menuUser/menuUser'

export const AvatarUser = () => {
    const auth = useAuth()
    const user = auth.user

    const menuState = useMenuSelectedStore()

    const handleMenu = () => [
        menuState.requestAction(USER_ACTIONS.SELECT_MENU, {

        })
    ]
    return (
        <Box position={'relative'}>
            <Button onClick={handleMenu}>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                    <Image src={"/avatar.jpg"} alt='avatar' width={35} height={35} style={{ borderRadius: '50%' }} />
                    <Typography variant='body1' sx={{ fontSize: '14px', fontWeight: 600 }}>{user?.username}</Typography>
                </Stack>
            </Button>
            <MenuWraper />
        </Box>
    )
}
