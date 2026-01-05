'use client'

import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LogoComponent() {
    const router = useRouter()
    const onClickLogo = () => {
        router.push("/")
    }
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={onClickLogo}>
                <Image src={"/logo/Logo.svg"} alt='logoHeader' width={30} height={30} />
                {/* <Typography sx={{ fontSize: "15px", color: "#000", fontWeight: 600, position: "absolute", bottom: 0, left: 45, zIndex: 10 }}>
                    VixeX
                </Typography> */}
            </Box>

        </>
    )
}
