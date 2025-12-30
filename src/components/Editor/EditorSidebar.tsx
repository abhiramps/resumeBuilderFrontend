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
import { CustomSectionEditor } from './CustomSectionEditor';
import { ResumeSection } from '../../types/resume.types';

export const EditorSidebar: React.FC = () => {
    const { resume, dispatch, atsValidation } = useResumeContext();
    const [isPersonalInfoCollapsed, setIsPersonalInfoCollapsed] = React.useState(true);

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
            case 'custom':
                return <CustomSectionEditor section={section} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-50 p-3 sm:p-4 space-y-4 sm:space-y-6">
            {/* ATS Score Panel - Always visible at top */}
            <ATSScorePanel validation={atsValidation} />

            {/* Personal Information - Not draggable, always at top */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm" data-tutorial="personal-info">
                <button
                    onClick={() => setIsPersonalInfoCollapsed(!isPersonalInfoCollapsed)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Personal Information</h3>
                    {isPersonalInfoCollapsed ? (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    )}
                </button>
                {!isPersonalInfoCollapsed && (
                    <div className="p-3 sm:p-4">
                        <PersonalInfoEditor />
                    </div>
                )}
            </div>

            {/* Sortable Sections */}
            <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 px-1">
                    Resume Sections
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
                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Custom Section</span>
                <span className="sm:hidden">Add Section</span>
            </button>
        </div>
    );
};
