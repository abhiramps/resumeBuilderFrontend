/**
 * User Service
 * Handles user profile and account management API calls
 */

import { apiClient, clearAuthToken } from '../utils/axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import type {
    ApiResponse,
    UserProfile,
    UpdateProfileRequest,
} from '../types/api.types';

export const userService = {
    /**
     * Get current user profile
     */
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get<ApiResponse<UserProfile>>(
            API_CONFIG.ENDPOINTS.USER.PROFILE
        );

        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data));

        return response.data.data;
    },

    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        const response = await apiClient.put<ApiResponse<UserProfile>>(
            API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
            data
        );

        // Update stored user data
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data));

        return response.data.data;
    },

    /**
     * Delete user account
     */
    async deleteAccount(): Promise<void> {
        await apiClient.delete(API_CONFIG.ENDPOINTS.USER.DELETE_ACCOUNT);

        // Clear all stored data
        clearAuthToken();
    },
};
