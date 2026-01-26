import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Input, Select, Textarea } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";
import { Project, Resume } from "../../types/resume.types";
import {
    validateProject,
    hasValidationErrors,
    checkATSCompliance,
    ProjectValidationErrors,
    TECH_STACK_SUGGESTIONS,
    filterTechStackSuggestions
} from "../../utils/projectValidation";

// Helper to convert frontend Resume state to backend ResumeContent
const mapResumeToContent = (resume: Resume): any => {
    const content: any = {
        personalInfo: resume.personalInfo,
        sectionOrder: resume.sections.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            enabled: s.enabled,
            order: s.order
        }))
    };

    resume.sections.forEach(section => {
        // Map content regardless of enabled status to ensure data persistence
        const sectionContent = section.content as any;
        switch (section.type) {
            case 'summary':
                content.summary = sectionContent.summary;
                break;
            case 'experience':
                content.experience = sectionContent.experiences;
                break;
            case 'education':
                content.education = sectionContent.education;
                break;
            case 'skills':
                content.skills = sectionContent.skills;
                break;
            case 'projects':
                content.projects = sectionContent.projects;
                break;
            case 'certifications':
                content.certifications = sectionContent.certifications;
                break;
            case 'custom':
                if (!content.customSections) content.customSections = [];
                content.customSections.push({
                    id: sectionContent.custom.id,
                    title: sectionContent.custom.title,
                    content: sectionContent.custom.content,
                    order: section.order
                });
                break;
        }
    });
    return content;
};

/**
 * Projects Editor Component Props
 */
export interface ProjectsEditorProps {
    className?: string;
}

/**
 * Individual Project Entry Props
 */
export interface ProjectEntryProps {
    project: Project;
    isEditing: boolean;
    onUpdate: (id: string, updates: Partial<Project>) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onToggleEdit: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}

/**
 * Tech Stack Manager Props
 */
export interface TechStackManagerProps {
    techStack: string[];
    onUpdate: (techStack: string[]) => void;
    maxTags?: number;
}

/**
 * Generate month options for date selects
 */
const MONTH_OPTIONS = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

/**
 * Generate year options (current year + 1 down to 2000)
 */
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= 2000; year--) {
        years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
};

const YEAR_OPTIONS = generateYearOptions();

/**
 * Tech Stack Manager Component
 */
