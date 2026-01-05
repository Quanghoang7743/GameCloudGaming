'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { startPairingStream } from '@/lib/api/pairing';

interface PairingDialogProps {
    open: boolean;
    hostId: number;
    hostName: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'loading' | 'waiting' | 'complete' | 'error';

export function PairingDialog({ open, hostId, hostName, onClose, onSuccess }: PairingDialogProps) {
    const [pin, setPin] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<Step>('loading');
    const startedRef = useRef(false);

    useEffect(() => {
        if (!open) {
            // Reset when dialog closes
            setPin(null);
            setError(null);
            setStep('loading');
            startedRef.current = false;
            return;
        }

        // Start pairing when dialog opens (only once)
        if (startedRef.current) return;
        startedRef.current = true;

        setStep('loading');
        setError(null);
        setPin(null);

        startPairingStream(hostId, {
            onPin: (receivedPin) => {
                console.log('[PairingDialog] PIN received:', receivedPin);
                setPin(receivedPin);
                setStep('waiting');
            },
            onSuccess: () => {
                console.log('[PairingDialog] Pairing successful!');
                setStep('complete');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            },
            onError: (errorMsg) => {
                console.error('[PairingDialog] Pairing error:', errorMsg);
                setError(errorMsg);
                setStep('error');
            },
        });
    }, [open, hostId, onSuccess, onClose]);

    const handleClose = () => {
        if (step === 'loading' || step === 'waiting') {
            // Don't allow close while pairing in progress
            return;
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Pair with {hostName}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {step === 'loading' && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Initiating pairing...
                        </Typography>
                    </Box>
                )}

                {step === 'waiting' && pin && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body1" paragraph>
                            Enter this PIN on your host machine:
                        </Typography>

                        <Box
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                p: 3,
                                borderRadius: 2,
                                my: 3,
                                fontFamily: 'monospace',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                letterSpacing: '0.5em',
                                textAlign: 'center',
                            }}
                        >
                            {pin}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">
                                Waiting for confirmation on host...
                            </Typography>
                        </Box>

                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                            This will update automatically when you enter the PIN
                        </Typography>
                    </Box>
                )}

                {step === 'complete' && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h6" color="success.main" gutterBottom>
                            ✓ Pairing Successful!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You can now stream from this host
                        </Typography>
                    </Box>
                )}

                {step === 'error' && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Please try again
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={step === 'loading' || step === 'waiting'}
                >
                    {step === 'error' ? 'Close' : 'Cancel'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
