'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { api } from '@/lib/api/client';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = async (username: string, password: string) => {
        try {
            await api.auth.login(username, password);
            router.push('/hosts');
        } catch (error) {
            throw error;
        }
    };

    return <LoginForm onLogin={handleLogin} />;
}
