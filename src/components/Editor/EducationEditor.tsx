import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Input, Select } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";
import { Education, Resume } from "../../types/resume.types";

/**
 * Education Editor Component Props
 */
export interface EducationEditorProps {
    className?: string;
}

/**
 * Individual Education Entry Props
 */
export interface EducationEntryProps {
    education: Education;
    isEditing: boolean;
    onUpdate: (id: string, updates: Partial<Education>) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onToggleEdit: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}

/**
 * Coursework Manager Props
 */
export interface CourseworkManagerProps {
    coursework: string[];
    onUpdate: (coursework: string[]) => void;
    maxCourses?: number;
}

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
 * Coursework Manager Props
 */
export interface CourseworkManagerProps {
    coursework: string[];
    onUpdate: (coursework: string[]) => void;
    maxCourses?: number;
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
 * Generate year options (current year + 10 down to 1970)
 */
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 10; year >= 1970; year--) {
        years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
};

const YEAR_OPTIONS = generateYearOptions();

/**
 * Common degree suggestions
 */
const DEGREE_SUGGESTIONS = [
    "Bachelor of Science in Computer Science",
    "Bachelor of Engineering in Software Engineering",
    "Master of Science in Computer Science",
    "Master of Business Administration (MBA)",
    "Bachelor of Arts in Computer Science",
    "Associate Degree in Computer Science",
    "Ph.D. in Computer Science",
];

/**
 * Coursework Manager Component
 */
