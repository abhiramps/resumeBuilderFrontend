/**
 * API Response and Error Types
 * Matches backend API response format
 */

import { Sector } from './sector.types';

// import { TemplateType } from './resume.types';

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

// Auth types
export interface SignUpRequest {
    email: string;
    password: string;
    fullName?: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    session: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
    } | null;
    user: {
        id: string;
        email: string;
        fullName?: string;
        email_confirmed_at?: string | null;
    } | null;
    requiresEmailVerification?: boolean;
}

export interface SessionResponse {
    user: {
        id: string;
        email: string;
        fullName?: string;
        avatarUrl?: string;
    };
}

// User types
export interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionExpiresAt?: string;
    trialEndsAt?: string;
    resumeCount: number;
    exportCount: number;
    storageUsedBytes: number;
    preferences: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    avatarUrl?: string;
    preferences?: Record<string, any>;
}

// Resume API types
export interface CreateResumeRequest {
    title: string;
    description?: string;
    templateId: string;
    content?: ResumeContent;
    sector?: Sector;
}

export interface UpdateResumeRequest {
    title?: string;
    description?: string;
    templateId?: string;
    content?: ResumeContent;
    status?: 'draft' | 'published';
    sector?: Sector;
}

export interface ResumeListQuery {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published' | 'all';
    search?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}

// ... (skipping to ResumeResponse)

export interface ResumeResponse {
    id: string;
    userId: string;
    title: string;
    description?: string;
    templateId: string;
    sector: Sector;
    content: ResumeContent;
    status: 'draft' | 'published';
    isPublic: boolean;
    publicSlug?: string;
    viewCount: number;
    exportCount: number;
    lastExportedAt?: string;
    version: number;
    isCurrentVersion: boolean;
    atsScore?: number;
    atsIssues?: any[];
    lastAtsCheckAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShareResumeRequest {
    isPublic: boolean;
    publicSlug?: string;
}

export interface ShareResumeResponse {
    publicUrl: string;
    publicSlug: string;
    isPublic: boolean;
}

// Resume Version types
export interface CreateVersionRequest {
    versionName?: string;
    changesSummary?: string;
}

export interface ResumeVersionResponse {
    id: string;
    resumeId: string;
    userId: string;
    versionNumber: number;
    versionName?: string;
    content: ResumeContent;
    templateId: string;
    createdAt: string;
    changesSummary?: string;
}

// Resume content structure (matching backend)
export interface ResumeContent {
    personalInfo?: PersonalInfo;
    summary?: string;
    experience?: ExperienceItem[];
    education?: EducationItem[];
    skills?: SkillItem[];
    certifications?: CertificationItem[];
    projects?: ProjectItem[];
    languages?: LanguageItem[];
    additionalInfo?: AdditionalInfoItem[];
    customSections?: CustomSectionItem[];
    sectionOrder?: SectionMetadata[];
    layout?: ResumeLayout;
}

export interface SectionMetadata {
    id: string;
    type: string;
    title: string;
    enabled: boolean;
    order: number;
}

export interface ResumeLayout {
    pageMargins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    sectionSpacing: number;
    lineHeight: number;
    fontSize: {
        name: number;
        title: number;
        sectionHeader: number;
        body: number;
    };
    fontFamily: string;
    colors: {
        primary: string;
        secondary: string;
        text: string;
    };
}

export interface PersonalInfo {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
}

export interface ExperienceItem {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements?: string[];
}

export interface EducationItem {
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    coursework?: string[];
}

export interface SkillItem {
    id: string;
    name: string;
    category: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    techStack?: string[];
    startDate: string;
    endDate?: string;
    current: boolean;
    url?: string;
    githubUrl?: string;
}

export interface LanguageItem {
    id: string;
    name: string;
    proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface CustomSectionItem {
    id: string;
    title: string;
    content: string;
    order: number;
}

export interface AdditionalInfoItem {
    id: string;
    title: string;
    content: string[];
}



// Export types
export interface ExportResumeRequest {
    format: 'pdf' | 'docx' | 'json';
}
