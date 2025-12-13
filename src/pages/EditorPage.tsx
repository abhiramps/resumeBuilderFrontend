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
import { ArrowLeft, Download, Share2, History, Eye, Settings, Save } from 'lucide-react';

const EditorPageContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentResume, loadResume, updateResume, isSaving, error } = useResumeBackend();
    const { resume, dispatch } = useResumeContext();

    const [activeView, setActiveView] = useState('preview'); // 'edit', 'preview', 'settings'
    
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
    }, [id, loadResume]);

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
    }, [currentResume, id, dispatch, resume]);

    // Initialize edited title when currentResume changes
    useEffect(() => {
        if (currentResume) {
            setEditedTitle(currentResume.title);
        }
    }, [currentResume]);

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
            <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <Button variant="ghost" onClick={handleBack} className="flex-shrink-0">
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                autoFocus
                                className="text-sm sm:text-lg font-semibold text-gray-900 border-b-2 border-blue-600 focus:outline-none bg-transparent px-1 w-full"
                            />
                        ) : (
                            <h1
                                className="text-sm sm:text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                                onClick={handleTitleClick}
                                title="Click to edit title"
                            >
                                {editedTitle || currentResume.title}
                            </h1>
                        )}
                        <SaveStatusIndicator isSaving={isSaving} />
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                        variant="secondary"
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                        className="flex"
                    >
                        <span className="inline">Template</span>
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={toggleRightSidebar}
                        className="hidden lg:flex"
                        title="Toggle Layout Controls"
                    >
                        <Settings className="w-5 h-5" />
                    </Button>

                    <Button variant="secondary" onClick={handleVersions} className="hidden md:flex">
                        <History className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="hidden lg:inline">Versions</span>
                    </Button>

                    <Button variant="secondary" onClick={handleShare} className="hidden md:flex">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="hidden lg:inline">Share</span>
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-shrink-0"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white sm:mr-2"></div>
                                <span className="hidden sm:inline">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                <span className="hidden sm:inline">Save</span>
                            </>
                        )}
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleExportClick}
                        disabled={isExporting}
                        className="flex-shrink-0"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white sm:mr-2"></div>
                                <span className="hidden sm:inline">Exporting...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                <span className="hidden sm:inline">Export PDF</span>
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

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

            <div className="flex-1 flex overflow-hidden relative">
                {/* Desktop Left Panel */}
                <div className="hidden lg:block w-96 bg-white border-r border-gray-200 overflow-y-auto">
                    <EditorSidebar />
                </div>

                {/* Center Panel (Desktop and Mobile Preview) */}
                <div className="flex-1 overflow-y-auto bg-gray-100 lg:p-6">
                    <div className="hidden lg:block">
                        <PreviewContainer showZoomControls={true} showPrintMode={true} />
                    </div>
                    <div className="lg:hidden">
                        {activeView === 'preview' && (
                           <div className="p-4">
                                <PreviewContainer showZoomControls={false} showPrintMode={false} />
                           </div>
                        )}
                    </div>
                </div>

                {/* Desktop Right Panel */}
                {showRightSidebar && (
                    <div className="hidden lg:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
                        <LayoutControls />
                    </div>
                )}

                {/* Mobile Overlays */}
                <div className="lg:hidden">
                    {/* Edit Panel Overlay */}
                    {activeView === 'edit' && (
                        <div className="fixed inset-0 z-40 bg-white overflow-y-auto pb-16">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                                <h2 className="text-lg font-semibold">Edit Resume</h2>
                                <Button variant="ghost" onClick={() => setActiveView('preview')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
                            <EditorSidebar />
                        </div>
                    )}

                    {/* Settings Panel Overlay */}
                    {activeView === 'settings' && (
                        <div className="fixed inset-0 z-40 bg-white overflow-y-auto pb-16">
                           <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                                <h2 className="text-lg font-semibold">Settings</h2>
                                <Button variant="ghost" onClick={() => setActiveView('preview')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
                            <LayoutControls />
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around z-50 shadow-lg">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView('edit')}
                        className={`flex flex-col items-center gap-1 ${activeView === 'edit' ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-xs">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView('preview')}
                        className={`flex flex-col items-center gap-1 ${activeView === 'preview' ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                        <Eye className="w-5 h-5" />
                        <span className="text-xs">Preview</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView('settings')}
                        className={`flex flex-col items-center gap-1 ${activeView === 'settings' ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-xs">Settings</span>
                    </Button>
                </div>
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
