import { Box, Button, Stack, Typography } from '@mui/material'
import React from 'react'
import BtnJoin from '../ui/buttonJoin/btnjoin'

export default function BannerHome() {
    return (
        <>
            <Box
                width={"100%"}
                height={"70vh"}
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 5
                }}
            >
                <Box
                    component="video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0
                    }}
                >
                    <source src="/VideoBanner.mp4" type="video/mp4" />
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        zIndex: 1
                    }}
                />

                <Stack
                    direction={"column"}
                    spacing={2}
                    sx={{
                        position: "relative",
                        zIndex: 2,
                        padding: "0 5%"
                    }}
                >
                    <Typography
                        component={"h1"}
                        fontSize={"54px"}
                        fontWeight={600}
                        sx={{ color: "#fff", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                    >
                        Game on any Device.
                    </Typography>
                    <Typography
                        component={"p"}
                        fontSize={"30px"}
                        width={"45%"}
                        sx={{ color: "#fff", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                        Experience seamless gaming from anywhere, running directly inside your web browser.
                    </Typography>
                    <Box width={"30%"}>
                        <BtnJoin />
                    </Box>
                </Stack>
            </Box >
        </>
    )
}
