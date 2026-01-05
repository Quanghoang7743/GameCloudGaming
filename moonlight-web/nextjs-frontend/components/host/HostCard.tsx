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
    Chip,
    Badge,
    Avatar,
    Fade,
    Tooltip,
    Divider
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PowerIcon from '@mui/icons-material/Power';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';


export interface Host {
    host_id: number;  // API uses host_id, not id
    name: string;
    address: string;
    port?: number;
    paired: string;   // API returns "Paired" or "Unpaired" as string
    online: boolean;
    owner?: string;
    server_state?: string | null;
}

// Helper to check if paired
export const isPaired = (host: Host) => host.paired === "Paired";

interface HostCardProps {
    host: Host;
    onConnect?: (host: Host) => void;
    onEdit?: (host: Host) => void;
    onDelete?: (host: Host) => void;
    onPair?: (host: Host) => void;
}

export function HostCard({ host, onConnect, onEdit, onDelete, onPair }: HostCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const statusColor = host.online ? 'success.main' : 'error.main';
    const pairedStatus = isPaired(host);

    return (
        <Card
            elevation={isHovered ? 8 : 1}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onConnect?.(host)}
            sx={{
                width: 340,
                m: 2,
                borderRadius: 4,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                },
                overflow: 'visible'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: statusColor,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                boxShadow: '0 0 0 2px white'
                            }
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: host.online ? 'primary.light' : 'grey.100',
                                color: host.online ? 'primary.main' : 'grey.500',
                                width: 56,
                                height: 56
                            }}
                        >
                            <ComputerIcon fontSize="large" />
                        </Avatar>
                    </Badge>

                    <Chip
                        label={pairedStatus ? "Paired" : "Unpaired"}
                        size="small"
                        icon={pairedStatus ? <LinkIcon /> : <LinkOffIcon />}
                        color={pairedStatus ? "default" : "warning"}
                        variant={pairedStatus ? "outlined" : "filled"}
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        {host.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {host.address}{host.port ? `:${host.port}` : ''}
                    </Typography>
                </Box>
            </CardContent>

            <Divider light />

            <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Button
                    variant="contained"
                    disableElevation
                    color={pairedStatus ? "primary" : "secondary"}
                    onClick={(e) => {
                        e.stopPropagation();
                        pairedStatus ? onConnect?.(host) : onPair?.(host);
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    {pairedStatus ? "Connect" : "Pair Device"}
                </Button>
            </Box>
        </Card>
    );
}
