/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient, setAuthToken, clearAuthToken } from '../utils/axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import { supabase } from '../lib/supabase';
import type {
    SignUpRequest,
    SignInRequest,
    AuthResponse,
    SessionResponse,
} from '../types/api.types';
import { Session } from '@supabase/supabase-js';

interface OAuthResponse {
    url: string;
}

export const authService = {
    /**
     * Sign up a new user
     */
    async signUp(data: SignUpRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
            data
        );

        // Only store token and user data if session exists and email is verified
        // Don't store anything if email verification is required
        if (response.data.session && !response.data.requiresEmailVerification && response.data.user) {
            setAuthToken(response.data.session.access_token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.session.refresh_token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
            
            // Sync with local Supabase client
            await supabase.auth.setSession({
                access_token: response.data.session.access_token,
                refresh_token: response.data.session.refresh_token,
            });
        }

        return response.data;
    },

    /**
     * Sign in an existing user
     */
    async signIn(data: SignInRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            API_CONFIG.ENDPOINTS.AUTH.SIGNIN,
            data
        );

        // Store token and user data
        if (response.data.session) {
            setAuthToken(response.data.session.access_token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.session.refresh_token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));

            // Sync with local Supabase client
            await supabase.auth.setSession({
                access_token: response.data.session.access_token,
                refresh_token: response.data.session.refresh_token,
            });
        }

        return response.data;
    },

    /**
     * Sign out the current user
     */
    async signOut(): Promise<void> {
        try {
            await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNOUT);
            await supabase.auth.signOut();
        } finally {
            // Always clear local storage even if API call fails
            clearAuthToken();
        }
    },

    /**
     * Get current session
     */
    async getSession(): Promise<SessionResponse> {
        // Ensure local supabase client is synced if we have a token but no session
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
             const { data: { session } } = await supabase.auth.getSession();
             if (!session) {
                 // Try to recover session or it might be expired
             }
        }

        const response = await apiClient.get<SessionResponse>(
            API_CONFIG.ENDPOINTS.AUTH.SESSION
        );

        // Update stored user data
        if (response.data.user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        }

        return response.data;
    },

    /**
     * OAuth sign in
     */
    async signInWithOAuth(provider: 'google' | 'github'): Promise<OAuthResponse> {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        console.log("redirectUrl", redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });
        console.log("data", data);
        console.log("error", error);


        if (error) throw error;
        return { url: data.url };
    },

    /**
     * Handle OAuth callback
     */
    /**
     * Sync Supabase session with Backend
     */
    async syncWithBackend(session: Session): Promise<AuthResponse> {
        // 1. Set local tokens
        setAuthToken(session.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
        // We initially set the supabase user, but we'll overwrite with backend user if possible
        const supabaseUser = session.user;
        // Don't JSON.stringify if user is just { id: ... } ? No, supabaseUser is full object from session.
        // session.user is from Supabase types.
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(supabaseUser));

        // 2. Sync with Backend (ensure user exists in DB)
        try {
            // We call the session endpoint which should upsert the user
            console.log('Frontend: Attempting to sync with backend...');
            const response = await apiClient.get<SessionResponse>(API_CONFIG.ENDPOINTS.AUTH.SESSION);
            console.log('Frontend: Backend sync successful', response.data);
            
            // Return combined data
            return {
                user: response.data.user || supabaseUser,
                session: session,
            };
        } catch (err) {
                console.error("Frontend: Failed to sync user with backend:", err);
                
                // If backend sync fails, we return the Supabase user data so the frontend can at least function.
                
                const fallbackUser = {
                    ...supabaseUser!, // We assume session has user
                    email: supabaseUser?.email || '',
                    fullName: supabaseUser?.user_metadata?.full_name,
                    // Fix type mismatch for email_confirmed_at
                    email_confirmed_at: supabaseUser?.email_confirmed_at || undefined
                };
                return {
                    user: fallbackUser,
                    session: session,
                };
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    /**
     * Get stored user data
     */
    getStoredUser(): SessionResponse['user'] | null {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },
};
