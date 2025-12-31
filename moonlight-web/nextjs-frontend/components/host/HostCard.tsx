'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Box,
    Chip
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

export interface Host {
    id: number;
    name: string;
    address: string;
    port?: number;
    paired: boolean;
    online?: boolean;
}

interface HostCardProps {
    host: Host;
    onConnect?: (host: Host) => void;
    onEdit?: (host: Host) => void;
    onDelete?: (host: Host) => void;
    onPair?: (host: Host) => void;
}

export function HostCard({ host, onConnect, onEdit, onDelete, onPair }: HostCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            sx={{
                minWidth: 275,
                maxWidth: 400,
                m: 2,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onConnect?.(host)}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ComputerIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" component="div">
                            {host.name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            {host.address}{host.port ? `:${host.port}` : ''}
                        </Typography>
                    </Box>
                    <Box>
                        {host.online && (
                            <Chip
                                label="Online"
                                color="success"
                                size="small"
                                icon={<PowerSettingsNewIcon />}
                            />
                        )}
                        {!host.paired && (
                            <Chip
                                label="Not Paired"
                                color="warning"
                                size="small"
                            />
                        )}
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                    {host.paired ? (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => { e.stopPropagation(); onConnect?.(host); }}
                        >
                            Connect
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => { e.stopPropagation(); onPair?.(host); }}
                        >
                            Pair
                        </Button>
                    )}
                </Box>

                {isHovered && (
                    <Box>
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onEdit?.(host); }}
                            sx={{ mr: 1 }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => { e.stopPropagation(); onDelete?.(host); }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </CardActions>
        </Card>
    );
}
