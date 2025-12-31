'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { NavBar } from '@/components/ui/NavBar';
import { HostList } from '@/components/host/HostList';
import { AddHostDialog } from '@/components/host/AddHostDialog';
import { Host } from '@/components/host/HostCard';
import { api } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export default function HostsPage() {
    const router = useRouter();
    const [hosts, setHosts] = useState<Host[]>([]);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    useEffect(() => {
        loadHosts();
    }, []);

    const loadHosts = async () => {
        try {
            setLoading(true);
            const data = await api.hosts.list();
            setHosts(data as any);
        } catch (error) {
            console.error('Failed to load hosts:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleAddHost = () => {
        setAddDialogOpen(true);
    };

    const handleAddHostSubmit = async (address: string, port?: number) => {
        await api.hosts.add({ address, port });
        loadHosts();
    };

    const handleConnectHost = (host: Host) => {
        router.push(`/games/${host.id}`);
    };

    const handleEditHost = (host: Host) => {
        console.log('Edit host:', host);
    };

    const handleDeleteHost = async (host: Host) => {
        try {
            await api.hosts.delete(host.id);
            loadHosts();
        } catch (error) {
            console.error('Failed to delete host:', error);
        }
    };

    const handlePairHost = (host: Host) => {
        console.log('Pair host:', host);
    };

    return (
        <Box>
            <NavBar title="Moonlight Web" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Your Hosts
                    </Typography>
                    <Typography color="text.secondary">
                        Manage your streaming hosts and connect to games
                    </Typography>
                </Box>

                <HostList
                    hosts={hosts}
                    loading={loading}
                    onAddHost={handleAddHost}
                    onConnectHost={handleConnectHost}
                    onEditHost={handleEditHost}
                    onDeleteHost={handleDeleteHost}
                    onPairHost={handlePairHost}
                />
            </Container>

            <AddHostDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onAdd={handleAddHostSubmit}
            />
        </Box>
    );
}
