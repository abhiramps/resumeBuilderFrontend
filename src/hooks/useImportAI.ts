/**
 * useImportAI Hook
 * Manages AI-powered resume import operations
 */

import { useState, useCallback } from 'react';
import { resumeService } from '../services/resume.service';
import type { ResumeResponse } from '../types/api.types';

export type AIImportStage = 'idle' | 'uploading' | 'extracting' | 'mapping' | 'creating' | 'complete' | 'error';

export interface AIImportResult {
    success: boolean;
    resume?: ResumeResponse;
    confidenceScore?: number;
    incompleteSections?: string[];
    error?: string;
    cached?: boolean;
}

export interface AIImportProgress {
    stage: AIImportStage;
    message: string;
    progress: number; // 0-100
}

interface UseImportAIReturn {
    isImporting: boolean;
    progress: AIImportProgress;
    result: AIImportResult | null;
    error: string | null;
    importFromFile: (file: File) => Promise<AIImportResult>;
    checkRateLimit: () => Promise<{ remaining: number; resetTime: number; limit: number } | null>;
    reset: () => void;
    clearError: () => void;
}

const STAGE_MESSAGES: Record<AIImportStage, string> = {
    idle: 'Ready to import',
    uploading: 'Uploading your resume...',
    extracting: 'AI is analyzing your resume...',
    mapping: 'Structuring your data...',
    creating: 'Creating your resume...',
    complete: 'Import complete!',
    error: 'Import failed',
};

const STAGE_PROGRESS: Record<AIImportStage, number> = {
    idle: 0,
    uploading: 20,
    extracting: 50,
    mapping: 75,
    creating: 90,
    complete: 100,
    error: 0,
};

export const useImportAI = (): UseImportAIReturn => {
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState<AIImportProgress>({
        stage: 'idle',
        message: STAGE_MESSAGES.idle,
        progress: 0,
    });
    const [result, setResult] = useState<AIImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Update progress stage
     */
    const updateStage = useCallback((stage: AIImportStage) => {
        setProgress({
            stage,
            message: STAGE_MESSAGES[stage],
            progress: STAGE_PROGRESS[stage],
        });
    }, []);

    /**
     * Reset hook state
     */
    const reset = useCallback(() => {
        setIsImporting(false);
        setProgress({
            stage: 'idle',
            message: STAGE_MESSAGES.idle,
            progress: 0,
        });
        setResult(null);
        setError(null);
    }, []);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Import resume from file using AI
     */
    const importFromFile = useCallback(async (file: File): Promise<AIImportResult> => {
        try {
            setIsImporting(true);
            setError(null);
            setResult(null);

            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            // Validate file type
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
                throw new Error('Invalid file type. Please upload a PDF or DOCX file.');
            }

            // Validate file size (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('File size exceeds 10MB limit. Please upload a smaller file.');
            }

            // Stage 1: Uploading
            updateStage('uploading');

            // Stage 2: Extracting (simulated progress - actual extraction happens on backend)
            setTimeout(() => {
                if (progress.stage !== 'error') {
                    updateStage('extracting');
                }
            }, 500);

            // Call backend API
            const response = await resumeService.importResumeAI(file);

            // Stage 3: Mapping
            updateStage('mapping');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Stage 4: Creating
            updateStage('creating');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Stage 5: Complete
            updateStage('complete');

            const importResult: AIImportResult = {
                success: true,
                resume: response.resume,
                confidenceScore: response.confidenceScore,
                incompleteSections: response.incompleteSections,
                cached: response.cached,
            };

            setResult(importResult);
            return importResult;

        } catch (err) {
            updateStage('error');

            let errorMessage = 'Failed to import resume. Please try again.';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                const error = err as any;
                if (error.response?.data?.error?.message) {
                    errorMessage = error.response.data.error.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);

            const errorResult: AIImportResult = {
                success: false,
                error: errorMessage,
            };

            setResult(errorResult);
            return errorResult;

        } finally {
            setIsImporting(false);
        }
    }, [updateStage, progress.stage]);

    /**
     * Check rate limit status
     */
    const checkRateLimit = useCallback(async (): Promise<{ remaining: number; resetTime: number; limit: number } | null> => {
        try {
            const status = await resumeService.checkImportRateLimit();
            return status;
        } catch (err) {
            console.error('Failed to check rate limit:', err);
            return null;
        }
    }, []);

    return {
        isImporting,
        progress,
        result,
        error,
        importFromFile,
        checkRateLimit,
        reset,
        clearError,
    };
};
