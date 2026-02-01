/**
 * Authentication Types
 * Types for authentication, user management, and session handling
 */

// Re-export from api.types for convenience
export type {
    SignUpRequest,
    SignInRequest,
    AuthResponse,
    SessionResponse,
} from './api.types';

/**
 * User type for authentication context
 */
export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    email_confirmed_at?: string | null;
    confirmed_at?: string | null;
    isEmailVerified?: boolean; // From backend profile
}

/**
 * Authentication state
 */
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Signup credentials
 */
export interface SignupCredentials {
    email: string;
    password: string;
    fullName?: string;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github';

/**
 * Token storage
 */
export interface TokenStorage {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
