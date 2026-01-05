import axios from 'axios';
import { API_ROUTER } from './router';

export interface LoginCredentials {
    username: string; // Can be email or username
    password: string;
}

export interface LoginResponse {
    username: string;
    email: string;
    message: string;
}

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

export class AuthService {
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await axios.post<LoginResponse>(
            `${API_ROUTER}/auth/login`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                withCredentials: true,  // Include cookies
            }
        );

        return response.data;
    }

    static async getCurrentUser(): Promise<UserInfo> {
        const response = await axios.get<UserInfo>(
            `${API_ROUTER}/auth/me`,
            {
                withCredentials: true,  // Include cookies
            }
        );

        return response.data;
    }

    static async refreshToken(): Promise<void> {
        await axios.post(
            `${API_ROUTER}/auth/refresh`,
            {},
            {
                withCredentials: true,  // Include cookies
            }
        );
        // New cookies set automatically by server
    }

    static async logout(): Promise<void> {
        try {
            await axios.post(
                `${API_ROUTER}/auth/logout`,
                {},
                {
                    withCredentials: true,  // Include cookies
                }
            );
        } catch (error) {
            console.error('Logout error:', error);
        }
        // Cookies cleared by server
    }


    static async isAuthenticated(): Promise<boolean> {
        try {
            await this.getCurrentUser();
            return true;
        } catch {
            return false;
        }
    }
}
