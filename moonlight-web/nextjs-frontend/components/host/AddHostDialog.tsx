'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box
} from '@mui/material';
import { useAuth } from '@/app/context/AuthContext';

interface AddHostDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (address: string, port?: number) => Promise<void>;
}

export function AddHostDialog({ open, onClose, onAdd }: AddHostDialogProps) {
    const [address, setAddress] = useState('');
    const [port, setPort] = useState('');
    const [loading, setLoading] = useState(false);



    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onAdd(address, port ? parseInt(port) : undefined);
            setAddress('');
            setPort('');
            onClose();
        } catch (error) {
            console.error('Failed to add host:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Host</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <TextField
                        label="Host Address"
                        fullWidth
                        margin="normal"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="localhost or 192.168.1.100"
                        required
                        autoFocus
                    />
                    <TextField
                        label="Port (optional)"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="47989 (default)"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !address}
                >
                    {loading ? 'Adding...' : 'Add Host'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