const CourseworkManager: React.FC<CourseworkManagerProps> = ({
    coursework,
    onUpdate,
    maxCourses = 10,
}) => {
    const [inputValue, setInputValue] = useState("");

    const addCourse = () => {
        if (inputValue.trim() && coursework.length < maxCourses) {
            onUpdate([...coursework, inputValue.trim()]);
            setInputValue("");
        }
    };

    const removeCourse = (index: number) => {
        const updated = coursework.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addCourse();
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-medium text-gray-700">Relevant Coursework (Optional)</h5>
                <span className="text-xs text-gray-500">
                    {coursework.length}/{maxCourses}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter course name and press Enter..."
                    disabled={coursework.length >= maxCourses}
                    className="flex-1 text-sm"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addCourse}
                    disabled={!inputValue.trim() || coursework.length >= maxCourses}
                >
                    Add
                </Button>
            </div>

            {coursework.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {coursework.map((course, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                        >
                            {course}
                            <button
                                type="button"
                                onClick={() => removeCourse(index)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {coursework.length >= maxCourses && (
                <p className="text-xs text-orange-600">
                    Maximum {maxCourses} courses reached.
                </p>
            )}
        </div>
    );
};

/**
 * Individual Education Entry Component
 */
const EducationEntry: React.FC<EducationEntryProps> = ({
    education,
    isEditing,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleEdit,
    onMoveUp,
    onMoveDown,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Local state for immediate UI updates
    const [localEducation, setLocalEducation] = useState(education);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track date selections separately for better UX
    const [startMonth, setStartMonth] = useState<string | undefined>(undefined);
    const [startYear, setStartYear] = useState<string | undefined>(undefined);
    const [endMonth, setEndMonth] = useState<string | undefined>(undefined);
    const [endYear, setEndYear] = useState<string | undefined>(undefined);

    // Update local state when prop changes (e.g., when switching entries)
    useEffect(() => {
        setLocalEducation(education);
        // Parse and set date selections
        const [sYear, sMonth] = education.startDate ? education.startDate.split("-") : [undefined, undefined];
        const [eYear, eMonth] = education.endDate ? education.endDate.split("-") : [undefined, undefined];
        setStartMonth(sMonth);
        setStartYear(sYear);
        setEndMonth(eMonth);
        setEndYear(eYear);
    }, [education.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleFieldUpdate = (field: keyof Education, value: any) => {
        // Update local state immediately for instant UI feedback
        const updatedEducation = { ...localEducation, [field]: value };
        setLocalEducation(updatedEducation);

        // Debounce the parent update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onUpdate(education.id, { [field]: value });
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

    // Use the separate state variables for display
    const startDate = { month: startMonth, year: startYear };
    const endDate = { month: endMonth, year: endYear };

    const handleDeleteConfirm = () => {
        onDelete(education.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Entry Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {education.degree || "New Education"}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {education.institution && `${education.institution}${education.location ? ` • ${education.location}` : ""}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Move buttons */}
                    <button
                        type="button"
                        onClick={() => onMoveUp(education.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Move up"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveDown(education.id)}
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
                        onClick={() => onToggleEdit(education.id)}
                        className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDuplicate(education.id)}
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Education</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete this education entry? This action cannot be undone.
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
                    {/* Degree with suggestions */}
                    <div>
                        <Input
                            label="Degree/Certification"
                            value={localEducation.degree}
                            onChange={(e) => handleFieldUpdate("degree", e.target.value)}
                            required
                            placeholder="e.g., Bachelor of Science in Computer Science"
                            list="degree-suggestions"
                            className="text-sm"
                        />
                        <datalist id="degree-suggestions">
                            {DEGREE_SUGGESTIONS.map((degree, index) => (
                                <option key={index} value={degree} />
                            ))}
                        </datalist>
                    </div>

                    {/* Institution and Location */}
                    <div className="grid grid-cols-1 gap-3">
                        <Input
                            label="University/Institution"
                            value={localEducation.institution}
                            onChange={(e) => handleFieldUpdate("institution", e.target.value)}
                            required
                            placeholder="e.g., Stanford University"
                            className="text-sm"
                        />
                        <Input
                            label="Location"
                            value={localEducation.location}
                            onChange={(e) => handleFieldUpdate("location", e.target.value)}
                            placeholder="e.g., Stanford, CA"
                            className="text-sm"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-700">Study Period</h5>

                        <div className="grid grid-cols-1 gap-3">
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
                            </div>

                            <div className="grid grid-cols-2 gap-2">
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
                            </div>
                        </div>
                    </div>

                    {/* GPA */}
                    <Input
                        label="GPA (Optional)"
                        value={localEducation.gpa || ""}
                        onChange={(e) => handleFieldUpdate("gpa", e.target.value)}
                        placeholder="e.g., 3.8/4.0"
                        maxLength={10}
                        className="text-sm"
                    />

                    {/* Coursework */}
                    <CourseworkManager
                        coursework={localEducation.coursework || []}
                        onUpdate={(coursework) => handleFieldUpdate("coursework", coursework)}
                    />
                </div>
            )}

            {/* Summary View (when not editing) */}
            {!isEditing && (
                <div className="space-y-2 border-t border-gray-200 pt-3">
                    {education.gpa && (
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">GPA:</span> {education.gpa}
                        </p>
                    )}

                    {education.coursework && education.coursework.length > 0 && (
                        <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-1.5">Relevant Coursework:</h5>
                            <div className="flex flex-wrap gap-1">
                                {education.coursework.map((course, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                                    >
                                        {course}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {education.startDate && education.endDate && (
                        <p className="text-xs text-gray-500">
                            {new Date(education.startDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            {" - "}
                            {new Date(education.endDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Education Editor Component
 *
 * Provides comprehensive editing capabilities for education entries including:
 * - Add/remove/duplicate education entries
 * - Reorder entries with move up/down buttons
 * - Comprehensive form fields
 * - Coursework tag management
 * - GPA field
 * - Collapsible entries for space efficiency
 * - Real-time auto-save integration
 */
export const EducationEditor: React.FC<EducationEditorProps> = ({
    className = "",
}) => {
    const { resume, dispatch } = useResumeContext();
    const { updateResume } = useResumeBackend();
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    // Find the education section
    const educationSection = (resume.sections || []).find(
        (section) => section.type === "education"
    );

    const educationEntries = educationSection?.content
        ? (educationSection.content as { education: Education[] }).education
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
        (updatedEducation: Education[]) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                if (educationSection) {
                    dispatch({
                        type: "UPDATE_SECTION",
                        payload: {
                            id: educationSection.id,
                            updates: {
                                content: { education: updatedEducation },
                            },
                        },
                    });
                }
            }, 300);
        },
        [dispatch, educationSection]
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
     * Helper to save education to backend
     */
    const saveToBackend = (updatedEducation: Education[]) => {
        const contentToSave = mapResumeToContent(resume);
        contentToSave.education = updatedEducation;

        updateResume({
            content: contentToSave as any
        });
    };

    /**
     * Add new education entry
     */
    const addEducation = () => {
        const newEducation: Education = {
            id: generateId(),
            degree: "",
            institution: "",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
            coursework: [],
        };

        const updatedEducation = [...educationEntries, newEducation];
        debouncedUpdate(updatedEducation);
        saveToBackend(updatedEducation);
        setEditingEntryId(newEducation.id);
    };

    /**
     * Update education entry
     */
    const updateEducation = (id: string, updates: Partial<Education>) => {
        const updatedEducation = educationEntries.map((edu) =>
            edu.id === id ? { ...edu, ...updates } : edu
        );
        debouncedUpdate(updatedEducation);
        saveToBackend(updatedEducation);
    };

    /**
     * Delete education entry
     */
    const deleteEducation = (id: string) => {
        const updatedEducation = educationEntries.filter((edu) => edu.id !== id);
        debouncedUpdate(updatedEducation);
        saveToBackend(updatedEducation);
        if (editingEntryId === id) {
            setEditingEntryId(null);
        }
    };

    /**
     * Duplicate education entry
     */
    const duplicateEducation = (id: string) => {
        const educationToDuplicate = educationEntries.find((edu) => edu.id === id);
        if (educationToDuplicate) {
            const duplicatedEducation: Education = {
                ...educationToDuplicate,
                id: generateId(),
                degree: `${educationToDuplicate.degree} (Copy)`,
            };
            const updatedEducation = [...educationEntries, duplicatedEducation];
            debouncedUpdate(updatedEducation);
            saveToBackend(updatedEducation);
            setEditingEntryId(duplicatedEducation.id);
        }
    };

    /**
     * Toggle edit mode for entry
     */
    const toggleEditEntry = (id: string) => {
        if (editingEntryId === id) {
             saveToBackend(educationEntries);
        }
        setEditingEntryId(editingEntryId === id ? null : id);
    };

    /**
     * Move education entry up
     */
    const moveEducationUp = (id: string) => {
        const currentIndex = educationEntries.findIndex((edu) => edu.id === id);
        if (currentIndex > 0) {
            const updatedEducation = [...educationEntries];
            [updatedEducation[currentIndex - 1], updatedEducation[currentIndex]] =
                [updatedEducation[currentIndex], updatedEducation[currentIndex - 1]];
            debouncedUpdate(updatedEducation);
            saveToBackend(updatedEducation);
        }
    };

    /**
     * Move education entry down
     */
    const moveEducationDown = (id: string) => {
        const currentIndex = educationEntries.findIndex((edu) => edu.id === id);
        if (currentIndex < educationEntries.length - 1) {
            const updatedEducation = [...educationEntries];
            [updatedEducation[currentIndex], updatedEducation[currentIndex + 1]] =
                [updatedEducation[currentIndex + 1], updatedEducation[currentIndex]];
            debouncedUpdate(updatedEducation);
            saveToBackend(updatedEducation);
        }
    };

    // Don't render if no education section exists
    if (!educationSection) {
        return null;
    }

    return (
        <div className={className}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {educationEntries.length} {educationEntries.length === 1 ? "entry" : "entries"}
                    </p>
                    <button
                        onClick={addEducation}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Education
                    </button>
                </div>

                {/* Education Entries */}
                {educationEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg
                            className="w-10 h-10 mx-auto mb-3 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">No education entries added</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Add your educational background to showcase your qualifications.
                        </p>
                        <button
                            onClick={addEducation}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Education
                        </button>
                    </div>
                ) : (
                    educationEntries.map((education) => (
                        <EducationEntry
                            key={education.id}
                            education={education}
                            isEditing={editingEntryId === education.id}
                            onUpdate={updateEducation}
                            onDelete={deleteEducation}
                            onDuplicate={duplicateEducation}
                            onToggleEdit={toggleEditEntry}
                            onMoveUp={moveEducationUp}
                            onMoveDown={moveEducationDown}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
