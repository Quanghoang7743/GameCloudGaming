'use client';

import { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Button,
    Container,
    Fab,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { HostCard, Host } from './HostCard';

interface HostListProps {
    hosts?: Host[];
    loading?: boolean;
    onAddHost?: () => void;
    onConnectHost?: (host: Host) => void;
    onEditHost?: (host: Host) => void;
    onDeleteHost?: (host: Host) => void;
    onPairHost?: (host: Host) => void;
}

export function HostList({
    hosts = [],
    loading = false,
    onAddHost,
    onConnectHost,
    onEditHost,
    onDeleteHost,
    onPairHost
}: HostListProps) {

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (hosts.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    No hosts configured
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Add a host to start streaming
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={onAddHost}
                >
                    Add Host
                </Button>
            </Container>
        );
    }

    return (
        <Box>
            <Grid container spacing={3}>
                {hosts.map((host, index) => (

                    <Grid item xs={12} sm={6} md={4} key={host.host_id}>
                        <HostCard
                            host={host}
                            onConnect={onConnectHost}
                            onEdit={onEditHost}
                            onDelete={onDeleteHost}
                            onPair={onPairHost}
                        />
                    </Grid>
                ))}
            </Grid>

            <Fab
                color="primary"
                aria-label="add host"
                sx={{ position: 'fixed', bottom: 32, right: 32 }}
                onClick={onAddHost}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
}
