'use client'
import { Box, Container, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const enum NAV_TYPES {
    STORE = "STORE",
    LIBRARY = "LIBRARY"
}


const NAV_MAPPING: { type: NAV_TYPES; url: string[] }[] = [
    {
        type: NAV_TYPES.STORE,
        url: ["/gamestore"]
    },
    {
        type: NAV_TYPES.LIBRARY,
        url: ["/gamestore/library"]
    },
]


export const NavbarComponent = () => {

    const router = useRouter();
    const pathname = usePathname();

    const [value, setValue] = useState<NAV_TYPES | null>(() => {
        const nav = NAV_MAPPING.find((item) => item.url.findIndex((url) => pathname.indexOf(url) > -1) > -1);
        return nav?.type ?? null;
    });

    useEffect(() => {
        const nav = NAV_MAPPING.find((item) => item.url.findIndex((url) => pathname.indexOf(url) > -1) > -1);
        if (!!nav) {
            setValue(nav.type);
        }
    }, [pathname]);

    const isActive = (type: NAV_TYPES) => {
        return value === type;
    };

    const onClickNav = (href: string) => {
        router.push(href);
    };

    return (
        <Box display={"flex"} alignItems={"center"} gap={3}>
            <Container maxWidth="lg">
                <Stack flexDirection={"row"} justifyContent={"space-between"} height={"55px"} gap={5}>
                    <Stack
                        onClick={() => onClickNav("/gamestore")}
                        alignItems={"center"}
                        justifyContent={"center"}
                        gap={"3px"}
                        sx={{ cursor: "pointer" }}
                    >
                        <Typography
                            color={isActive(NAV_TYPES.STORE) ? "#19df54ff" : "#fff"}
                            component={"div"}
                            fontSize={"14px"}
                            lineHeight={"16px"}
                            fontWeight={600}
                            textTransform={"uppercase"}
                        >
                            store
                        </Typography>
                        {isActive(NAV_TYPES.STORE) ? (
                            <Box width={"100%"} height={"2px"} bgcolor={"#19df54ff"}></Box>
                        ) : (
                            ""
                        )}
                    </Stack>

                    <Stack
                        onClick={() => onClickNav("/gamestore/library")}
                        alignItems={"center"}
                        justifyContent={"center"}
                        gap={"3px"}
                        sx={{ cursor: "pointer" }}
                    >
                        <Typography
                            color={isActive(NAV_TYPES.LIBRARY) ? "#19df54ff" : "#fff"}
                            component={"div"}
                            fontSize={"14px"}
                            lineHeight={"16px"}
                            fontWeight={600}
                            textTransform={"uppercase"}
                        >
                            library
                        </Typography>
                        {isActive(NAV_TYPES.LIBRARY) ? (
                            <Box width={"100%"} height={"2px"} bgcolor={"#19df54ff"}></Box>
                        ) : (
                            ""
                        )}
                    </Stack>
                </Stack>
            </Container>

        </Box>
    )
}
