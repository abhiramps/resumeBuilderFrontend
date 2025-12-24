/**
 * Resume Service
 * Handles all resume-related API calls
 */

import { apiClient } from '../utils/axios';
import { API_CONFIG } from '../config/api.config';
import type {
    ApiResponse,
    PaginatedResponse,
    ResumeResponse,
    CreateResumeRequest,
    UpdateResumeRequest,
    ResumeListQuery,
    ShareResumeRequest,
    ShareResumeResponse,
} from '../types/api.types';

export const resumeService = {
    /**
     * Get list of resumes with pagination and filters
     */
    async getResumes(query?: ResumeListQuery): Promise<PaginatedResponse<ResumeResponse>> {
        const params = new URLSearchParams();

        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.status) params.append('status', query.status);
        if (query?.search) params.append('search', query.search);
        if (query?.sortBy) params.append('sortBy', query.sortBy);
        if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

        const response = await apiClient.get<PaginatedResponse<ResumeResponse>>(
            `${API_CONFIG.ENDPOINTS.RESUMES.LIST}?${params.toString()}`
        );

        return response.data;
    },

    /**
     * Get a single resume by ID
     */
    async getResume(id: string): Promise<ResumeResponse> {
        const response = await apiClient.get<ApiResponse<ResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.GET(id)
        );

        return response.data.data;
    },

    /**
     * Get a public resume by slug
     */
    async getPublicResume(slug: string): Promise<ResumeResponse> {
        const response = await apiClient.get<ApiResponse<ResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.PUBLIC(slug)
        );

        return response.data.data;
    },

    /**
     * Create a new resume
     */
    async createResume(data: CreateResumeRequest): Promise<ResumeResponse> {
        const response = await apiClient.post<ApiResponse<ResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.CREATE,
            data
        );

        return response.data.data;
    },

    /**
     * Update an existing resume
     */
    async updateResume(id: string, data: UpdateResumeRequest): Promise<ResumeResponse> {
        const response = await apiClient.put<ApiResponse<ResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.UPDATE(id),
            data
        );

        return response.data.data;
    },

    /**
     * Delete a resume
     */
    async deleteResume(id: string): Promise<void> {
        await apiClient.delete(API_CONFIG.ENDPOINTS.RESUMES.DELETE(id));
    },

    /**
     * Duplicate a resume
     */
    async duplicateResume(id: string): Promise<ResumeResponse> {
        const response = await apiClient.post<ApiResponse<ResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.DUPLICATE(id)
        );

        return response.data.data;
    },

    /**
     * Update resume sharing settings
     */
    async shareResume(id: string, data: ShareResumeRequest): Promise<ShareResumeResponse> {
        const response = await apiClient.post<ApiResponse<ShareResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.SHARE(id),
            data
        );

        return response.data.data;
    },

    /**
     * Export resume in specified format
     */
    /**
     * Export resume to PDF via server-side generation
     */
    async exportResume(html: string, css: string): Promise<Blob> {
        const response = await apiClient.post(
            API_CONFIG.ENDPOINTS.RESUMES.EXPORT,
            { html, css },
            {
                responseType: 'blob',
            }
        );

        return response.data;
    },

    /**
     * Import resume from file
     */
    async importResume(file: File): Promise<ResumeResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<ApiResponse<ResumeResponse>>(
            API_CONFIG.ENDPOINTS.RESUMES.IMPORT,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data;
    },
};
