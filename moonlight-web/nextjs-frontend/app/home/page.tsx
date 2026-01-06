import { Box, Container, Stack, Typography } from '@mui/material'
import React from 'react'
import BannerHome from './components/banner/bannehome'
import PricingCard from './components/pricingCard/pricingcard'
import PricingData from '@/lib/pricingData.json'

export default function GameStorePage() {
    return (
        <Container maxWidth="xl">
            <BannerHome />
            <Stack spacing={2} direction={"column"} alignItems={"center"}>
                <Stack>
                    <Typography fontSize={"40px"} fontWeight={600} textTransform={"uppercase"}  >
                        Gaming Plans
                    </Typography>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {PricingData.map((item, index) => (
                        <PricingCard key={index} items={item} />
                    ))}
                </Box>
            </Stack>
        </Container>
    )
}
