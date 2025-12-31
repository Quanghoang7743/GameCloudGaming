'use client';

import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Switch,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';

interface StreamControlsProps {
    open: boolean;
    onClose: () => void;
    onDisconnect: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    stats?: {
        bitrate?: string;
        fps?: string;
        latency?: string;
    };
}

export function StreamControls({
    open,
    onClose,
    onDisconnect,
    isFullscreen,
    onToggleFullscreen,
    stats = {}
}: StreamControlsProps) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 320, bgcolor: 'background.paper' }
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Stream Controls</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Statistics */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <SignalCellularAltIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        Stream Statistics
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText
                                primary="Bitrate"
                                secondary={stats.bitrate || 'N/A'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Frame Rate"
                                secondary={stats.fps || 'N/A'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Latency"
                                secondary={stats.latency || 'N/A'}
                            />
                        </ListItem>
                    </List>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <SettingsIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        Display
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText primary="Fullscreen" />
                            <IconButton onClick={onToggleFullscreen}>
                                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                        </ListItem>
                    </List>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Disconnect */}
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<ExitToAppIcon />}
                    onClick={onDisconnect}
                >
                    Disconnect
                </Button>
            </Box>
        </Drawer>
    );
}
