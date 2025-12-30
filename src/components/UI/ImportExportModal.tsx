/**
 * ImportExportModal Component
 * Modal for importing and exporting resumes in various formats
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Button } from './Button';
import {
    Download,
    Upload,
    FileJson,
    FileText,
    File,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { useImportExport } from '../../hooks/useImportExport';
import { useImportAI } from '../../hooks/useImportAI';
import { ImportErrorDisplay } from './ImportErrorDisplay';
import { ImportPreviewModal } from './ImportPreviewModal';
import type { ResumeResponse } from '../../types/api.types';

interface ImportExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    resume?: ResumeResponse;
    resumes?: ResumeResponse[];
    mode: 'single' | 'bulk';
    onImportSuccess?: (resume: ResumeResponse) => void;
}

type TabType = 'export' | 'import';
type ExportFormat = 'json' | 'pdf' | 'docx';
type ImportMode = 'json' | 'ai';

// AI Import progress stages
type AIImportStage = 'idle' | 'uploading' | 'extracting' | 'mapping' | 'creating' | 'complete';

const AI_IMPORT_STAGES: Record<AIImportStage, { label: string; description: string }> = {
    idle: { label: 'Ready', description: 'Select a file to begin' },
    uploading: { label: 'Uploading', description: 'Uploading your resume file...' },
    extracting: { label: 'Extracting', description: 'AI is analyzing your resume...' },
    mapping: { label: 'Mapping', description: 'Structuring your data...' },
    creating: { label: 'Creating', description: 'Creating your resume...' },
    complete: { label: 'Complete', description: 'Resume imported successfully!' },
};

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
    isOpen,
    onClose,
    resume,
    resumes = [],
    mode,
    onImportSuccess,
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('export');
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
    const [importMode, setImportMode] = useState<ImportMode>('json');
    const [aiImportStage, setAiImportStage] = useState<AIImportStage>('idle');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [importedResumeData, setImportedResumeData] = useState<{
        resume: ResumeResponse;
        confidenceScore: number;
        incompleteSections: string[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isExporting,
        isImporting: isImportingJSON,
        error: importExportError,
        exportAsJSON,
        exportAsPDF,
        exportAsDOCX,
        bulkExportAsJSON,
        importFromJSON,
        clearError: clearImportExportError,
    } = useImportExport();

    const {
        isImporting: isImportingAI,
        progress: aiProgress,
        result: aiResult,
        error: aiError,
        importFromFile: importFromFileAI,
        clearError: clearAIError,
    } = useImportAI();

    const isImporting = isImportingJSON || isImportingAI;
    const error = importExportError || aiError;
    const clearError = () => {
        clearImportExportError();
        clearAIError();
    };

    const handleExport = async () => {
        try {
            clearError();
            setSuccessMessage(null);

            if (mode === 'bulk') {
                if (selectedFormat === 'json') {
                    await bulkExportAsJSON(resumes);
                    setSuccessMessage(`Successfully exported ${resumes.length} resumes`);
                } else {
                    throw new Error('Bulk export only supports JSON format');
                }
            } else if (resume) {
                switch (selectedFormat) {
                    case 'json':
                        await exportAsJSON(resume);
                        setSuccessMessage('Resume exported as JSON');
                        break;
                    case 'pdf':
                        await exportAsPDF(resume.id);
                        setSuccessMessage('Resume exported as PDF');
                        break;
                    case 'docx':
                        await exportAsDOCX(resume.id);
                        setSuccessMessage('Resume exported as DOCX');
                        break;
                }
            }

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const handleImport = async (file: File) => {
        try {
            clearError();
            setSuccessMessage(null);

            if (file.type === 'application/json' || importMode === 'json') {
                // JSON import (client-side parsing)
                const importedResume = await importFromJSON(file);

                if (importedResume) {
                    setSuccessMessage('Resume imported successfully');
                    onImportSuccess?.(importedResume);
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                }
            } else {
                // AI import with progress tracking
                setAiImportStage('uploading');

                const result = await importFromFileAI(file);

                if (result.success && result.resume) {
                    // Show preview modal for AI imports
                    setImportedResumeData({
                        resume: result.resume,
                        confidenceScore: result.confidenceScore || 0,
                        incompleteSections: result.incompleteSections || [],
                    });
                    setShowPreviewModal(true);
                    setAiImportStage('complete');
                } else {
                    setAiImportStage('idle');
                }
            }
        } catch (err) {
            console.error('Import failed:', err);
            setAiImportStage('idle');
        }
    };

    const handlePreviewConfirm = () => {
        if (importedResumeData) {
            setSuccessMessage('Resume imported successfully');
            onImportSuccess?.(importedResumeData.resume);
            setShowPreviewModal(false);
            setTimeout(() => {
                setAiImportStage('idle');
                onClose();
                navigate(`/editor/${importedResumeData.resume.id}`);
            }, 1500);
        }
    };

    const handlePreviewEdit = () => {
        if (importedResumeData) {
            setShowPreviewModal(false);
            onClose();
            navigate(`/editor/${importedResumeData.resume.id}`);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImport(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleImport(file);
        }
    };

    const formatOptions = [
        {
            value: 'json' as ExportFormat,
            label: 'JSON',
            description: 'Editable format for backup and transfer',
            icon: FileJson,
            available: true,
        },
        {
            value: 'pdf' as ExportFormat,
            label: 'PDF',
            description: 'Print-ready format for applications',
            icon: FileText,
            available: mode === 'single',
        },
        {
            value: 'docx' as ExportFormat,
            label: 'DOCX',
            description: 'Editable Word document',
            icon: File,
            available: mode === 'single',
        },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'bulk' ? 'Bulk Export Resumes' : 'Import / Export Resume'}
            size="lg"
        >
            <div className="space-y-6">
                {/* Tabs */}
                {mode === 'single' && (
                    <div className="flex gap-2 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('export')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'export'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Download className="w-4 h-4 inline mr-2" />
                            Export
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'import'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Import
                        </button>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* Error Message with Actionable Suggestions */}
                {error && (
                    <ImportErrorDisplay
                        error={error}
                        onRetry={() => {
                            clearError();
                            fileInputRef.current?.click();
                        }}
                        onDismiss={clearError}
                        showRetry={activeTab === 'import'}
                    />
                )}

                {/* Export Tab */}
                {(activeTab === 'export' || mode === 'bulk') && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                                {mode === 'bulk' ? 'Select Export Format' : 'Choose Export Format'}
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {formatOptions
                                    .filter(option => option.available)
                                    .map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setSelectedFormat(option.value)}
                                                className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all ${selectedFormat === option.value
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon className={`w-6 h-6 flex-shrink-0 ${selectedFormat === option.value ? 'text-blue-600' : 'text-gray-400'
                                                    }`} />
                                                <div className="flex-1 text-left">
                                                    <div className="font-medium text-gray-900">{option.label}</div>
                                                    <div className="text-sm text-gray-600">{option.description}</div>
                                                </div>
                                                {selectedFormat === option.value && (
                                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        {mode === 'bulk' && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-800">
                                    <strong>{resumes.length}</strong> resume{resumes.length !== 1 ? 's' : ''} will be exported
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleExport}
                                loading={isExporting}
                                disabled={isExporting}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export {mode === 'bulk' ? 'All' : selectedFormat.toUpperCase()}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && mode === 'single' && (
                    <div className="space-y-6">
                        {/* Import Mode Toggle */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                                Choose Import Method
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setImportMode('json')}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all ${importMode === 'json'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <FileJson className={`w-6 h-6 flex-shrink-0 ${importMode === 'json' ? 'text-blue-600' : 'text-gray-400'
                                        }`} />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900">JSON Import</div>
                                        <div className="text-xs text-gray-600">Previously exported resumes</div>
                                    </div>
                                    {importMode === 'json' && (
                                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setImportMode('ai')}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all ${importMode === 'ai'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Sparkles className={`w-6 h-6 flex-shrink-0 ${importMode === 'ai' ? 'text-blue-600' : 'text-gray-400'
                                        }`} />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900">AI Import</div>
                                        <div className="text-xs text-gray-600">PDF/DOCX with AI parsing</div>
                                    </div>
                                    {importMode === 'ai' && (
                                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Drag and Drop Area */}
                        <div>
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {importMode === 'ai' ? (
                                    <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                ) : (
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                )}
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    Drop your {importMode === 'ai' ? 'resume' : 'JSON'} file here, or click to browse
                                </p>
                                <p className="text-xs text-gray-600">
                                    {importMode === 'ai'
                                        ? 'Supports PDF and DOCX files (max 10MB)'
                                        : 'Supports JSON files only'
                                    }
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={importMode === 'ai' ? '.pdf,.docx' : '.json'}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* AI Import Progress Indicator */}
                        {importMode === 'ai' && isImporting && aiImportStage !== 'idle' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {AI_IMPORT_STAGES[aiImportStage].label}
                                        </h4>
                                        <p className="text-xs text-gray-600">
                                            {AI_IMPORT_STAGES[aiImportStage].description}
                                        </p>
                                    </div>
                                    {aiImportStage !== 'complete' && (
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    )}
                                    {aiImportStage === 'complete' && (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Uploading</span>
                                        <span>Extracting</span>
                                        <span>Mapping</span>
                                        <span>Creating</span>
                                    </div>
                                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-out"
                                            style={{
                                                width: aiImportStage === 'uploading' ? '25%'
                                                    : aiImportStage === 'extracting' ? '50%'
                                                        : aiImportStage === 'mapping' ? '75%'
                                                            : aiImportStage === 'creating' || aiImportStage === 'complete' ? '100%'
                                                                : '0%'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Stage Indicators */}
                                <div className="grid grid-cols-4 gap-2">
                                    {(['uploading', 'extracting', 'mapping', 'creating'] as AIImportStage[]).map((stage, index) => {
                                        const isActive = aiImportStage === stage;
                                        const isComplete = ['uploading', 'extracting', 'mapping', 'creating'].indexOf(aiImportStage) > index;

                                        return (
                                            <div
                                                key={stage}
                                                className={`flex items-center justify-center p-2 rounded-md text-xs font-medium transition-colors ${isActive
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : isComplete
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {isComplete && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {isActive && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                                {AI_IMPORT_STAGES[stage].label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Import Info */}
                        {!isImporting && (
                            <div className="space-y-3">
                                {importMode === 'json' ? (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                                        <FileJson className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">JSON Files</div>
                                            <div className="text-gray-600">
                                                Import previously exported resumes with full data preservation
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <div className="font-medium text-blue-900">AI-Powered Import</div>
                                                <div className="text-blue-700">
                                                    Our AI will automatically extract and structure your resume content.
                                                    You can review and edit the results after import.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                                            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">Supported Formats</div>
                                                <div className="text-gray-600">
                                                    PDF and DOCX files up to 10MB. Best results with standard resume formats.
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {isImporting && importMode === 'json' && (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-600">Importing resume...</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Import Preview Modal */}
            {showPreviewModal && importedResumeData && (
                <ImportPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    resume={importedResumeData.resume}
                    confidenceScore={importedResumeData.confidenceScore}
                    incompleteSections={importedResumeData.incompleteSections}
                    onConfirm={handlePreviewConfirm}
                    onEdit={handlePreviewEdit}
                />
            )}
        </Modal>
    );
};
