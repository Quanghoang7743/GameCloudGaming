// API Client for Moonlight Web Backend
// This client handles all HTTP requests to the Rust backend
// Uses relative URLs - Next.js will proxy to backend via next.config.ts

const API_BASE_URL = '';

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public statusText: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Important for session cookies
        });

        if (!response.ok) {
            throw new ApiError(
                `API request failed: ${response.statusText}`,
                response.status,
                response.statusText
            );
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export specific API functions
export const api = {
    // Host management
    hosts: {
        list: async () => {
            const response = await apiClient.get<any>('/api/hosts');
            return response.hosts || [];
        },
        get: (hostId: number) => apiClient.get(`/api/host?id=${hostId}`),
        add: (data: { address: string; port?: number }) =>
            apiClient.post('/api/host', data),
        delete: (hostId: number) =>
            apiClient.delete(`/api/host?id=${hostId}`),
    },

    auth: {
        login: async (username: string, password: string) => {
            const url = '/api/login';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: username, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new ApiError(
                    `Login failed: ${response.statusText}`,
                    response.status,
                    response.statusText
                );
            }
            return { success: true };
        },
    },
};
