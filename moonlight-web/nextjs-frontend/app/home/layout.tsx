import { Box, Stack } from '@mui/material'
import React from 'react'
import HeaderComponent from './components/header/header.component'

export default function GameLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box
            overflow={"auto"}
            id="overflowcontent"
            component="section"
            sx={{
                flex: "1 1 auto",
                marginTop: "0 !important",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
            }}
        >
            <HeaderComponent />
            <Box paddingTop={10}>
                {children}
            </Box>
        </Box>
    )
}
