import { Box, Button, Container, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import PlayAndLearnUI from '../ui/btnPlayandLearn/playandlearn';

export default function Section() {
    return (
        <>
            <Box
                width={"100%"}
                height={"90vh"}
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Box
                    component="image"
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
                    <Image src={"/banner/banner.png"} alt='' width={1920} height={1080} />
                </Box>
                <Box
                    sx={{
                        background: "rgba(255, 255, 255, 0.01)",
                        backdropFilter: "blur(16px) saturate(180%)",
                        WebkitBackdropFilter: "blur(16px) saturate(180%)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        padding: "20px",
                        zIndex: 1,
                        width: "30%",
                        height: "100%"
                    }}
                >
                    <Container maxWidth={"lg"}>
                        <Stack direction={"row"} mt={5}>
                            <Image src={"/logo/Logo.svg"} alt="" width={40} height={40} />
                            <Typography fontSize={"24px"} fontWeight={600} textTransform={"uppercase"} mt={1.5}>
                                vixe x
                            </Typography>
                        </Stack>
                        <Stack direction={"column"} spacing={5} mt={20}>
                            <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <ArrowRightIcon sx={{ color: "#fff" }} />
                                <Typography fontSize={"20px"} fontWeight={400} >
                                    Experience powerful high-end PC specs.
                                </Typography>
                            </Stack>
                            <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <ArrowRightIcon sx={{ color: "#fff" }} />
                                <Typography fontSize={"20px"} fontWeight={400} >
                                    Instant access to 120+ games.
                                </Typography>
                            </Stack>
                            <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <ArrowRightIcon sx={{ color: "#fff" }} />
                                <Typography fontSize={"20px"} fontWeight={400}>
                                    Stunning visuals with 1080+ resolution.
                                </Typography>
                            </Stack>
                            <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <ArrowRightIcon sx={{ color: "#fff" }} />
                                <Typography fontSize={"20px"} fontWeight={400}>
                                    Lag-free and ultra-smooth gameplay.
                                </Typography>
                            </Stack>
                            <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <ArrowRightIcon sx={{ color: "#fff" }} />
                                <Typography fontSize={"20px"} fontWeight={400}>
                                    Play any game on any device.
                                </Typography>
                            </Stack>
                        </Stack>
                        <PlayAndLearnUI />
                    </Container>
                </Box>
            </Box>
        </>
    )
}