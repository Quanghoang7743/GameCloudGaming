'use client'
import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material'
import React from 'react'
import PricingData from '@/lib/pricingData.json'
import Image from 'next/image';


export default function PricingCard({ items }: { items: typeof PricingData[0] }) {
    const theme = useTheme();
    const hasAccent = items.accentColor && items.accentColor !== '';
    return (
        <>
            <Card
                sx={{
                    width: 320,
                    height: 450,
                    m: 2,
                    borderRadius: 1,
                    position: 'relative',
                    border: hasAccent ? `1px solid ${items.accentColor}` : '1px solid #333',
                    background: 'transparent',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: hasAccent
                            ? `0 0 20px ${items.accentColor}80, inset 0 0 20px ${items.accentColor}20`
                            : '0 8px 24px rgba(0,0,0,0.3)',
                    }
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack direction="column" spacing={3}>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ color: '#fff', mb: 2 }}
                        >
                            {items.label}
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Image alt='' src='/icons/CPU.svg' width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                            <Typography variant="h6" fontWeight={500} sx={{ color: '#fff' }} width={"100%"}>
                                CPU: {items.CPU}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Image alt='' src='/icons/RAM.svg' width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                            <Typography variant="h6" fontWeight={500} sx={{ color: '#fff' }}>
                                RAM: {items.RAM}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Image alt='' src='/icons/GPU.svg' width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                            <Typography variant="h6" fontWeight={500} sx={{ color: '#fff' }}>
                                GPU: {items.GPU}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Image alt='' src='/icons/SSD.svg' width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                            <Typography variant="h6" fontWeight={500} sx={{ color: '#fff' }}>
                                STORAGE: {items.Storage}
                            </Typography>
                        </Stack>

                        <Box sx={{ pt: 2, mt: 'auto' }}>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{ color: '#fff' }}
                            >
                                {items.price}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card >
        </>
    )
}