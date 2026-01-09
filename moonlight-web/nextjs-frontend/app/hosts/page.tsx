'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import { NavBar } from '@/components/ui/NavBar';
import { HostList } from '@/components/host/HostList';
import { AddHostDialog } from '@/components/host/AddHostDialog';
import { PairingDialog } from '@/components/hosts/PairingDialog';
import { Host } from '@/components/host/HostCard';
import { api } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function HostsPage() {
    const auth = useAuth()
    const user = auth.user
    const router = useRouter();
    const [hosts, setHosts] = useState<Host[]>([]);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [pairingDialogOpen, setPairingDialogOpen] = useState(false);
    const [pairingHost, setPairingHost] = useState<Host | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hostToDelete, setHostToDelete] = useState<Host | null>(null);

    useEffect(() => {
        loadHosts();
    }, []);

    const loadHosts = async () => {
        try {
            setLoading(true);
            const data = await api.hosts.list();
            setHosts(data as any);
        } catch (error: any) {
            console.error('Failed to load hosts:', error);
            // Only redirect to login on authentication errors (401/403)
            if (error.status === 401 || error.status === 403) {
                router.push('/login');
            }
            // For other errors, just log them (could add toast notification here)
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
        router.push(`/games/${host.host_id}`);
    };

    const handleEditHost = (host: Host) => {
        console.log('Edit host:', host);
    };

    const handleDeleteHost = (host: Host) => {
        setHostToDelete(host);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteHost = async () => {
        if (!hostToDelete) return;

        try {
            await api.hosts.delete(hostToDelete.host_id);
            loadHosts();
            setDeleteDialogOpen(false);
            setHostToDelete(null);
        } catch (error) {
            console.error('Failed to delete host:', error);
        }
    };

    const handlePairHost = (host: Host) => {
        setPairingHost(host);
        setPairingDialogOpen(true);
    };

    const handlePairingSuccess = () => {
        loadHosts(); // Reload to get updated pair status
    };

    return (
        <Box>
            {/* <NavBar title="Moonlight Web" /> */}

            <Container maxWidth="xl" sx={{ py: 4 }}>

                <HostList
                    hosts={hosts}
                    loading={loading}
                    onAddHost={handleAddHost}
                    onConnectHost={handleConnectHost}
                    onEditHost={handleEditHost}
                    onDeleteHost={handleDeleteHost}
                    onPairHost={handlePairHost}
                />

                <AddHostDialog
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                    onAdd={handleAddHostSubmit}
                />

                {pairingHost && (
                    <PairingDialog
                        open={pairingDialogOpen}
                        hostId={pairingHost.host_id}
                        hostName={pairingHost.name}
                        onClose={() => setPairingDialogOpen(false)}
                        onSuccess={handlePairingSuccess}
                    />
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Delete Host</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete host <strong>{hostToDelete?.name}</strong>? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <MuiButton onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </MuiButton>
                        <MuiButton onClick={confirmDeleteHost} color="error" variant="contained">
                            Delete
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
