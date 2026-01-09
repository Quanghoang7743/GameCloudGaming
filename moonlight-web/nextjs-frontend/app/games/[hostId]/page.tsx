'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Alert, Button } from '@mui/material';
import { NavBar } from '@/components/ui/NavBar';
import { GameCard, Game } from '@/components/game/GameCard';
import { useRouter, useParams } from 'next/navigation';

export default function GamesPage() {
    const router = useRouter();
    const params = useParams();
    const hostId = params.hostId as string;

    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadGames();
    }, [hostId]);

    const loadGames = async () => {
        try {
            setLoading(true);
            setError(null);

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

                // Parse error message to provide user-friendly feedback
                let errorMessage = 'Failed to load games';

                if (response.status === 504) {
                    try {
                        const errorData = JSON.parse(errorText);
                        if (errorData.error && errorData.error.includes('host was offline')) {
                            errorMessage = 'The host is currently offline. Please make sure the host machine is running and connected.';
                        }
                    } catch {
                        errorMessage = 'The host is currently offline or unreachable.';
                    }
                } else if (response.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                } else if (response.status === 404) {
                    errorMessage = 'Host not found. Please check the host ID.';
                }

                setError(errorMessage);
                setGames([]);
                return;
            }

            const apps = await response.json();
            // Convert response to array if it's an object with numeric keys
            let appsArray: any[] = [];

            if (Array.isArray(apps)) {
                appsArray = apps;
            } else if (typeof apps === 'object' && apps !== null) {
                // Convert object to array (handle case where API returns {0: {...}, 1: {...}})
                const values = Object.values(apps);

                // Check if the first value is an array (nested structure)
                if (values.length === 1 && Array.isArray(values[0])) {
                    appsArray = values[0];
                } else {
                    appsArray = values;
                }
            }

            if (appsArray.length > 0) {
                // Transform API response to Game format
                const gamesList: Game[] = appsArray.map((app: any) => {
                    return {
                        id: app.app_id,
                        name: app.title,
                        running: false,
                    };
                });
                setGames(gamesList);
            } else {
                setGames([]);
            }
        } catch (error) {
            console.error('Failed to load games:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <Button color="inherit" size="small" onClick={loadGames}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {!error && games.length === 0 && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        No games or apps found on this host.
                    </Alert>
                )}

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