const TechStackManager: React.FC<TechStackManagerProps> = ({
    techStack,
    onUpdate,
    maxTags = 15,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (value.trim()) {
            const filtered = filterTechStackSuggestions(value, techStack);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const addTech = (tech: string) => {
        const trimmedTech = tech.trim();
        if (trimmedTech && !techStack.some(existing => existing.toLowerCase() === trimmedTech.toLowerCase())) {
            onUpdate([...techStack, trimmedTech]);
        }
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const removeTech = (index: number) => {
        const updated = techStack.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (inputValue.trim()) {
                addTech(inputValue);
            }
        } else if (e.key === "Backspace" && !inputValue && techStack.length > 0) {
            removeTech(techStack.length - 1);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-medium text-gray-700">Tech Stack</h5>
                <span className="text-xs text-gray-500">
                    {techStack.length}/{maxTags} technologies
                </span>
            </div>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-md min-h-[36px] bg-white">
                {techStack.map((tech, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                    >
                        {tech}
                        <button
                            type="button"
                            onClick={() => removeTech(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                            ×
                        </button>
                    </span>
                ))}

                {techStack.length < maxTags && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (inputValue.trim()) {
                                const filtered = filterTechStackSuggestions(inputValue, techStack);
                                setSuggestions(filtered);
                                setShowSuggestions(filtered.length > 0);
                            }
                        }}
                        onBlur={() => {
                            // Delay hiding suggestions to allow clicking
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder={techStack.length === 0 ? "Add technologies (e.g., React, Node.js)" : "Add more..."}
                        className="flex-1 min-w-[100px] outline-none bg-transparent text-xs"
                    />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="relative">
                    <div className="absolute top-0 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => addTech(suggestion)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tech Stack Categories for Reference */}
            <div className="text-xs text-gray-500">
                <details className="cursor-pointer">
                    <summary className="hover:text-gray-700">Browse by category</summary>
                    <div className="mt-2 space-y-2">
                        {Object.entries(TECH_STACK_SUGGESTIONS).map(([category, techs]) => (
                            <div key={category}>
                                <span className="font-medium capitalize">{category}:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {techs.slice(0, 8).map((tech) => (
                                        <button
                                            key={tech}
                                            type="button"
                                            onClick={() => addTech(tech)}
                                            disabled={techStack.includes(tech) || techStack.length >= maxTags}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {tech}
                                        </button>
                                    ))}
                                    {techs.length > 8 && (
                                        <span className="text-gray-400 text-xs">+{techs.length - 8} more</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>

            {techStack.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-1.5">
                    No technologies added yet. Start typing to add technologies.
                </p>
            )}

            {techStack.length >= maxTags && (
                <p className="text-xs text-orange-600">
                    Maximum {maxTags} technologies reached. Remove some to add more.
                </p>
            )}
        </div>
    );
};

/**
 * Bullet Point Manager Props
 */
export interface BulletPointManagerProps {
    bulletPoints: string[];
    onUpdate: (bulletPoints: string[]) => void;
    maxPoints?: number;
}

/**
 * Bullet Point Manager Component
 */
const BulletPointManager: React.FC<BulletPointManagerProps> = ({
    bulletPoints,
    onUpdate,
    maxPoints = 10,
}) => {
    const addBulletPoint = () => {
        if (bulletPoints.length < maxPoints) {
            onUpdate([...bulletPoints, ""]);
        }
    };

    const updateBulletPoint = (index: number, value: string) => {
        const updated = [...bulletPoints];
        updated[index] = value;
        onUpdate(updated);
    };

    const removeBulletPoint = (index: number) => {
        const updated = bulletPoints.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    const moveBulletPoint = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === bulletPoints.length - 1)
        ) {
            return;
        }

        const updated = [...bulletPoints];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
        onUpdate(updated);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-medium text-gray-700">Key Achievements</h5>
                <button
                    type="button"
                    onClick={addBulletPoint}
                    disabled={bulletPoints.length >= maxPoints}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Point
                </button>
            </div>

            {bulletPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-1.5">
                    <div className="flex flex-col gap-0.5 mt-2">
                        <button
                            type="button"
                            onClick={() => moveBulletPoint(index, "up")}
                            disabled={index === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => moveBulletPoint(index, "down")}
                            disabled={index === bulletPoints.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1">
                        <Textarea
                            value={point}
                            onChange={(e) => updateBulletPoint(index, e.target.value)}
                            placeholder="Describe a key achievement or responsibility..."
                            rows={2}
                            maxLength={200}
                            showCharCount
                            className="text-xs"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => removeBulletPoint(index)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded mt-1"
                        title="Remove bullet point"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ))}

            {bulletPoints.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-xs border-2 border-dashed border-gray-200 rounded-lg">
                    No achievements added yet. Click "Add Point" to add bullet points.
                </div>
            )}

            {bulletPoints.length >= maxPoints && (
                <p className="text-xs text-gray-500">
                    Maximum {maxPoints} bullet points reached.
                </p>
            )}
        </div>
    );
};

/**
 * Individual Project Entry Component
 */
const ProjectEntry: React.FC<ProjectEntryProps> = ({
    project,
    isEditing,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleEdit,
    onMoveUp,
    onMoveDown,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ProjectValidationErrors>({});

    // Local state for immediate UI updates
    const [localProject, setLocalProject] = useState(project);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track date selections separately for better UX
    const [startMonth, setStartMonth] = useState<string | undefined>(undefined);
    const [startYear, setStartYear] = useState<string | undefined>(undefined);
    const [endMonth, setEndMonth] = useState<string | undefined>(undefined);
    const [endYear, setEndYear] = useState<string | undefined>(undefined);

    // Update local state when prop changes (e.g., when switching entries)
    useEffect(() => {
        setLocalProject(project);
        // Parse and set date selections
        const [sYear, sMonth] = project.startDate ? project.startDate.split("-") : [undefined, undefined];
        const [eYear, eMonth] = project.endDate ? project.endDate.split("-") : [undefined, undefined];
        setStartMonth(sMonth);
        setStartYear(sYear);
        setEndMonth(eMonth);
        setEndYear(eYear);
    }, [project.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleFieldUpdate = (field: keyof Project, value: any) => {
        // Update local state immediately for instant UI feedback
        const updatedProject = { ...localProject, [field]: value };
        setLocalProject(updatedProject);

        // Validate the updated project
        const errors = validateProject(updatedProject);
        setValidationErrors(errors);

        // Debounce the parent update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onUpdate(project.id, { [field]: value });
        }, 300);
    };

    const handleDateUpdate = (field: "startDate" | "endDate", month: string | undefined, year: string | undefined) => {
        // Update the appropriate state variables
        if (field === "startDate") {
            if (month !== undefined) setStartMonth(month);
            if (year !== undefined) setStartYear(year);

            // Use the new values or keep existing ones
            const finalMonth = month !== undefined ? month : startMonth;
            const finalYear = year !== undefined ? year : startYear;

            // Update if we have both parts
            if (finalMonth && finalYear) {
                const dateValue = `${finalYear}-${finalMonth}`;
                handleFieldUpdate(field, dateValue);
            } else if (!finalMonth && !finalYear) {
                handleFieldUpdate(field, "");
            }
        } else {
            if (month !== undefined) setEndMonth(month);
            if (year !== undefined) setEndYear(year);

            // Use the new values or keep existing ones
            const finalMonth = month !== undefined ? month : endMonth;
            const finalYear = year !== undefined ? year : endYear;

            // Update if we have both parts
            if (finalMonth && finalYear) {
                const dateValue = `${finalYear}-${finalMonth}`;
                handleFieldUpdate(field, dateValue);
            } else if (!finalMonth && !finalYear) {
                handleFieldUpdate(field, "");
            }
        }
    };

    const handleCurrentToggle = (current: boolean) => {
        // Update local state immediately
        const updated = { ...localProject, current, endDate: current ? "" : localProject.endDate };
        setLocalProject(updated);

        // Debounce parent update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onUpdate(project.id, { current, endDate: current ? "" : localProject.endDate });
        }, 300);
    };

    // Use the separate state variables for display
    const startDate = { month: startMonth, year: startYear };
    const endDate = { month: endMonth, year: endYear };

    const handleDeleteConfirm = () => {
        onDelete(project.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Entry Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {project.name || "New Project"}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {(project.techStack || []).length > 0 && (
                                <>
                                    {(project.techStack || []).slice(0, 3).join(", ")}
                                    {(project.techStack || []).length > 3 && ` +${(project.techStack || []).length - 3} more`}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Move buttons */}
                    <button
                        type="button"
                        onClick={() => onMoveUp(project.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Move up"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveDown(project.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Move down"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Action buttons */}
                    <button
                        type="button"
                        onClick={() => onToggleEdit(project.id)}
                        className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDuplicate(project.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Duplicate project"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete project"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Validation and ATS Status */}
            {isEditing && (
                <div className="flex flex-wrap gap-1.5">
                    {hasValidationErrors(validationErrors) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠ Validation Issues
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Valid
                        </span>
                    )}
                    {(() => {
                        const atsCheck = checkATSCompliance(project);
                        return atsCheck.isCompliant ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ✓ ATS-Friendly
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                ⚠ ATS Issues
                            </span>
                        );
                    })()}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entry Form */}
            {isEditing && (
                <div className="space-y-3 border-t border-gray-200 pt-3">
                    {/* Basic Information */}
                    <div className="space-y-3">
                        <Input
                            label="Project Name"
                            value={localProject.name}
                            onChange={(e) => handleFieldUpdate("name", e.target.value)}
                            error={validationErrors.name}
                            required
                            placeholder="e.g., E-commerce Platform"
                            className="text-sm"
                        />

                        <Textarea
                            label="Project Description"
                            value={localProject.description}
                            onChange={(e) => handleFieldUpdate("description", e.target.value)}
                            error={validationErrors.description}
                            placeholder="Brief description of your project and its key features..."
                            rows={3}
                            maxLength={300}
                            showCharCount
                            className="text-sm"
                        />
                    </div>

                    {/* Tech Stack */}
                    <TechStackManager
                        techStack={localProject.techStack || []}
                        onUpdate={(techStack) => handleFieldUpdate("techStack", techStack)}
                    />
                    {validationErrors.techStack && (
                        <p className="text-xs text-red-600">{validationErrors.techStack}</p>
                    )}

                    {/* Achievements */}
                    <BulletPointManager
                        bulletPoints={localProject.achievements || []}
                        onUpdate={(achievements) => handleFieldUpdate("achievements", achievements)}
                    />

                    {/* Project Links */}
                    <div className="grid grid-cols-1 gap-3">
                        <Input
                            label="Project URL (Optional)"
                            type="url"
                            value={localProject.url || ""}
                            onChange={(e) => handleFieldUpdate("url", e.target.value)}
                            error={validationErrors.url}
                            placeholder="https://your-project.com"
                            helperText="Link to live demo"
                            className="text-sm"
                        />
                        <Input
                            label="GitHub Repository (Optional)"
                            type="url"
                            value={localProject.githubUrl || ""}
                            onChange={(e) => handleFieldUpdate("githubUrl", e.target.value)}
                            error={validationErrors.githubUrl}
                            placeholder="https://github.com/..."
                            helperText="Link to repository"
                            className="text-sm"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-700">Project Timeline (Optional)</h5>
                        {validationErrors.dateRange && (
                            <p className="text-xs text-red-600">{validationErrors.dateRange}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Select
                                label="Start Month"
                                options={MONTH_OPTIONS}
                                value={startDate.month}
                                onChange={(value) => handleDateUpdate("startDate", value, startDate.year)}
                                placeholder="Month"
                                className="text-sm"
                            />
                            <Select
                                label="Start Year"
                                options={YEAR_OPTIONS}
                                value={startDate.year}
                                onChange={(value) => handleDateUpdate("startDate", startDate.month, value)}
                                placeholder="Year"
                                className="text-sm"
                            />

                            {!localProject.current && (
                                <>
                                    <Select
                                        label="End Month"
                                        options={MONTH_OPTIONS}
                                        value={endDate.month}
                                        onChange={(value) => handleDateUpdate("endDate", value, endDate.year)}
                                        placeholder="Month"
                                        className="text-sm"
                                    />
                                    <Select
                                        label="End Year"
                                        options={YEAR_OPTIONS}
                                        value={endDate.year}
                                        onChange={(value) => handleDateUpdate("endDate", endDate.month, value)}
                                        placeholder="Year"
                                        className="text-sm"
                                    />
                                </>
                            )}
                        </div>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={localProject.current}
                                onChange={(e) => handleCurrentToggle(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">This is an ongoing project</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Summary View (when not editing) */}
            {!isEditing && (
                <div className="space-y-2 border-t border-gray-200 pt-3">
                    {project.description && (
                        <p className="text-xs text-gray-600 leading-relaxed">{project.description}</p>
                    )}

                    {(project.achievements || []).length > 0 && (
                        <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-1.5">Key Achievements:</h5>
                            <ul className="space-y-1">
                                {(project.achievements || []).slice(0, 3).map((achievement, index) => (
                                    <li key={index} className="text-xs text-gray-600 flex items-start">
                                        <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
                                        <span className="leading-relaxed">{achievement}</span>
                                    </li>
                                ))}
                                {(project.achievements || []).length > 3 && (
                                    <li className="text-xs text-gray-500 italic ml-3">
                                        +{(project.achievements || []).length - 3} more achievements
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {(project.techStack || []).length > 0 && (
                        <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-1.5">Technologies:</h5>
                            <div className="flex flex-wrap gap-1">
                                {(project.techStack || []).map((tech, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {(project.url || project.githubUrl) && (
                        <div className="flex gap-3 text-xs">
                            {project.url && (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Live Demo
                                </a>
                            )}
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 flex items-center"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    GitHub
                                </a>
                            )}
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        {project.startDate && (
                            <>
                                {new Date(project.startDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                {" - "}
                                {project.current
                                    ? "Present"
                                    : project.endDate
                                        ? new Date(project.endDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                        : "Present"
                                }
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Projects Section Editor Component
 *
 * Provides comprehensive editing capabilities for project entries including:
 * - Add/remove/duplicate project entries
 * - Reorder projects with move up/down buttons
 * - Comprehensive form fields with validation
 * - Tech stack management with suggestions
 * - URL validation for project and GitHub links
 * - Collapsible entries for space efficiency
 * - Real-time auto-save integration
 */
export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
    className = "",
}) => {
    const { resume, dispatch } = useResumeContext();
    const { updateResume } = useResumeBackend();
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    // Find the projects section
    const projectsSection = (resume.sections || []).find(
        (section) => section.type === "projects"
    );

    const projects = projectsSection?.content
        ? (projectsSection.content as { projects: Project[] }).projects
        : [];

    /**
     * Generate unique ID for new entries
     */
    const generateId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    // Ref to store the debounce timer
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Debounced update function
     */
    const debouncedUpdate = useCallback(
        (updatedProjects: Project[]) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                if (projectsSection) {
                    dispatch({
                        type: "UPDATE_SECTION",
                        payload: {
                            id: projectsSection.id,
                            updates: {
                                content: { projects: updatedProjects },
                            },
                        },
                    });
                }
            }, 300);
        },
        [dispatch, projectsSection]
    );

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    /**
     * Helper to save projects to backend
     */
    const saveToBackend = (updatedProjects: Project[]) => {
        const contentToSave = mapResumeToContent(resume);
        contentToSave.projects = updatedProjects;

        updateResume({
            content: contentToSave as any
        });
    };

    /**
     * Add new project entry
     */
    const addProject = () => {
        const newProject: Project = {
            id: generateId(),
            name: "",
            description: "",
            techStack: [],
            startDate: "",
            endDate: "",
            current: false,
            url: "",
            githubUrl: "",
        };

        const updatedProjects = [...projects, newProject];
        debouncedUpdate(updatedProjects);
        saveToBackend(updatedProjects);
        setEditingProjectId(newProject.id);
    };

    /**
     * Update project entry
     */
    const updateProject = (id: string, updates: Partial<Project>) => {
        const updatedProjects = projects.map((proj) =>
            proj.id === id ? { ...proj, ...updates } : proj
        );
        debouncedUpdate(updatedProjects);
        saveToBackend(updatedProjects);
    };

    /**
     * Delete project entry
     */
    const deleteProject = (id: string) => {
        const updatedProjects = projects.filter((proj) => proj.id !== id);
        debouncedUpdate(updatedProjects);
        saveToBackend(updatedProjects);
        if (editingProjectId === id) {
            setEditingProjectId(null);
        }
    };

    /**
     * Duplicate project entry
     */
    const duplicateProject = (id: string) => {
        const projectToDuplicate = projects.find((proj) => proj.id === id);
        if (projectToDuplicate) {
            const duplicatedProject: Project = {
                ...projectToDuplicate,
                id: generateId(),
                name: `${projectToDuplicate.name} (Copy)`,
            };
            const updatedProjects = [...projects, duplicatedProject];
            debouncedUpdate(updatedProjects);
            saveToBackend(updatedProjects);
            setEditingProjectId(duplicatedProject.id);
        }
    };

    /**
     * Toggle edit mode for project
     */
    const toggleEditProject = (id: string) => {
        if (editingProjectId === id) {
            saveToBackend(projects);
        }
        setEditingProjectId(editingProjectId === id ? null : id);
    };

    /**
     * Move project up
     */
    const moveProjectUp = (id: string) => {
        const currentIndex = projects.findIndex((proj) => proj.id === id);
        if (currentIndex > 0) {
            const updatedProjects = [...projects];
            [updatedProjects[currentIndex - 1], updatedProjects[currentIndex]] =
                [updatedProjects[currentIndex], updatedProjects[currentIndex - 1]];
            debouncedUpdate(updatedProjects);
            saveToBackend(updatedProjects);
        }
    };

    /**
     * Move project down
     */
    const moveProjectDown = (id: string) => {
        const currentIndex = projects.findIndex((proj) => proj.id === id);
        if (currentIndex < projects.length - 1) {
            const updatedProjects = [...projects];
            [updatedProjects[currentIndex], updatedProjects[currentIndex + 1]] =
                [updatedProjects[currentIndex + 1], updatedProjects[currentIndex]];
            debouncedUpdate(updatedProjects);
            saveToBackend(updatedProjects);
        }
    };



    // Don't render if no projects section exists
    if (!projectsSection) {
        return null;
    }

    return (
        <div className={className}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {projects.length} {projects.length === 1 ? "project" : "projects"}
                    </p>
                    <button
                        onClick={addProject}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Project
                    </button>
                </div>

                {/* Project Entries */}
                {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg
                            className="w-10 h-10 mx-auto mb-3 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">No projects added</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Add your projects to showcase your technical skills and experience.
                        </p>
                        <button
                            onClick={addProject}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Project
                        </button>
                    </div>
                ) : (
                    projects.map((project) => (
                        <ProjectEntry
                            key={project.id}
                            project={project}
                            isEditing={editingProjectId === project.id}
                            onUpdate={updateProject}
                            onDelete={deleteProject}
                            onDuplicate={duplicateProject}
                            onToggleEdit={toggleEditProject}
                            onMoveUp={moveProjectUp}
                            onMoveDown={moveProjectDown}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsEditor;