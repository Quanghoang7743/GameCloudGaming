'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress } from '@mui/material';
import { NavBar } from '@/components/ui/NavBar';
import { GameCard, Game } from '@/components/game/GameCard';
import { useRouter, useParams } from 'next/navigation';

export default function GamesPage() {
    const router = useRouter();
    const params = useParams();
    const hostId = params.hostId as string;

    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, [hostId]);

    const loadGames = async () => {
        try {
            setLoading(true);

            // Validate hostId
            if (!hostId || hostId === 'undefined') {
                throw new Error('Invalid host ID');
            }

            // Fetch apps from API (cookies sent automatically)
            const response = await fetch(`/api/host/apps?host_id=${hostId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[GamesPage] API Error (${response.status}):`, errorText);
                throw new Error(`Failed to fetch apps: ${response.status} ${errorText}`);
            }

            const apps = await response.json();
            console.log('[GamesPage] Fetched apps:', apps);

            if (Array.isArray(apps)) {
                // Transform API response to Game format if necessary, assuming 'apps' contains objects with app_id and title
                const gamesList: Game[] = apps.map((app: any) => ({
                    id: app.app_id,
                    name: app.title,
                    running: false, // Default to false, update if API provides this
                }));
                setGames(gamesList);
            } else {
                console.warn('[GamesPage] Apps is not an array:', apps);
                setGames([]);
            }
        } catch (error) {
            console.error('Failed to load games:', error);
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchGame = (game: Game) => {
        // Navigate to streaming page
        router.push(`/stream/${hostId}/${game.id}`);
    };

    if (loading) {
        return (
            <Box>
                <NavBar title="Games & Apps" />
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                        <CircularProgress />
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <NavBar title="Games & Apps" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Available Games & Apps
                    </Typography>
                    <Typography color="text.secondary">
                        Select an app to start streaming
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {games.map((game) => (
                        // @ts-ignore
                        <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                            <GameCard game={game} onLaunch={handleLaunchGame} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
