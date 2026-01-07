import { Box, Container, Stack, Typography } from '@mui/material'
import React from 'react'
import BannerHome from './components/banner/bannehome'
import PricingCard from './components/pricingCard/pricingcard'
import PricingData from '@/lib/pricingData.json'
import Section from './components/section/section'
import FadeInSection from './components/ui/fadeInSection/fadeInSection'

export default function GameStorePage() {
    return (
        <>
            <Container maxWidth="xl">
                <FadeInSection direction="fade" duration={1}>
                    <BannerHome />
                </FadeInSection>

                <FadeInSection delay={200} direction="up">
                    <Stack spacing={2} pt={5} direction={"column"} alignItems={"center"}>
                        <Stack>
                            <Typography fontSize={"40px"} fontWeight={600} textTransform={"uppercase"}  >
                                Gaming Plans
                            </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {PricingData.map((item, index) => (
                                <FadeInSection
                                    key={index}
                                    delay={index * 150}
                                    direction="up"
                                    duration={0.6}
                                >
                                    <PricingCard items={item} />
                                </FadeInSection>
                            ))}
                        </Box>
                    </Stack>
                </FadeInSection>
            </Container>

            <FadeInSection delay={300} direction="left">
                <Box mt={5}>
                    <Section />
                </Box>
            </FadeInSection>
        </>
    )
}
