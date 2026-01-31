import React, { useState } from "react";
import { Button } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { ResumeSection, SectionType } from "../../types/resume.types";

export interface SectionManagerProps {
    className?: string;
}

interface DragState {
    draggedIndex: number | null;
    dragOverIndex: number | null;
}

export const SectionManager: React.FC<SectionManagerProps> = ({ className = "" }) => {
    const { resume, dispatch } = useResumeContext();
    const [dragState, setDragState] = useState<DragState>({ draggedIndex: null, dragOverIndex: null });
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [customSectionTitle, setCustomSectionTitle] = useState("");

    const sections = [...(resume.sections || [])].sort((a, b) => a.order - b.order);

    const handleToggleSection = (sectionId: string) => {
        dispatch({ type: "TOGGLE_SECTION", payload: sectionId });
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDragState({ draggedIndex: index, dragOverIndex: null });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
            setDragState(prev => ({ ...prev, dragOverIndex: index }));
        }
    };

    const handleDragLeave = () => {
        setDragState(prev => ({ ...prev, dragOverIndex: null }));
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const { draggedIndex } = dragState;

        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            const reorderedSections = [...sections];
            const [draggedSection] = reorderedSections.splice(draggedIndex, 1);
            reorderedSections.splice(dropIndex, 0, draggedSection);

            const sectionIds = reorderedSections.map(s => s.id);
            dispatch({ type: "REORDER_SECTIONS", payload: sectionIds });
        }

        setDragState({ draggedIndex: null, dragOverIndex: null });
    };

    const handleDragEnd = () => {
        setDragState({ draggedIndex: null, dragOverIndex: null });
    };

    const handleAddCustomSection = () => {
        if (!customSectionTitle.trim()) return;

        const newSection: ResumeSection = {
            id: Math.random().toString(36).substr(2, 9),
            type: "custom",
            title: customSectionTitle,
            enabled: true,
            order: sections.length,
            content: {
                custom: {
                    id: Math.random().toString(36).substr(2, 9),
                    title: customSectionTitle,
                    content: "",
                },
            },
        };

        dispatch({ type: "ADD_SECTION", payload: newSection });
        setCustomSectionTitle("");
        setShowAddCustom(false);
    };

    const handleDeleteSection = (sectionId: string) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            dispatch({ type: "DELETE_SECTION", payload: sectionId });
        }
    };

    const getSectionIcon = (type: SectionType) => {
        switch (type) {
            case "summary":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                );
            case "experience":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                    </svg>
                );
            case "projects":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                );
            case "skills":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case "education":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                );
            case "certifications":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                );
            case "additional-info":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case "custom":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Manage Sections
                </h3>
                <p className="text-[10px] text-gray-500 italic">
                    Toggle visibility and reorder sections
                </p>
            </div>

            <div className="p-4 space-y-2">
                {sections.map((section, index) => {
                    const isDragging = dragState.draggedIndex === index;
                    const isDragOver = dragState.dragOverIndex === index;

                    return (
                        <div
                            key={section.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                                flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 cursor-move
                                ${isDragging ? "opacity-50 scale-95" : ""}
                                ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-200"}
                                ${section.enabled ? "bg-white shadow-sm" : "bg-gray-50"}
                                hover:shadow-md
                            `}
                        >
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                </div>

                                <div className={`p-2 rounded-lg ${section.enabled ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}>
                                    {getSectionIcon(section.type)}
                                </div>

                                <div className="flex-1">
                                    <h4 className={`text-sm font-medium ${section.enabled ? "text-gray-900" : "text-gray-500"}`}>
                                        {section.title}
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Order: {index + 1}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleToggleSection(section.id)}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                        ${section.enabled ? "bg-blue-600" : "bg-gray-300"}
                                    `}
                                    title={section.enabled ? "Hide section" : "Show section"}
                                >
                                    <span
                                        className={`
                                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                            ${section.enabled ? "translate-x-6" : "translate-x-1"}
                                        `}
                                    />
                                </button>

                                {section.type === "custom" && (
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                                        title="Delete custom section"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-200">
                {!showAddCustom ? (
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddCustom(true)}
                        className="w-full"
                        leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        }
                    >
                        Add Custom Section
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={customSectionTitle}
                            onChange={(e) => setCustomSectionTitle(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddCustomSection()}
                            placeholder="Enter section title..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                        <div className="flex space-x-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleAddCustomSection}
                                disabled={!customSectionTitle.trim()}
                                className="flex-1"
                            >
                                Add Section
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setShowAddCustom(false);
                                    setCustomSectionTitle("");
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-start space-x-2 text-xs text-gray-600">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-medium mb-1">Tips:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Drag sections to reorder them</li>
                            <li>Toggle switches to show/hide sections</li>
                            <li>Changes update the preview instantly</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
