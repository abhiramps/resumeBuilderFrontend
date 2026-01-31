import React from 'react';
import { ResumeSection } from '../../types/resume.types';
import { SectionIcon } from './SectionIcon';

interface SidebarIconNavProps {
    sections: ResumeSection[];
    activeSectionId?: string;
    onSectionClick: (sectionId: string) => void;
    onExpand: () => void;
}

export const SidebarIconNav: React.FC<SidebarIconNavProps> = ({
    sections,
    activeSectionId,
    // onSectionClick,
    onExpand
}) => {
    return (
        <div className="flex flex-col items-center gap-4 py-4 w-full h-full bg-white border-r border-gray-200">
             {/* ATS Score Placeholder/Icon */}
             <button
                onClick={onExpand}
                className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors tooltip-container relative group"
                title="ATS Score"
            >
               <SectionIcon type="ats-score" />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity">
                    ATS Score
                </div>
            </button>

             {/* Personal Info Icon */}
             <button
                onClick={onExpand}
                className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors tooltip-container relative group"
                title="Personal Info"
            >
               <SectionIcon type="personal-info" />
               <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity">
                    Personal Info
                </div>
            </button>

            <div className="w-8 h-px bg-gray-200 my-1" />

            {sections.map(section => (
                <button
                    key={section.id}
                    onClick={() => {
                        onExpand(); // Expand first
                        // Optional: Scroll to section logic could go here
                    }}
                    className={`p-3 rounded-xl transition-colors relative group ${
                        activeSectionId === section.id 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <SectionIcon type={section.type} />
                    {!section.enabled && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-gray-300 rounded-full border border-white" />
                    )}
                     <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity">
                        {section.title}
                    </div>
                </button>
            ))}

            <div className="flex-1" />
            
             <button
                onClick={onExpand}
                className="p-3 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors mt-auto"
                title="Expand Sidebar"
            >
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            </button>
        </div>
    );
};
