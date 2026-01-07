'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'

interface FadeInSectionProps {
    children: React.ReactNode
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
    duration?: number
}

export default function FadeInSection({
    children,
    delay = 0,
    direction = 'up',
    duration = 0.8
}: FadeInSectionProps) {
    const [isVisible, setIsVisible] = useState(false)
    const domRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true)
                    }, delay)
                }
            })
        }, {
            threshold: 0.1, // Trigger when 10% of element is visible
            rootMargin: '0px 0px -50px 0px' // Start animation a bit before element is fully visible
        })

        const currentRef = domRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [delay])

    const getTransform = () => {
        switch (direction) {
            case 'up':
                return 'translateY(50px)'
            case 'down':
                return 'translateY(-50px)'
            case 'left':
                return 'translateX(50px)'
            case 'right':
                return 'translateX(-50px)'
            case 'fade':
                return 'none'
            default:
                return 'translateY(50px)'
        }
    }

    return (
        <Box
            ref={domRef}
            sx={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate(0, 0)' : getTransform(),
                transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
                willChange: 'opacity, transform'
            }}
        >
            {children}
        </Box>
    )
}
