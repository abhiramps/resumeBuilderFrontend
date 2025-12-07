/**
 * Resume Editor Page
 * Main editor with three-panel layout: editor, preview, and controls
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResumeBackend } from '../contexts/ResumeBackendContext';
import { useResumeContext } from '../contexts/ResumeContext';
import { PDFExportProvider } from '../contexts/PDFExportContext';
import { EditorSidebar } from '../components/Editor/EditorSidebar';
import { PreviewContainer } from '../components/Preview/PreviewContainer';
import { LayoutControls } from '../components/Layout/LayoutControls';
import { Button } from '../components/UI/Button';
import { SaveStatusIndicator } from '../components/UI/SaveStatusIndicator';
import { TemplateSelector } from '../components/UI/TemplateSelector';

import { usePDFExportContext } from '../contexts/PDFExportContext';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Download, Share2, History, Eye, EyeOff, Settings, Save } from 'lucide-react';

const EditorPageContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentResume, loadResume, updateResume, isSaving, error } = useResumeBackend();
    const { resume, dispatch } = useResumeContext();

    const [showPreview, setShowPreview] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    // Track if we've loaded the resume from backend
    const hasLoadedRef = useRef(false);
    const hasSyncedRef = useRef(false);

    // Load resume on mount - only once
    useEffect(() => {
        if (id && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadResume(id);
        }
    }, [id]);

    // Sync backend resume to local context (only once when data is loaded)
    useEffect(() => {
        if (currentResume && currentResume.id === id && !hasSyncedRef.current) {
            hasSyncedRef.current = true;

            // Update local context with backend data
            if (currentResume.content) {
                // Reconstruct sections from backend data
                let updatedSections = resume.sections.map(section => {
                    if (section.type === 'summary' && currentResume.content.summary) {
                        return {
                            ...section,
                            content: { summary: currentResume.content.summary }
                        };
                    }
                    if (section.type === 'experience' && currentResume.content.experience) {
                        return {
                            ...section,
                            content: { experiences: currentResume.content.experience }
                        };
                    }
                    if (section.type === 'education' && currentResume.content.education) {
                        return {
                            ...section,
                            content: { education: currentResume.content.education }
                        };
                    }
                    if (section.type === 'skills' && currentResume.content.skills) {
                        return {
                            ...section,
                            content: { skills: currentResume.content.skills }
                        };
                    }
                    if (section.type === 'projects' && currentResume.content.projects) {
                        return {
                            ...section,
                            content: { projects: currentResume.content.projects }
                        };
                    }
                    if (section.type === 'certifications' && currentResume.content.certifications) {
                        return {
                            ...section,
                            content: { certifications: currentResume.content.certifications }
                        };
                    }
                    return section;
                });

                // Restore section order and metadata if saved
                if (currentResume.content.sectionOrder && currentResume.content.sectionOrder.length > 0) {
                    updatedSections = updatedSections.map(section => {
                        const savedMetadata = currentResume.content.sectionOrder?.find(
                            s => s.type === section.type
                        );
                        if (savedMetadata) {
                            return {
                                ...section,
                                id: savedMetadata.id,
                                title: savedMetadata.title,
                                enabled: savedMetadata.enabled,
                                order: savedMetadata.order,
                            };
                        }
                        return section;
                    });
                    // Sort by saved order
                    updatedSections.sort((a, b) => a.order - b.order);
                }

                dispatch({
                    type: 'SET_RESUME',
                    payload: {
                        ...resume,
                        id: currentResume.id,
                        template: currentResume.templateId || resume.template,
                        personalInfo: currentResume.content.personalInfo || resume.personalInfo,
                        sections: updatedSections,
                        layout: currentResume.content.layout || resume.layout,
                        createdAt: currentResume.createdAt,
                        updatedAt: currentResume.updatedAt,
                    }
                });
            }
        }
    }, [currentResume?.id]);

    // Initialize edited title when currentResume changes
    useEffect(() => {
        if (currentResume) {
            setEditedTitle(currentResume.title);
        }
    }, [currentResume?.id]);

    // Manual save function
    const handleSave = useCallback(async () => {
        if (!currentResume) return;

        // Extract content from sections
        const summarySection = resume.sections.find(s => s.type === 'summary');
        const experienceSection = resume.sections.find(s => s.type === 'experience');
        const educationSection = resume.sections.find(s => s.type === 'education');
        const skillsSection = resume.sections.find(s => s.type === 'skills');
        const projectsSection = resume.sections.find(s => s.type === 'projects');
        const certificationsSection = resume.sections.find(s => s.type === 'certifications');

        // Save section metadata (order, enabled status, etc.)
        const sectionOrder = resume.sections.map(section => ({
            id: section.id,
            type: section.type,
            title: section.title,
            enabled: section.enabled,
            order: section.order,
        }));

        updateResume({
            title: editedTitle || currentResume.title,
            templateId: resume.template || 'modern',
            content: {
                personalInfo: resume.personalInfo,
                summary: (summarySection?.content as any)?.summary || '',
                experience: (experienceSection?.content as any)?.experiences || [],
                education: (educationSection?.content as any)?.education || [],
                skills: (skillsSection?.content as any)?.skills || [],
                projects: (projectsSection?.content as any)?.projects || [],
                certifications: (certificationsSection?.content as any)?.certifications || [],
                sectionOrder,
                layout: resume.layout,
            },
        });
    }, [resume, currentResume, updateResume, editedTitle]);

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (editedTitle.trim() === '') {
            setEditedTitle(currentResume?.title || 'Untitled Resume');
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
            if (editedTitle.trim() === '') {
                setEditedTitle(currentResume?.title || 'Untitled Resume');
            }
        } else if (e.key === 'Escape') {
            setEditedTitle(currentResume?.title || 'Untitled Resume');
            setIsEditingTitle(false);
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleShare = () => {
        if (id) {
            navigate(`/share/${id}`);
        }
    };

    const handleVersions = () => {
        if (id) {
            navigate(`/versions/${id}`);
        }
    };

    // PDF Export using context ref
    const { previewRef } = usePDFExportContext();

    const generateFileName = () => {
        const name = resume.personalInfo.fullName || 'Resume';
        const date = new Date().toISOString().split('T')[0];
        return `${name.replace(/\s+/g, '_')}_Resume_${date}`;
    };

    const pageStyle = `
        @page {
            size: letter;
            margin: ${resume.layout.pageMargins.top}in ${resume.layout.pageMargins.right}in ${resume.layout.pageMargins.bottom}in ${resume.layout.pageMargins.left}in;
        }
        @media print {
            html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    `;

    const handlePrint = useReactToPrint({
        contentRef: previewRef,
        documentTitle: generateFileName(),
        onBeforePrint: async () => {
            setIsExporting(true);
        },
        onAfterPrint: () => {
            setIsExporting(false);
        },
        onPrintError: (errorLocation, error) => {
            console.error('PDF Export Error:', errorLocation, error);
            setIsExporting(false);
        },
        pageStyle,
        suppressErrors: true,
    });

    const handleExportClick = () => {
        if (!previewRef.current) {
            console.error('Preview ref not available');
            return;
        }
        handlePrint();
    };

    const toggleRightSidebar = () => {
        setShowRightSidebar(!showRightSidebar);
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    if (!currentResume) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading resume...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                autoFocus
                                className="text-lg font-semibold text-gray-900 border-b-2 border-blue-600 focus:outline-none bg-transparent px-1"
                                style={{ minWidth: '200px' }}
                            />
                        ) : (
                            <h1
                                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={handleTitleClick}
                                title="Click to edit title"
                            >
                                {editedTitle || currentResume.title}
                            </h1>
                        )}
                        <SaveStatusIndicator isSaving={isSaving} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Template Selector */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    >
                        Template
                    </Button>

                    {/* Toggle Preview (Mobile) */}
                    <Button
                        variant="secondary"
                        onClick={togglePreview}
                        className="lg:hidden"
                    >
                        {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>

                    {/* Toggle Right Sidebar (Desktop) */}
                    <Button
                        variant="secondary"
                        onClick={toggleRightSidebar}
                        className="hidden lg:flex"
                        title="Toggle Layout Controls"
                    >
                        <Settings className="w-5 h-5" />
                    </Button>

                    {/* Version History */}
                    <Button variant="secondary" onClick={handleVersions}>
                        <History className="w-5 h-5 mr-2" />
                        Versions
                    </Button>

                    {/* Share */}
                    <Button variant="secondary" onClick={handleShare}>
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                    </Button>

                    {/* Save Button */}
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save
                            </>
                        )}
                    </Button>

                    {/* Export PDF */}
                    <Button
                        variant="secondary"
                        onClick={handleExportClick}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                Export PDF
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Template Selector Dropdown */}
            {showTemplateSelector && (
                <div className="bg-white border-b border-gray-200 px-4 py-4 flex justify-center">
                    <TemplateSelector
                        currentTemplate={resume.template || 'modern'}
                        onTemplateChange={(template) => {
                            dispatch({ type: 'SET_TEMPLATE', payload: template });
                        }}
                    />
                </div>
            )}

            {/* Main Content - Three Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Editor Sidebar */}
                <div className="w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto">
                    <EditorSidebar />
                </div>

                {/* Center Panel - Preview */}
                {showPreview && (
                    <div className="hidden lg:block flex-1 overflow-y-auto bg-gray-100 p-6">
                        <PreviewContainer
                            showZoomControls={true}
                            showPrintMode={true}
                        />
                    </div>
                )}

                {/* Right Panel - Layout Controls */}
                {showRightSidebar && (
                    <div className="hidden lg:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
                        <LayoutControls />
                    </div>
                )}

                {/* Mobile Preview (Full Screen) */}
                {showPreview && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-gray-100 overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Preview</h2>
                            <Button variant="ghost" onClick={togglePreview}>
                                <EyeOff className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-4">
                            <PreviewContainer
                                showZoomControls={true}
                                showPrintMode={true}
                            />
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};

export const EditorPage: React.FC = () => {
    return (
        <PDFExportProvider>
            <EditorPageContent />
        </PDFExportProvider>
    );
};
