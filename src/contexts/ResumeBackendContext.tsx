/**
 * Resume Backend Context
 * Manages resume state with backend synchronization and auto-save
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { resumeService } from '../services/resume.service';
import type {
    ResumeResponse,
    CreateResumeRequest,
    UpdateResumeRequest,
    ResumeListQuery,
    PaginatedResponse,
} from '../types/api.types';

interface ResumeBackendContextType {
    currentResume: ResumeResponse | null;
    resumes: ResumeResponse[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    pagination: PaginatedResponse<ResumeResponse>['pagination'] | null;

    // CRUD operations
    loadResume: (id: string) => Promise<void>;
    updateResume: (data: UpdateResumeRequest) => void;
    createResume: (data: CreateResumeRequest) => Promise<ResumeResponse>;
    deleteResume: (id: string) => Promise<void>;
    duplicateResume: (id: string) => Promise<ResumeResponse>;
    listResumes: (query?: ResumeListQuery) => Promise<void>;

    // Utility methods
    clearError: () => void;
    forceSync: () => Promise<void>;
}

const ResumeBackendContext = createContext<ResumeBackendContextType | undefined>(undefined);

export const ResumeBackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentResume, setCurrentResume] = useState<ResumeResponse | null>(null);
    const [resumes, setResumes] = useState<ResumeResponse[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<ResumeResponse>['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load a resume by ID
     */
    const loadResume = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const resume = await resumeService.getResume(id);
            setCurrentResume(resume);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load resume';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update resume (manual save)
     */
    const updateResume = useCallback(async (data: UpdateResumeRequest) => {
        if (!currentResume) return;

        setIsSaving(true);
        setError(null);
        try {
            const updated = await resumeService.updateResume(currentResume.id, data);
            setCurrentResume(updated);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to save resume';
            setError(errorMessage);
            console.error('Save failed:', err);
            throw new Error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    }, [currentResume]);

    /**
     * Create a new resume
     */
    const createResume = useCallback(async (data: CreateResumeRequest): Promise<ResumeResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const resume = await resumeService.createResume(data);
            setCurrentResume(resume);
            setResumes((prev) => [resume, ...prev]);
            return resume;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create resume';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete a resume
     */
    const deleteResume = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await resumeService.deleteResume(id);

            // Clear current resume if it's the one being deleted
            if (currentResume?.id === id) {
                setCurrentResume(null);
            }

            // Remove from list
            setResumes((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete resume';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [currentResume]);

    /**
     * Duplicate a resume
     */
    const duplicateResume = useCallback(async (id: string): Promise<ResumeResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const duplicated = await resumeService.duplicateResume(id);
            setResumes((prev) => [duplicated, ...prev]);
            return duplicated;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to duplicate resume';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * List resumes with pagination and filters
     */
    const listResumes = useCallback(async (query?: ResumeListQuery) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await resumeService.getResumes(query);
            setResumes(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load resumes';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Force sync - no longer needed with manual save
     */
    const forceSync = useCallback(async () => {
        // No-op - manual save only
    }, []);

    const value: ResumeBackendContextType = {
        currentResume,
        resumes,
        isLoading,
        isSaving,
        error,
        pagination,
        loadResume,
        updateResume,
        createResume,
        deleteResume,
        duplicateResume,
        listResumes,
        clearError,
        forceSync,
    };

    return (
        <ResumeBackendContext.Provider value={value}>
            {children}
        </ResumeBackendContext.Provider>
    );
};

/**
 * Hook to use resume backend context
 */
export const useResumeBackend = () => {
    const context = useContext(ResumeBackendContext);
    if (!context) {
        throw new Error('useResumeBackend must be used within ResumeBackendProvider');
    }
    return context;
};
