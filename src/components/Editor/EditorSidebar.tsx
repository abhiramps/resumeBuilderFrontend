import React from 'react';
import { useResumeContext } from '../../contexts/ResumeContext';
import { SortableSectionList } from './SortableSectionList';
import { ATSScorePanel } from './ATSScorePanel';
import { PersonalInfoEditor } from './PersonalInfoEditor';
import { SummaryEditor } from './SummaryEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { ProjectsEditor } from './ProjectsEditor';
import { SkillsEditor } from './SkillsEditor';
import { EducationEditor } from './EducationEditor';
import { CertificationsEditor } from './CertificationsEditor';
import { AdditionalInfoEditor } from './AdditionalInfoEditor';
import { CustomSectionEditor } from './CustomSectionEditor';
import { ResumeSection } from '../../types/resume.types';
import { SidebarIconNav } from './SidebarIconNav';
import { ChevronLeft } from 'lucide-react';

interface EditorSidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({ 
    isCollapsed = false, 
    onToggleCollapse = () => {} 
}) => {
    const { resume, dispatch, atsValidation } = useResumeContext();

    const handleReorderSections = (sectionIds: string[]) => {
        dispatch({ type: 'REORDER_SECTIONS', payload: sectionIds });
    };

    const handleToggleSection = (sectionId: string) => {
        dispatch({ type: 'TOGGLE_SECTION', payload: sectionId });
    };

    const handleDeleteSection = (sectionId: string) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            dispatch({ type: 'DELETE_SECTION', payload: sectionId });
        }
    };

    const renderSectionContent = (section: ResumeSection) => {
        switch (section.type) {
            case 'summary':
                return <SummaryEditor />;
            case 'experience':
                return <ExperienceEditor />;
            case 'projects':
                return <ProjectsEditor />;
            case 'skills':
                return <SkillsEditor />;
            case 'education':
                return <EducationEditor />;
            case 'certifications':
                return <CertificationsEditor />;
            case 'additional-info':
                return <AdditionalInfoEditor />;
            case 'custom':
                return <CustomSectionEditor section={section} />;
            default:
                return null;
        }
    };

    if (isCollapsed) {
        return (
            <SidebarIconNav 
                sections={resume.sections} 
                onSectionClick={() => {
                     // TODO: Scroll to section functionality
                     onToggleCollapse();
                }}
                onExpand={onToggleCollapse}
            />
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header / Collapse Toggle - Only visible on Desktop */}
            <div className="hidden lg:flex items-center justify-between p-3 sm:px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Editor</h2>
                <button 
                    onClick={onToggleCollapse}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    title="Collapse Sidebar"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
                {/* ATS Score Panel - Always visible at top */}
                <ATSScorePanel validation={atsValidation} />

                {/* Personal Information - Not draggable, always at top */}
                <PersonalInfoEditor />

                {/* Sortable Sections */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 px-1 flex items-center justify-between">
                        <span>Resume Sections</span>
                        <span className="font-medium">{resume.sections.length} sections</span>
                    </h3>
                    <SortableSectionList
                        sections={resume.sections}
                        onReorder={handleReorderSections}
                        onToggleSection={handleToggleSection}
                        onDeleteSection={handleDeleteSection}
                        renderSectionContent={renderSectionContent}
                    />
                </div>

                {/* Add Custom Section Button */}
                <button
                    onClick={() => {
                        const title = prompt('Enter section title:');
                        if (title?.trim()) {
                            const newSection: ResumeSection = {
                                id: Math.random().toString(36).substr(2, 9),
                                type: 'custom',
                                title: title.trim(),
                                enabled: true,
                                order: resume.sections.length,
                                content: {
                                    custom: {
                                        id: Math.random().toString(36).substr(2, 9),
                                        title: title.trim(),
                                        content: '',
                                    },
                                },
                            };
                            dispatch({ type: 'ADD_SECTION', payload: newSection });
                        }
                    }}
                    className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 group"
                >
                    <div className="p-1 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="font-medium">Add Custom Section</span>
                </button>
                
                <div className="h-4" /> {/* Bottom spacer */}
            </div>
        </div>
    );
};