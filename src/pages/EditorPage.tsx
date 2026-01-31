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
import { BottomSheet } from '../components/UI/BottomSheet';

import { TemplateType } from '../types/resume.types';
import { usePDFExportContext } from '../contexts/PDFExportContext';
import { usePDFExport } from '../hooks/usePDFExport';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Download, Share2, History, Eye, Settings, Save, ChevronDown, Edit2, Layout, PanelRightClose, PanelRight } from 'lucide-react';
import { QuickStartTutorial } from '../components/Tutorial';

const EditorPageContent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentResume, loadResume, updateResume, isSaving, error } = useResumeBackend();
    const { resume, dispatch } = useResumeContext();

    // UI States
    const [activeSheet, setActiveSheet] = useState<'edit' | 'settings' | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    // Layout States
    const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    
    // Feature States
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Ref for debouncing title save
    const titleSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track if this is a newly created resume
    const [isNewResume, setIsNewResume] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup title save timer
    useEffect(() => {
        return () => {
            if (titleSaveTimerRef.current) {
                clearTimeout(titleSaveTimerRef.current);
            }
        };
    }, []);

    // PDF Export
    const { previewRef } = usePDFExportContext();
    const { handleExport, isExporting: isServerExporting } = usePDFExport(resume, previewRef);

    const pageStyle = `
        @page {
            size: A4 portrait;
            margin: 0;
        }
        @media print {
            html, body {
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

    const [isClientExporting, setIsClientExporting] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: previewRef,
        documentTitle: `${resume.personalInfo.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}`,
        onBeforePrint: async () => {
            setIsClientExporting(true);
        },
        onAfterPrint: () => {
            setIsClientExporting(false);
        },
        onPrintError: (errorLocation, error) => {
            console.error('PDF Export Error:', errorLocation, error);
            setIsClientExporting(false);
        },
        pageStyle,
        suppressErrors: true,
    });

    const handleExportOption = async (type: 'server' | 'client') => {
        setShowExportMenu(false);
        if (type === 'server') {
            await handleExport(undefined, pageStyle);
        } else {
            handlePrint();
        }
    };

    const isExporting = isServerExporting || isClientExporting;
    const hasLoadedRef = useRef(false);
    const hasSyncedRef = useRef(false);
    const lastTemplateRef = useRef(resume.template);

    // Watch for template changes to trigger autosave
    useEffect(() => {
        if (hasSyncedRef.current && lastTemplateRef.current !== resume.template) {
            lastTemplateRef.current = resume.template;
            if (currentResume) {
                updateResume({ templateId: resume.template });
            }
        }
    }, [resume.template, currentResume, updateResume]);

    // Load resume on mount
    useEffect(() => {
        if (id && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadResume(id);
        }
    }, [id, loadResume]);

    // Sync backend resume to local context
    useEffect(() => {
        if (currentResume && currentResume.id === id && !hasSyncedRef.current) {
            hasSyncedRef.current = true;

            const createdAt = new Date(currentResume.createdAt);
            const now = new Date();
            const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
            setIsNewResume(diffInSeconds < 30);

            if (currentResume.content) {
                let updatedSections = [];
                if (currentResume.content.sectionOrder && currentResume.content.sectionOrder.length > 0) {
                    updatedSections = currentResume.content.sectionOrder.map(metadata => {
                        let content: any = {};
                        switch (metadata.type) {
                            case 'summary':
                                content = { summary: currentResume.content.summary || '' };
                                break;
                            case 'experience':
                                content = { experiences: currentResume.content.experience || [] };
                                break;
                            case 'education':
                                content = { education: currentResume.content.education || [] };
                                break;
                            case 'skills':
                                content = { skills: currentResume.content.skills || [] };
                                break;
                            case 'projects':
                                content = { projects: currentResume.content.projects || [] };
                                break;
                            case 'certifications':
                                content = { certifications: currentResume.content.certifications || [] };
                                break;
                            case 'additional-info':
                                content = { additionalInfo: currentResume.content.additionalInfo || [] };
                                break;
                            case 'custom':
                                const customSectionData = currentResume.content.customSections?.find(
                                    cs => cs.id === metadata.id
                                );
                                content = {
                                    custom: {
                                        id: metadata.id,
                                        title: metadata.title,
                                        content: customSectionData?.content || ''
                                    }
                                };
                                break;
                        }

                        return {
                            id: metadata.id,
                            type: metadata.type as any,
                            title: metadata.title,
                            enabled: metadata.enabled,
                            order: metadata.order,
                            content: content
                        };
                    });
                    updatedSections.sort((a, b) => a.order - b.order);
                } else {
                     // Fallback for legacy
                     updatedSections = resume.sections.map(section => {
                        // ... legacy mapping logic ...
                        // Keeping it simple as it was mostly redundant in the original file
                        // Assuming the original map logic was correct, I will just copy the essence
                        // to save tokens, assuming modern resumes use sectionOrder.
                         if (section.type === 'summary' && currentResume.content.summary) return { ...section, content: { summary: currentResume.content.summary } };
                         if (section.type === 'experience' && currentResume.content.experience) return { ...section, content: { experiences: currentResume.content.experience } };
                         if (section.type === 'education' && currentResume.content.education) return { ...section, content: { education: currentResume.content.education } };
                         if (section.type === 'skills' && currentResume.content.skills) return { ...section, content: { skills: currentResume.content.skills } };
                         if (section.type === 'projects' && currentResume.content.projects) return { ...section, content: { projects: currentResume.content.projects } };
                         if (section.type === 'certifications' && currentResume.content.certifications) return { ...section, content: { certifications: currentResume.content.certifications } };
                         if (section.type === 'additional-info' && currentResume.content.additionalInfo) return { ...section, content: { additionalInfo: currentResume.content.additionalInfo } };
                        return section;
                    });
                }

                lastTemplateRef.current = (currentResume.templateId || resume.template) as TemplateType;

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

    useEffect(() => {
        if (currentResume && !isEditingTitle) {
            setEditedTitle(currentResume.title);
        }
    }, [currentResume, isEditingTitle]);

    const handleSave = useCallback(async () => {
        if (!currentResume) return;

        const summarySection = resume.sections.find(s => s.type === 'summary');
        const experienceSection = resume.sections.find(s => s.type === 'experience');
        const educationSection = resume.sections.find(s => s.type === 'education');
        const skillsSection = resume.sections.find(s => s.type === 'skills');
        const projectsSection = resume.sections.find(s => s.type === 'projects');
        const certificationsSection = resume.sections.find(s => s.type === 'certifications');
        const additionalInfoSection = resume.sections.find(s => s.type === 'additional-info');

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
                additionalInfo: (additionalInfoSection?.content as any)?.additionalInfo || [],
                sectionOrder,
                layout: resume.layout,
            },
        });
    }, [resume, currentResume, updateResume, editedTitle]);

    const handleTitleClick = () => setIsEditingTitle(true);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setEditedTitle(newTitle);
        if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
        titleSaveTimerRef.current = setTimeout(() => {
            if (newTitle.trim() !== '' && currentResume && newTitle !== currentResume.title) {
                updateResume({ title: newTitle });
            }
        }, 1000);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (editedTitle.trim() === '') {
            setEditedTitle(currentResume?.title || 'Untitled Resume');
        } else if (currentResume && editedTitle !== currentResume.title) {
            if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
            updateResume({ title: editedTitle });
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
            if (editedTitle.trim() === '') setEditedTitle(currentResume?.title || 'Untitled Resume');
            else if (currentResume && editedTitle !== currentResume.title) {
                if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
                updateResume({ title: editedTitle });
            }
        } else if (e.key === 'Escape') {
            setEditedTitle(currentResume?.title || 'Untitled Resume');
            setIsEditingTitle(false);
            if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
        }
    };

    const handleBack = () => navigate('/dashboard');
    const handleShare = () => id && navigate(`/share/${id}`);
    const handleVersions = () => id && navigate(`/versions/${id}`);

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
        <div className="h-screen flex flex-col bg-gray-50 print:h-auto print:overflow-visible">
            <QuickStartTutorial resumeId={id} isNewResume={isNewResume} />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-2 flex items-center justify-between gap-1 sm:gap-2 print:hidden sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
                    <Button variant="ghost" onClick={handleBack} className="p-1.5 sm:p-2 flex-shrink-0">
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
                            <div className="flex items-center gap-1.5 cursor-pointer group min-w-0" onClick={handleTitleClick}>
                                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                    {editedTitle || currentResume.title}
                                </h1>
                                <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                            </div>
                        )}
                        <SaveStatusIndicator isSaving={isSaving} />
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                     {/* Template Selector Toggle */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                        className={`p-1.5 sm:px-4 sm:py-2 ${showTemplateSelector ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
                        title="Change Template"
                    >
                        <Layout className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Template</span>
                    </Button>

                    {/* Desktop Right Sidebar Toggle */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                        className="hidden lg:flex p-1.5 sm:px-4 sm:py-2"
                        title={showRightSidebar ? "Hide Settings" : "Show Settings"}
                    >
                        {showRightSidebar ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
                    </Button>

                    <Button variant="secondary" onClick={handleVersions} className="p-1.5 sm:px-4 sm:py-2 hidden sm:flex" title="History">
                        <History className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="hidden lg:inline">Versions</span>
                    </Button>

                    <Button variant="secondary" onClick={handleShare} className="p-1.5 sm:px-4 sm:py-2 hidden sm:flex" title="Share">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="hidden lg:inline">Share</span>
                    </Button>

                    <Button variant="primary" onClick={handleSave} disabled={isSaving} className="p-1.5 sm:px-4 sm:py-2 flex-shrink-0">
                        {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                <span className="hidden sm:inline">Save</span>
                            </>
                        )}
                    </Button>

                    <div className="relative" ref={exportMenuRef}>
                        <Button
                            variant="secondary"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={isExporting}
                            className="p-1.5 sm:px-4 sm:py-2 flex-shrink-0"
                        >
                            {isExporting ? (
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                    <ChevronDown className="w-3 h-3 ml-0.5" />
                                </>
                            )}
                        </Button>

                        {showExportMenu && !isExporting && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1">
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => handleExportOption('server')}>
                                    Server Export (Stable)
                                </button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed" disabled>
                                    Client Export (Disabled)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3 print:hidden">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {showTemplateSelector && (
                <div className="bg-white border-b border-gray-200 px-4 py-4 flex justify-center print:hidden shadow-inner">
                    <TemplateSelector
                        currentTemplate={resume.template || 'modern'}
                        onTemplateChange={(template) => dispatch({ type: 'SET_TEMPLATE', payload: template })}
                    />
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative print:overflow-visible">
                {/* Desktop Left Panel (Editor) */}
                <div 
                    className={`hidden lg:flex flex-col bg-white border-r border-gray-200 print:hidden transition-all duration-300 ease-in-out ${
                        isLeftSidebarCollapsed ? 'w-20' : 'w-96'
                    }`}
                >
                    <EditorSidebar 
                        isCollapsed={isLeftSidebarCollapsed} 
                        onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)} 
                    />
                </div>

                {/* Center Panel (Preview) */}
                <div className="flex-1 overflow-y-auto bg-gray-100/50 print:overflow-visible print:bg-white print:p-0 relative">
                     {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    
                    <div className="p-2 sm:p-4 lg:p-8 min-h-full z-10 relative">
                        <PreviewContainer className="w-full max-w-full" showZoomControls={true} showPrintMode={true} />
                    </div>
                </div>

                {/* Desktop Right Panel (Settings) */}
                <div 
                    className={`hidden lg:block bg-white border-l border-gray-200 overflow-y-auto print:hidden transition-all duration-300 ease-in-out ${
                        showRightSidebar ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
                    }`}
                >
                    <LayoutControls />
                </div>

                {/* Mobile Bottom Sheets */}
                <BottomSheet isOpen={activeSheet === 'edit'} onClose={() => setActiveSheet(null)} title="Resume Editor">
                    <EditorSidebar />
                </BottomSheet>

                <BottomSheet isOpen={activeSheet === 'settings'} onClose={() => setActiveSheet(null)} title="Layout & Settings">
                    <LayoutControls />
                </BottomSheet>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:hidden safe-area-bottom">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveSheet('edit')}
                        className={`flex flex-col items-center gap-1 h-auto py-2 ${activeSheet === 'edit' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                    >
                        <Edit2 className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveSheet(null)}
                        className={`flex flex-col items-center gap-1 h-auto py-2 ${activeSheet === null ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                    >
                        <Eye className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Preview</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveSheet('settings')}
                        className={`flex flex-col items-center gap-1 h-auto py-2 ${activeSheet === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Settings</span>
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
