'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthService, UserInfo } from '@/lib/api/auth'

interface AuthContextType {
    user: UserInfo | null
    isAuthenticated: boolean
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (AuthService.isAuthenticated()) {
                    const userInfo = await AuthService.getCurrentUser()
                    setUser(userInfo)
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error)
                // Clear invalid token
                AuthService.logout()
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = async (username: string, password: string) => {
        try {
            // Login sets cookies automatically
            await AuthService.login({ username, password });

            // Fetch user info after successful login
            const userInfo = await AuthService.getCurrentUser();
            setUser(userInfo);
        } catch (error) {
            throw error;
        }
    }

    const logout = async () => {
        try {
            await AuthService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setUser(null)
        }
    }

    const refreshUser = async () => {
        try {
            if (AuthService.isAuthenticated()) {
                const userInfo = await AuthService.getCurrentUser()
                setUser(userInfo)
            }
        } catch (error: any) {
            // If 401, try to refresh token
            if (error.response?.status === 401) {
                try {
                    await AuthService.refreshToken()
                    const userInfo = await AuthService.getCurrentUser()
                    setUser(userInfo)
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError)
                    await logout()
                }
            } else {
                console.error('Failed to refresh user info:', error)
                await logout()
            }
        }
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
