'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Game Streaming Cloud
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Stream your PC games to the browser
        </Typography>

        <CircularProgress sx={{ mb: 4 }} />

        <Typography color="text.secondary" paragraph>
          Loading...
        </Typography>

        <Button
          variant="outlined"
          onClick={() => router.push('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login Now
        </Button>
      </Box>
    </Container>
  );
}
