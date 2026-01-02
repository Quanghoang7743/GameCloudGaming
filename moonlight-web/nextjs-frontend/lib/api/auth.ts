import axios from 'axios';
import { API_ROUTER } from './router';

export interface LoginCredentials {
    username: string; // Can be email or username
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class AuthService {
    /**
     * Login user with username/email and password
     */
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded format
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await axios.post<AuthResponse>(
            `${API_ROUTER}/auth/login`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Store both tokens in localStorage
        if (response.data.access_token) {
            this.setToken(response.data.access_token);
        }
        if (response.data.refresh_token) {
            this.setRefreshToken(response.data.refresh_token);
        }

        return response.data;
    }

    /**
     * Get current user information
     */
    static async getCurrentUser(): Promise<UserInfo> {
        const token = this.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get<UserInfo>(
            `${API_ROUTER}/auth/me`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return response.data;
    }

    /**
     * Refresh authentication token
     */
    static async refreshToken(): Promise<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const response = await axios.post<AuthResponse>(
            `${API_ROUTER}/auth/refresh`,
            {},
            {
                headers: {
                    'X-Refresh-Token': refreshToken,
                },
            }
        );

        // Update both tokens in localStorage
        if (response.data.access_token) {
            this.setToken(response.data.access_token);
        }
        if (response.data.refresh_token) {
            this.setRefreshToken(response.data.refresh_token);
        }

        return response.data;
    }

    /**
     * Logout user and clear tokens
     */
    static async logout(): Promise<void> {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            try {
                await axios.post(
                    `${API_ROUTER}/auth/logout`,
                    {},
                    {
                        headers: {
                            'X-Refresh-Token': refreshToken,
                        },
                    }
                );
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        this.removeToken();
        this.removeRefreshToken();
    }

    /**
     * Store authentication token
     */
    static setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    }

    /**
     * Retrieve authentication token
     */
    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    }

    /**
     * Remove authentication token
     */
    static removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    /**
     * Store refresh token
     */
    static setRefreshToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
    }

    /**
     * Retrieve refresh token
     */
    static getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(REFRESH_TOKEN_KEY);
        }
        return null;
    }

    /**
     * Remove refresh token
     */
    static removeRefreshToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Get authorization header for authenticated requests
     */
    static getAuthHeader(): { Authorization: string } | {} {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}
