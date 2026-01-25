import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Input, Select, Textarea } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";
import { WorkExperience, Resume } from "../../types/resume.types";
import {
    validateExperience,
    hasValidationErrors,
    checkATSCompliance,
    ExperienceValidationErrors
} from "../../utils/experienceValidation";

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
 * Experience Editor Component Props
 */
export interface ExperienceEditorProps {
    className?: string;
}

/**
 * Individual Experience Entry Props
 */
export interface ExperienceEntryProps {
    experience: WorkExperience;

    isEditing: boolean;
    onUpdate: (id: string, updates: Partial<WorkExperience>) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onToggleEdit: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}

/**
 * Bullet Point Manager Props
 */
export interface BulletPointManagerProps {
    bulletPoints: string[];
    onUpdate: (bulletPoints: string[]) => void;
    maxPoints?: number;
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
 * Generate year options (current year + 1 down to 1970)
 */
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= 1970; year--) {
        years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
};

const YEAR_OPTIONS = generateYearOptions();

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
                <h5 className="text-xs font-medium text-gray-700">Responsibilities & Achievements</h5>
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
                            placeholder="Describe your responsibility or achievement..."
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
                    No responsibilities added yet. Click "Add Point" to get started.
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
 * Individual Experience Entry Component
 */
const ExperienceEntry: React.FC<ExperienceEntryProps> = ({
    experience,

    isEditing,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleEdit,
    onMoveUp,
    onMoveDown,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ExperienceValidationErrors>({});

    // Local state for immediate UI updates
    const [localExperience, setLocalExperience] = useState(experience);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track date selections separately for better UX
    const [startMonth, setStartMonth] = useState<string | undefined>(undefined);
    const [startYear, setStartYear] = useState<string | undefined>(undefined);
    const [endMonth, setEndMonth] = useState<string | undefined>(undefined);
    const [endYear, setEndYear] = useState<string | undefined>(undefined);

    // Update local state when prop changes (e.g., when switching entries)
    useEffect(() => {
        setLocalExperience(experience);
        // Parse and set date selections
        const [sYear, sMonth] = experience.startDate ? experience.startDate.split("-") : [undefined, undefined];
        const [eYear, eMonth] = experience.endDate ? experience.endDate.split("-") : [undefined, undefined];
        setStartMonth(sMonth);
        setStartYear(sYear);
        setEndMonth(eMonth);
        setEndYear(eYear);
    }, [experience.id]); // Only update when switching to a different experience

    const handleFieldUpdate = (field: keyof WorkExperience, value: any) => {
        // Update local state immediately for instant UI feedback
        const updatedExperience = { ...localExperience, [field]: value };
        setLocalExperience(updatedExperience);

        // Validate the updated experience
        const errors = validateExperience(updatedExperience);
        setValidationErrors(errors);

        // Debounce the parent update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onUpdate(experience.id, { [field]: value });
        }, 300);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

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
            }
        }
    };

    const handleCurrentToggle = (current: boolean) => {
        // Update local state immediately
        const updated = { ...localExperience, current, endDate: current ? "" : localExperience.endDate };
        setLocalExperience(updated);

        // Debounce parent update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onUpdate(experience.id, { current, endDate: current ? "" : localExperience.endDate });
        }, 300);
    };

    // Use the separate state variables for display
    const startDate = { month: startMonth, year: startYear };
    const endDate = { month: endMonth, year: endYear };

    const handleDeleteConfirm = () => {
        onDelete(experience.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Entry Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {experience.jobTitle || "New Experience"}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {experience.company && `${experience.company}${experience.location ? ` • ${experience.location}` : ""}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Move buttons */}
                    <button
                        type="button"
                        onClick={() => onMoveUp(experience.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Move up"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveDown(experience.id)}
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
                        onClick={() => onToggleEdit(experience.id)}
                        className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDuplicate(experience.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Duplicate entry"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete entry"
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
                        const atsCheck = checkATSCompliance(experience);
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Experience</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete this work experience? This action cannot be undone.
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
                    <div className="grid grid-cols-1 gap-3">
                        <Input
                            label="Job Title"
                            value={localExperience.jobTitle}
                            onChange={(e) => handleFieldUpdate("jobTitle", e.target.value)}
                            error={validationErrors.jobTitle}
                            required
                            placeholder="e.g., Senior Software Engineer"
                            className="text-sm"
                        />
                        <Input
                            label="Company"
                            value={localExperience.company}
                            onChange={(e) => handleFieldUpdate("company", e.target.value)}
                            error={validationErrors.company}
                            required
                            placeholder="e.g., Tech Company Inc."
                            className="text-sm"
                        />
                    </div>

                    <Input
                        label="Location"
                        value={localExperience.location}
                        onChange={(e) => handleFieldUpdate("location", e.target.value)}
                        error={validationErrors.location}
                        placeholder="e.g., San Francisco, CA"
                        className="text-sm"
                    />

                    {/* Date Range */}
                    <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-700">Employment Period</h5>
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
                                required
                                className="text-sm"
                            />
                            <Select
                                label="Start Year"
                                options={YEAR_OPTIONS}
                                value={startDate.year}
                                onChange={(value) => handleDateUpdate("startDate", startDate.month, value)}
                                placeholder="Year"
                                required
                                className="text-sm"
                            />

                            {!localExperience.current && (
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
                                checked={localExperience.current}
                                onChange={(e) => handleCurrentToggle(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">I currently work here</span>
                        </label>
                    </div>

                    {/* Description */}
                    <Textarea
                        label="Job Description (Optional)"
                        value={localExperience.description}
                        onChange={(e) => handleFieldUpdate("description", e.target.value)}
                        error={validationErrors.description}
                        placeholder="Brief description of your role and responsibilities..."
                        rows={3}
                        maxLength={300}
                        showCharCount
                        className="text-sm"
                    />

                    {/* Bullet Points */}
                    <BulletPointManager
                        bulletPoints={localExperience.achievements || []}
                        onUpdate={(bulletPoints) => handleFieldUpdate("achievements", bulletPoints)}
                    />
                </div>
            )}

            {/* Summary View (when not editing) */}
            {!isEditing && (
                <div className="space-y-2 border-t border-gray-200 pt-3">
                    {experience.description && (
                        <p className="text-xs text-gray-600 leading-relaxed">{experience.description}</p>
                    )}

                    {(experience.achievements || []).length > 0 && (
                        <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-1.5">Key Achievements:</h5>
                            <ul className="space-y-1">
                                {(experience.achievements || []).slice(0, 3).map((achievement, index) => (
                                    <li key={index} className="text-xs text-gray-600 flex items-start">
                                        <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
                                        <span className="leading-relaxed">{achievement}</span>
                                    </li>
                                ))}
                                {(experience.achievements || []).length > 3 && (
                                    <li className="text-xs text-gray-500 italic ml-3">
                                        +{(experience.achievements || []).length - 3} more achievements
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        {experience.startDate && (
                            <>
                                {new Date(experience.startDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                {" - "}
                                {experience.current
                                    ? "Present"
                                    : experience.endDate
                                        ? new Date(experience.endDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
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
 * Work Experience Editor Component
 *
 * Provides comprehensive editing capabilities for work experience entries including:
 * - Add/remove/duplicate experience entries
 * - Reorder entries with move up/down buttons
 * - Comprehensive form fields with validation
 * - Bullet point management for achievements
 * - Collapsible entries for space efficiency
 * - Real-time auto-save integration
 */
export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
    className = "",
}) => {
    const { resume, dispatch } = useResumeContext();
    const { updateResume } = useResumeBackend();
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    // Find the experience section
    const experienceSection = (resume.sections || []).find(
        (section) => section.type === "experience"
    );

    const experiences = experienceSection?.content
        ? (experienceSection.content as { experiences: WorkExperience[] }).experiences
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
        (updatedExperiences: WorkExperience[]) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                if (experienceSection) {
                    dispatch({
                        type: "UPDATE_SECTION",
                        payload: {
                            id: experienceSection.id,
                            updates: {
                                content: { experiences: updatedExperiences },
                            },
                        },
                    });
                }
            }, 300);
        },
        [dispatch, experienceSection]
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
     * Helper to save experiences to backend
     */
    const saveToBackend = (updatedExperiences: WorkExperience[]) => {
        const contentToSave = mapResumeToContent(resume);
        contentToSave.experience = updatedExperiences;

        updateResume({
            content: contentToSave as any
        });
    };

    /**
     * Add new experience entry
     */
    const addExperience = () => {
        const newExperience: WorkExperience = {
            id: generateId(),
            jobTitle: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            achievements: [],
        };

        const updatedExperiences = [...experiences, newExperience];
        debouncedUpdate(updatedExperiences);
        saveToBackend(updatedExperiences);
        setEditingEntryId(newExperience.id);
    };

    /**
     * Update experience entry
     */
    const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
        const updatedExperiences = experiences.map((exp) =>
            exp.id === id ? { ...exp, ...updates } : exp
        );
        debouncedUpdate(updatedExperiences);
        
        // Debounce backend save to avoid too many requests while typing
        setTimeout(() => {
            saveToBackend(updatedExperiences);
        }, 1000);
        
        // Store timer on component instance to clear if needed? 
        // Actually, for typing inputs, maybe we should rely on the blur or a longer debounce.
        // But since we don't have a ref for backend save timer easily accessible here without more state,
        // let's trust the useResumeBackend might handle some debouncing or just let it save.
        // Better: let's save immediately for critical actions (add/delete) but debounce for typing.
        // Since updateExperience is called often, we should probably debounce the saveToBackend call.
        // However, for simplicity and ensuring data safety, let's call it. 
        // If performance issues arise, we can add a specific backend debounce.
        // Given existing pattern in SkillsEditor, it saves on every updateCategory call which is triggered on change.
        // Wait, SkillsEditor debounces local dispatch but also calls saveToBackend immediately in some cases, 
        // but for text inputs it might be heavy.
        // Let's look at `handleFieldUpdate` in ExperienceEntry. It debounces the `onUpdate` call by 300ms.
        // So `updateExperience` is already debounced by the child component. 
        // So calling `saveToBackend` here is effectively debounced by 300ms from the user's typing.
        // That is acceptable.
        saveToBackend(updatedExperiences);
    };

    /**
     * Delete experience entry
     */
    const deleteExperience = (id: string) => {
        const updatedExperiences = experiences.filter((exp) => exp.id !== id);
        debouncedUpdate(updatedExperiences);
        saveToBackend(updatedExperiences);
        if (editingEntryId === id) {
            setEditingEntryId(null);
        }
    };

    /**
     * Duplicate experience entry
     */
    const duplicateExperience = (id: string) => {
        const experienceToDuplicate = experiences.find((exp) => exp.id === id);
        if (experienceToDuplicate) {
            const duplicatedExperience: WorkExperience = {
                ...experienceToDuplicate,
                id: generateId(),
                jobTitle: `${experienceToDuplicate.jobTitle} (Copy)`,
            };
            const updatedExperiences = [...experiences, duplicatedExperience];
            debouncedUpdate(updatedExperiences);
            saveToBackend(updatedExperiences);
            setEditingEntryId(duplicatedExperience.id);
        }
    };

    /**
     * Toggle edit mode for entry
     */
    const toggleEditEntry = (id: string) => {
        // If we are saving (closing edit), ensure we save
        if (editingEntryId === id) {
             saveToBackend(experiences);
        }
        setEditingEntryId(editingEntryId === id ? null : id);
    };

    /**
     * Move experience entry up
     */
    const moveExperienceUp = (id: string) => {
        const currentIndex = experiences.findIndex((exp) => exp.id === id);
        if (currentIndex > 0) {
            const updatedExperiences = [...experiences];
            [updatedExperiences[currentIndex - 1], updatedExperiences[currentIndex]] =
                [updatedExperiences[currentIndex], updatedExperiences[currentIndex - 1]];
            debouncedUpdate(updatedExperiences);
            saveToBackend(updatedExperiences);
        }
    };

    /**
     * Move experience entry down
     */
    const moveExperienceDown = (id: string) => {
        const currentIndex = experiences.findIndex((exp) => exp.id === id);
        if (currentIndex < experiences.length - 1) {
            const updatedExperiences = [...experiences];
            [updatedExperiences[currentIndex], updatedExperiences[currentIndex + 1]] =
                [updatedExperiences[currentIndex + 1], updatedExperiences[currentIndex]];
            debouncedUpdate(updatedExperiences);
            saveToBackend(updatedExperiences);
        }
    };
    // Don't render if no experience section exists
    if (!experienceSection) {
        return null;
    }

    return (
        <div className={className}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {experiences.length} {experiences.length === 1 ? "entry" : "entries"}
                    </p>
                    <button
                        onClick={addExperience}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        data-tutorial="work-experience"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Experience
                    </button>
                </div>

                {/* Experience Entries */}
                {experiences.length === 0 ? (
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
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                            />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">No work experience added</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Add your work experience to showcase your professional background.
                        </p>
                        <button
                            onClick={addExperience}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Experience
                        </button>
                    </div>
                ) : (
                    experiences.map((experience) => (
                        <ExperienceEntry
                            key={experience.id}
                            experience={experience}
                            isEditing={editingEntryId === experience.id}
                            onUpdate={updateExperience}
                            onDelete={deleteExperience}
                            onDuplicate={duplicateExperience}
                            onToggleEdit={toggleEditEntry}
                            onMoveUp={moveExperienceUp}
                            onMoveDown={moveExperienceDown}
                        />
                    ))
                )}
            </div>
        </div >
    );
};

export default ExperienceEditor;