import { Box, Stack } from '@mui/material'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
            {children}

        </Box>
    )
}
