import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import type { ApiError } from '../types/api.types';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError<ApiError>) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            // Unauthorized - clear tokens and redirect to login
            if (status === 401) {
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                
                // CRITICAL: Sign out from Supabase to prevent auto-login loop
                await supabase.auth.signOut();

                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // Return formatted error
            return Promise.reject({
                status,
                code: data?.error?.code || 'UNKNOWN_ERROR',
                message: data?.error?.message || 'An unexpected error occurred',
                details: data?.error?.details,
            });
        }

        // Network error
        if (error.request) {
            return Promise.reject({
                status: 0,
                code: 'NETWORK_ERROR',
                message: 'Unable to connect to the server. Please check your internet connection.',
            });
        }

        // Other errors
        return Promise.reject({
            status: 0,
            code: 'UNKNOWN_ERROR',
            message: error.message || 'An unexpected error occurred',
        });
    }
);

// Helper function to set auth token
export const setAuthToken = (token: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

// Helper function to clear auth token
export const clearAuthToken = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export default apiClient;
