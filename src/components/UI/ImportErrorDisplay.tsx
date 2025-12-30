/**
 * ImportErrorDisplay Component
 * Displays error messages with actionable suggestions for AI import failures
 */

import React from 'react';
import { Button } from './Button';
import {
    AlertCircle,
    RefreshCw,
    FileText,
    Wifi,
    HelpCircle,
    ExternalLink,
} from 'lucide-react';

interface ImportErrorDisplayProps {
    error: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    showRetry?: boolean;
}

interface ErrorInfo {
    title: string;
    description: string;
    suggestions: string[];
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const getErrorInfo = (error: string): ErrorInfo => {
    const errorLower = error.toLowerCase();

    // File validation errors
    if (errorLower.includes('file type') || errorLower.includes('invalid file')) {
        return {
            title: 'Invalid File Type',
            description: error,
            suggestions: [
                'Ensure your file is in PDF or DOCX format',
                'Try converting your resume to PDF using a PDF converter',
                'Avoid using image-only PDFs (scanned documents)',
            ],
            icon: <FileText className="w-6 h-6" />,
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
        };
    }

    // File size errors
    if (errorLower.includes('file size') || errorLower.includes('10mb')) {
        return {
            title: 'File Too Large',
            description: error,
            suggestions: [
                'Compress your PDF using online tools',
                'Remove unnecessary images or graphics',
                'Try exporting your resume with lower quality settings',
            ],
            icon: <FileText className="w-6 h-6" />,
            color: 'text-orange-700',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
        };
    }

    // AI extraction errors
    if (errorLower.includes('extraction') || errorLower.includes('parse') || errorLower.includes('analyze')) {
        return {
            title: 'Extraction Failed',
            description: error,
            suggestions: [
                'Ensure your resume has clear section headings',
                'Try simplifying complex formatting or layouts',
                'Use a standard resume template',
                'Check that your resume contains readable text (not just images)',
            ],
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
        };
    }

    // Timeout errors
    if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
        return {
            title: 'Request Timed Out',
            description: error,
            suggestions: [
                'Try uploading a shorter resume (2-3 pages recommended)',
                'Simplify complex formatting',
                'Check your internet connection',
                'Wait a moment and try again',
            ],
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'text-yellow-700',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
        };
    }

    // Rate limit errors
    if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
        return {
            title: 'Rate Limit Exceeded',
            description: error,
            suggestions: [
                'You can import up to 5 resumes per hour',
                'Wait for your rate limit to reset',
                'Check your rate limit status before trying again',
            ],
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'text-purple-700',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
        };
    }

    // Network errors
    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('offline')) {
        return {
            title: 'Connection Error',
            description: error,
            suggestions: [
                'Check your internet connection',
                'Try again in a few moments',
                'Disable VPN if you\'re using one',
                'Check if the service is available',
            ],
            icon: <Wifi className="w-6 h-6" />,
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        };
    }

    // Authentication errors
    if (errorLower.includes('unauthorized') || errorLower.includes('authentication')) {
        return {
            title: 'Authentication Required',
            description: error,
            suggestions: [
                'Please log in to import resumes',
                'Your session may have expired - try logging in again',
                'Clear your browser cache and cookies',
            ],
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
        };
    }

    // Generic error
    return {
        title: 'Import Failed',
        description: error,
        suggestions: [
            'Try again in a few moments',
            'Ensure your resume is in PDF or DOCX format',
            'Check that your file is under 10MB',
            'Contact support if the problem persists',
        ],
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    };
};

export const ImportErrorDisplay: React.FC<ImportErrorDisplayProps> = ({
    error,
    onRetry,
    onDismiss,
    showRetry = true,
}) => {
    const errorInfo = getErrorInfo(error);

    return (
        <div className={`border rounded-lg p-6 ${errorInfo.bgColor} ${errorInfo.borderColor}`}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 ${errorInfo.color}`}>
                    {errorInfo.icon}
                </div>
                <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${errorInfo.color} mb-1`}>
                        {errorInfo.title}
                    </h3>
                    <p className={`text-sm ${errorInfo.color}`}>
                        {errorInfo.description}
                    </p>
                </div>
            </div>

            {/* Suggestions */}
            <div className="mb-4">
                <h4 className={`text-sm font-semibold ${errorInfo.color} mb-2`}>
                    What you can try:
                </h4>
                <ul className={`text-sm ${errorInfo.color} space-y-1.5`}>
                    {errorInfo.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-1">•</span>
                            <span>{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {showRetry && onRetry && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onRetry}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                )}
                {onDismiss && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onDismiss}
                    >
                        Dismiss
                    </Button>
                )}
                <a
                    href="mailto:support@resumebuilder.com"
                    className={`text-sm ${errorInfo.color} hover:underline flex items-center gap-1 ml-auto`}
                >
                    <HelpCircle className="w-4 h-4" />
                    Contact Support
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
};
