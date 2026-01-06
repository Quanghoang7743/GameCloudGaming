import { Box, Button, Stack, Typography } from '@mui/material'
import React from 'react'

export default function BannerHome() {
    return (
        <>
            <Box width={"100%"} height={"60vh"} >
                <Stack direction={"column"} spacing={2}>
                    <Typography component={"h1"} fontSize={"54px"} fontWeight={600}>Game on any Device</Typography>
                    <Typography component={"p"} fontSize={"30px"} width={"45%"}>Experience seamless gaming from anywhere, running directly inside your web browser.</Typography>
                    <Box width={"30%"}>
                        <Button
                            sx={{
                                backgroundColor: "#FFC107",
                                color: "#000",
                                fontSize: "24px",
                                fontWeight: 600,
                                padding: "16px 32px",
                                borderRadius: "8px",
                            }}>
                            <Typography>Join Now</Typography>
                        </Button>
                    </Box>
                </Stack>
            </Box >
        </>
    )
}
