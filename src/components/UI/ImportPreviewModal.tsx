/**
 * ImportPreviewModal Component
 * Preview extracted resume data from AI import with confidence score
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
    CheckCircle,
    AlertTriangle,
    User,
    Briefcase,
    GraduationCap,
    Code,
    Award,
    FolderGit2,
    Languages,
    FileText,
    Edit,
    ArrowRight,
} from 'lucide-react';
import type { ResumeResponse } from '../../types/api.types';

interface ImportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    resume: ResumeResponse;
    confidenceScore: number;
    incompleteSections: string[];
    onConfirm: () => void;
    onEdit: () => void;
}

interface ConfidenceLevel {
    level: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    message: string;
}

const getConfidenceLevel = (score: number): ConfidenceLevel => {
    if (score >= 90) {
        return {
            level: 'excellent',
            color: 'text-green-700',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            icon: <CheckCircle className="w-5 h-5 text-green-600" />,
            message: 'Excellent extraction quality. Resume is ready to use.',
        };
    } else if (score >= 70) {
        return {
            level: 'good',
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
            message: 'Good extraction quality. Minor review recommended.',
        };
    } else if (score >= 50) {
        return {
            level: 'fair',
            color: 'text-yellow-700',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
            message: 'Fair extraction quality. Please review and complete missing information.',
        };
    } else {
        return {
            level: 'poor',
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
            message: 'Low extraction quality. Significant review and editing required.',
        };
    }
};

const sectionIcons: Record<string, React.ReactNode> = {
    personalInfo: <User className="w-5 h-5" />,
    summary: <FileText className="w-5 h-5" />,
    experience: <Briefcase className="w-5 h-5" />,
    education: <GraduationCap className="w-5 h-5" />,
    skills: <Code className="w-5 h-5" />,
    certifications: <Award className="w-5 h-5" />,
    projects: <FolderGit2 className="w-5 h-5" />,
    languages: <Languages className="w-5 h-5" />,
};

const sectionLabels: Record<string, string> = {
    personalInfo: 'Personal Information',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    certifications: 'Certifications',
    projects: 'Projects',
    languages: 'Languages',
};

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
    isOpen,
    onClose,
    resume,
    confidenceScore,
    incompleteSections,
    onConfirm,
    onEdit,
}) => {
    const confidenceLevel = getConfidenceLevel(confidenceScore);
    const content = resume.content as any;

    // Count items in each section
    const sectionCounts: Record<string, number> = {
        personalInfo: content.personalInfo ? 1 : 0,
        summary: content.summary ? 1 : 0,
        experience: content.experience?.length || 0,
        education: content.education?.length || 0,
        skills: content.skills?.length || 0,
        certifications: content.certifications?.length || 0,
        projects: content.projects?.length || 0,
        languages: content.languages?.length || 0,
    };

    const allSections = Object.keys(sectionLabels);
    const completeSections = allSections.filter(
        section => !incompleteSections.includes(section) && sectionCounts[section] > 0
    );
    const missingSections = allSections.filter(
        section => incompleteSections.includes(section) || sectionCounts[section] === 0
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review Imported Resume"
            size="xl"
        >
            <div className="space-y-6">
                {/* Confidence Score */}
                <div className={`flex items-start gap-4 p-4 border rounded-lg ${confidenceLevel.bgColor} ${confidenceLevel.borderColor}`}>
                    <div className="flex-shrink-0 mt-0.5">
                        {confidenceLevel.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-sm font-semibold ${confidenceLevel.color}`}>
                                Confidence Score: {confidenceScore}%
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${confidenceScore >= 90 ? 'bg-green-600'
                                                : confidenceScore >= 70 ? 'bg-blue-600'
                                                    : confidenceScore >= 50 ? 'bg-yellow-600'
                                                        : 'bg-red-600'
                                            }`}
                                        style={{ width: `${confidenceScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className={`text-sm ${confidenceLevel.color}`}>
                            {confidenceLevel.message}
                        </p>
                    </div>
                </div>

                {/* Resume Title */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resume.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {content.personalInfo?.fullName && (
                            <span className="font-medium">{content.personalInfo.fullName}</span>
                        )}
                        {content.personalInfo?.email && (
                            <span className="text-gray-500"> • {content.personalInfo.email}</span>
                        )}
                    </p>
                </div>

                {/* Sections Overview */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Extracted Sections
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Complete Sections */}
                        {completeSections.map((section) => (
                            <div
                                key={section}
                                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md"
                            >
                                <div className="text-green-600">
                                    {sectionIcons[section]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {sectionLabels[section]}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {sectionCounts[section]} {sectionCounts[section] === 1 ? 'item' : 'items'}
                                    </div>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            </div>
                        ))}

                        {/* Incomplete/Missing Sections */}
                        {missingSections.map((section) => (
                            <div
                                key={section}
                                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md opacity-60"
                            >
                                <div className="text-gray-400">
                                    {sectionIcons[section]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-600 truncate">
                                        {sectionLabels[section]}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {sectionCounts[section] === 0 ? 'Not found' : 'Incomplete'}
                                    </div>
                                </div>
                                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Incomplete Sections Warning */}
                {incompleteSections.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                                Incomplete Sections Detected
                            </h4>
                            <p className="text-sm text-yellow-700 mb-2">
                                The following sections need your attention:
                            </p>
                            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                                {incompleteSections.map((section) => (
                                    <li key={section}>{sectionLabels[section] || section}</li>
                                ))}
                            </ul>
                            <p className="text-sm text-yellow-700 mt-2">
                                You can edit these sections after importing.
                            </p>
                        </div>
                    </div>
                )}

                {/* Preview Summary */}
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {completeSections.length}
                            </div>
                            <div className="text-xs text-gray-600">Complete Sections</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {Object.values(sectionCounts).reduce((a, b) => a + b, 0)}
                            </div>
                            <div className="text-xs text-gray-600">Total Items</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {missingSections.length}
                            </div>
                            <div className="text-xs text-gray-600">Needs Review</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={onEdit}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Now
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onConfirm}
                            className="flex items-center gap-2"
                        >
                            Confirm & Continue
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
