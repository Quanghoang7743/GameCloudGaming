'use client';

import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export interface Game {
    id: number;
    name: string;
    running?: boolean;
    imageUrl?: string;
}

interface GameCardProps {
    game: Game;
    onLaunch?: (game: Game) => void;
}

export function GameCard({ game, onLaunch }: GameCardProps) {
    return (
        <Card
            sx={{
                minWidth: 250,
                maxWidth: 300,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                }
            }}
            onClick={() => onLaunch?.(game)}
        >
            {game.imageUrl ? (
                <Box
                    component="img"
                    src={game.imageUrl}
                    alt={game.name}
                    sx={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                    }}
                >
                    <SportsEsportsIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                </Box>
            )}

            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div" noWrap>
                        {game.name}
                    </Typography>
                    {game.running && (
                        <Chip label="Running" color="success" size="small" />
                    )}
                </Box>
            </CardContent>

            <CardActions>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); onLaunch?.(game); }}
                >
                    Launch
                </Button>
            </CardActions>
        </Card>
    );
}
