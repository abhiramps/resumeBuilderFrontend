/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
    BASE_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001',
    TIMEOUT: 30000, // 30 seconds

    // API Endpoints
    ENDPOINTS: {
        // Auth
        AUTH: {
            SIGNUP: '/auth/signup',
            SIGNIN: '/auth/signin',
            SIGNOUT: '/auth/signout',
            SESSION: '/auth/session',
            GOOGLE: '/auth/oauth/google',
            GITHUB: '/auth/oauth/github',
            CALLBACK: '/auth/oauth/callback',
            RESET_PASSWORD: '/auth/reset-password',
        },

        // User
        USER: {
            PROFILE: '/user/profile',
            UPDATE_PROFILE: '/user/profile',
            DELETE_ACCOUNT: '/user/account',
        },

        // Resumes
        RESUMES: {
            LIST: '/resumes',
            CREATE: '/resumes',
            GET: (id: string) => `/resumes/${id}`,
            UPDATE: (id: string) => `/resumes/${id}`,
            DELETE: (id: string) => `/resumes/${id}`,
            DUPLICATE: (id: string) => `/resumes/${id}/duplicate`,

            // Sharing
            SHARE: (id: string) => `/resumes/${id}/share`,
            PUBLIC: (slug: string) => `/resumes/public/${slug}`,

            // Versions
            VERSIONS: (id: string) => `/resumes/${id}/versions`,
            CREATE_VERSION: (id: string) => `/resumes/${id}/versions`,
            GET_VERSION: (id: string, versionId: string) => `/resumes/${id}/versions/${versionId}`,
            RESTORE_VERSION: (id: string, versionId: string) => `/resumes/${id}/versions/${versionId}/restore`,

            // Export
            EXPORT: '/resumes/export',

            // Import
            IMPORT: '/resumes/import',
        },
    },
} as const;

// Token storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
} as const;
