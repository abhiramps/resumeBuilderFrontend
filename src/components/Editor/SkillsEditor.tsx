import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Input } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";
import { Skill, SkillCategory, Resume } from "../../types/resume.types";
import {
    validateSkillCategory,
    hasValidationErrors,
    checkSkillsATSCompliance,
    SkillsValidationErrors,
    filterSkillSuggestions,
    generateId,
    parseSkillsInput,
    getPopularSkillsForCategory,
    CATEGORY_TEMPLATES
} from "../../utils/skillsValidation";

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
                    order: section.order // custom sections might need order
                });
                break;
        }
    });
    return content;
};



/**
 * Skills Editor Component Props
 */
export interface SkillsEditorProps {
    className?: string;
}

/**
 * Individual Skill Category Props
 */
export interface SkillCategoryComponentProps {
    category: SkillCategory;
    categoryIndex: number;
    isEditing: boolean;
    onUpdate: (index: number, updates: Partial<SkillCategory>) => void;
    onDelete: (index: number) => void;
    onDuplicate: (index: number) => void;
    onToggleEdit: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}

/**
 * Skill Tag Input Props
 */
export interface SkillTagInputProps {
    skills: Skill[];
    categoryName: string;
    onSkillsUpdate: (skills: Skill[]) => void;
    maxSkills?: number;
    allowLevels?: boolean;
}

/**
 * Skill level options
 */
const SKILL_LEVELS = [
    { value: "beginner", label: "Beginner", color: "bg-gray-100 text-gray-800" },
    { value: "intermediate", label: "Intermediate", color: "bg-blue-100 text-blue-800" },
    { value: "advanced", label: "Advanced", color: "bg-green-100 text-green-800" },
    { value: "expert", label: "Expert", color: "bg-purple-100 text-purple-800" },
];

/**
 * Map category display name to skill category key
 * Only maps to predefined keys if it's an exact or very close match
 * Otherwise, returns "other" to allow custom categories
 */
// Removed mapCategoryNameToKey and getCategoryDisplayName as they are no longer needed
// We use the category name directly as the category key

/**
 * Skill Tag Input Component
 */
const SkillTagInput: React.FC<SkillTagInputProps> = ({
    skills,
    categoryName,
    onSkillsUpdate,
    maxSkills = 20,
    allowLevels = true,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showBulkInput, setShowBulkInput] = useState(false);
    const [bulkInput, setBulkInput] = useState("");

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (value.trim()) {
            const existingSkillNames = skills.map(skill => skill.name);
            const filtered = filterSkillSuggestions(value, categoryName, existingSkillNames);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const addSkill = (skillName: string, level: Skill["level"] = "intermediate") => {
        const trimmedName = skillName.trim();
        if (trimmedName && !skills.some(skill => skill.name.toLowerCase() === trimmedName.toLowerCase())) {
            // Use category name directly
            const newSkill: Skill = {
                id: generateId(),
                name: trimmedName,
                category: categoryName,
                level: level,
            };
            onSkillsUpdate([...skills, newSkill]);
        }
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const removeSkill = (skillId: string) => {
        const updatedSkills = skills.filter(skill => skill.id !== skillId);
        onSkillsUpdate(updatedSkills);
    };

    const updateSkillLevel = (skillId: string, level: Skill["level"]) => {
        const updatedSkills = skills.map(skill =>
            skill.id === skillId ? { ...skill, level } : skill
        );
        onSkillsUpdate(updatedSkills);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (inputValue.trim()) {
                addSkill(inputValue);
            }
        } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
            removeSkill(skills[skills.length - 1].id);
        }
    };

    const handleBulkAdd = () => {
        const skillNames = parseSkillsInput(bulkInput);
        const existingNames = skills.map(skill => skill.name.toLowerCase());
        const newSkills = skillNames
            .filter(name => !existingNames.includes(name.toLowerCase()))
            .map(name => ({
                id: generateId(),
                name,
                category: categoryName,
                level: "intermediate" as const,
            }));

        if (newSkills.length > 0) {
            onSkillsUpdate([...skills, ...newSkills]);
        }

        setBulkInput("");
        setShowBulkInput(false);
    };

    const popularSkills = getPopularSkillsForCategory(categoryName);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h5 className="text-xs font-medium text-gray-700">Skills</h5>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {skills.length}/{maxSkills} skills
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowBulkInput(!showBulkInput)}
                        className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                        Bulk Add
                    </button>
                </div>
            </div>

            {/* Bulk Input */}
            {showBulkInput && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                    <Input
                        label="Add Multiple Skills"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="Enter skills separated by commas (e.g., React, Node.js, Python)"
                        helperText="Separate skills with commas"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBulkInput(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleBulkAdd}
                            disabled={!bulkInput.trim()}
                        >
                            Add Skills
                        </Button>
                    </div>
                </div>
            )}

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-md min-h-[36px] bg-white">
                {skills.map((skill) => {
                    const levelInfo = SKILL_LEVELS.find(l => l.value === skill.level) || SKILL_LEVELS[1];
                    return (
                        <div
                            key={skill.id}
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${levelInfo.color} group`}
                        >
                            <span>{skill.name}</span>
                            {allowLevels && (
                                <select
                                    value={skill.level}
                                    onChange={(e) => updateSkillLevel(skill.id, e.target.value as Skill["level"])}
                                    className="ml-1 text-xs bg-transparent border-none outline-none cursor-pointer"
                                    title="Skill level"
                                >
                                    {SKILL_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                className="ml-1 text-current hover:text-red-600 opacity-70 group-hover:opacity-100"
                                title="Remove skill"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}

                {skills.length < maxSkills && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (inputValue.trim()) {
                                const existingSkillNames = skills.map(skill => skill.name);
                                const filtered = filterSkillSuggestions(inputValue, categoryName, existingSkillNames);
                                setSuggestions(filtered);
                                setShowSuggestions(filtered.length > 0);
                            }
                        }}
                        onBlur={() => {
                            // Delay hiding suggestions to allow clicking
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder={skills.length === 0 ? "Add skills (e.g., React, Python)" : "Add more..."}
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
                                onClick={() => addSkill(suggestion)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Skills */}
            {popularSkills.length > 0 && skills.length === 0 && (
                <div className="text-xs">
                    <span className="text-gray-600 font-medium">Popular {categoryName} skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {popularSkills.map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => addSkill(skill)}
                                disabled={skills.some(s => s.name.toLowerCase() === skill.toLowerCase()) || skills.length >= maxSkills}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {skills.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-1.5">
                    No skills added yet. Start typing to add skills or use popular suggestions above.
                </p>
            )}

            {skills.length >= maxSkills && (
                <p className="text-xs text-orange-600">
                    Maximum {maxSkills} skills reached. Remove some to add more.
                </p>
            )}
        </div>
    );
};

/**
 * Individual Skill Category Component
 */
const SkillCategoryComponent: React.FC<SkillCategoryComponentProps> = ({
    category,
    categoryIndex,
    isEditing,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleEdit,
    onMoveUp,
    onMoveDown,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [validationErrors, setValidationErrors] = useState<SkillsValidationErrors[string]>({});

    const handleCategoryUpdate = (field: keyof SkillCategory, value: any) => {
        const updatedCategory = { ...category, [field]: value };

        // If category name changed, update all skills' category field
        if (field === 'categoryName') {
            const updatedSkills = category.skills.map(skill => ({
                ...skill,
                category: value
            }));
            onUpdate(categoryIndex, { [field]: value, skills: updatedSkills });
        } else {
            onUpdate(categoryIndex, { [field]: value });
        }

        // Validate the updated category
        const errors = validateSkillCategory(updatedCategory);
        setValidationErrors(errors);
    };

    const handleSkillsUpdate = (skills: Skill[]) => {
        // Ensure all skills have the correct category
        // Ensure all skills have the correct category
        const updatedSkills = skills.map(skill => ({
            ...skill,
            category: category.categoryName
        }));
        handleCategoryUpdate("skills", updatedSkills);
    };

    const handleDeleteConfirm = () => {
        onDelete(categoryIndex);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Category Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {category.categoryName || "New Category"}
                        </h4>
                        <p className="text-xs text-gray-500">
                            {category.skills.length} {category.skills.length === 1 ? "skill" : "skills"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Move buttons */}
                    <button
                        type="button"
                        onClick={() => onMoveUp(categoryIndex)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Move up"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveDown(categoryIndex)}
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
                        onClick={() => onToggleEdit(categoryIndex)}
                        className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDuplicate(categoryIndex)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Duplicate category"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete category"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Validation Status */}
            {isEditing && (
                <div className="flex flex-wrap gap-1.5">
                    {hasValidationErrors(validationErrors) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠ Issues
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Valid
                        </span>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete this skill category and all its skills? This action cannot be undone.
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

            {/* Category Form */}
            {isEditing && (
                <div className="space-y-3 border-t border-gray-200 pt-3">
                    <Input
                        label="Category Name"
                        value={category.categoryName}
                        onChange={(e) => handleCategoryUpdate("categoryName", e.target.value)}
                        error={validationErrors.categoryName}
                        required
                        placeholder="e.g., Programming Languages"
                        className="text-sm"
                    />

                    <SkillTagInput
                        skills={category.skills}
                        categoryName={category.categoryName}
                        onSkillsUpdate={handleSkillsUpdate}
                    />

                    {validationErrors.general && (
                        <p className="text-xs text-red-600">{validationErrors.general}</p>
                    )}
                </div>
            )}

            {/* Summary View (when not editing) */}
            {!isEditing && (
                <div className="space-y-2 border-t border-gray-200 pt-3">
                    {category.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {category.skills.map((skill) => {
                                const levelInfo = SKILL_LEVELS.find(l => l.value === skill.level) || SKILL_LEVELS[1];
                                return (
                                    <span
                                        key={skill.id}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${levelInfo.color}`}
                                        title={`${skill.name} - ${levelInfo.label}`}
                                    >
                                        {skill.name}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 italic">No skills added to this category yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Technical Skills Editor Component
 *
 * Provides comprehensive editing capabilities for technical skills including:
 * - Category-based skill organization
 * - Tag-based skill input with suggestions
 * - Skill level indicators
 * - Category templates for quick setup
 * - Bulk skill input functionality
 * - Real-time validation and ATS compliance
 */
export const SkillsEditor: React.FC<SkillsEditorProps> = ({
    className = "",
}) => {
    const { resume, dispatch } = useResumeContext();
    const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);

    // Find the skills section
    const skillsSection = (resume.sections || []).find(
        (section) => section.type === "skills"
    );

    // Convert flat skills array to categorized structure
    const flatSkills = skillsSection?.content
        ? (skillsSection.content as { skills: Skill[] }).skills
        : [];

    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(() => {
        // Try to load saved category structure from localStorage
        const savedCategories = localStorage.getItem(`skillCategories_${skillsSection?.id}`);
        if (savedCategories) {
            try {
                const parsed = JSON.parse(savedCategories) as SkillCategory[];
                // Validate that saved categories match current skills
                const savedSkillIds = new Set(parsed.flatMap((cat: SkillCategory) => cat.skills.map(s => s.id)));
                const currentSkillIds = new Set(flatSkills.map(s => s.id));

                // If skill IDs match, use saved categories (preserves custom names)
                if (savedSkillIds.size === currentSkillIds.size &&
                    [...savedSkillIds].every(id => currentSkillIds.has(id))) {
                    return parsed;
                }
            } catch (e) {
                console.error('Failed to parse saved categories', e);
            }
        }

        // If no saved categories or mismatch, group by category key with default names
        if (flatSkills.length > 0) {
            const categoryMap = new Map<string, Skill[]>();

            flatSkills.forEach(skill => {
                const categoryName = skill.category || "Other";
                
                if (!categoryMap.has(categoryName)) {
                    categoryMap.set(categoryName, []);
                }
                categoryMap.get(categoryName)!.push(skill);
            });

            return Array.from(categoryMap.entries()).map(([categoryName, skills]) => {
                return {
                    categoryName,
                    skills
                };
            });
        }
        return [];
    });

    // Ref to store the debounce timer
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backendSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Debounced update function
     */
    const debouncedUpdate = useCallback(
        (updatedCategories: SkillCategory[]) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                // Convert categories back to flat skills array
                const flatSkills: Skill[] = [];
                const skillToCategoryMap: Record<string, string> = {}; // Map skill ID to category name

                updatedCategories.forEach(category => {
                    category.skills.forEach(skill => {
                        const updatedSkill: Skill = {
                            ...skill,
                            category: category.categoryName,
                        };

                        flatSkills.push(updatedSkill);
                        // Store mapping of skill ID to category name
                        skillToCategoryMap[skill.id] = category.categoryName;
                    });
                });

                if (skillsSection) {
                    dispatch({
                        type: "UPDATE_SECTION",
                        payload: {
                            id: skillsSection.id,
                            updates: {
                                content: {
                                    skills: flatSkills,
                                    skillCategories: skillToCategoryMap // Store skill ID to category name mapping
                                },
                            },
                        },
                    });
                }
            }, 300);
        },
        [dispatch, skillsSection]
    );

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (backendSaveTimerRef.current) {
                clearTimeout(backendSaveTimerRef.current);
            }
        };
    }, []);

    /**
     * Update skill categories and sync with context
     */
    const updateSkillCategories = (updatedCategories: SkillCategory[]) => {
        setSkillCategories(updatedCategories);

        // Save to localStorage to preserve user's custom category names
        if (skillsSection?.id) {
            localStorage.setItem(`skillCategories_${skillsSection.id}`, JSON.stringify(updatedCategories));
        }

        debouncedUpdate(updatedCategories);
    };

    const { updateResume } = useResumeBackend();

    /**
     * Helper to save skills to backend
     */
    const saveToBackend = (categories: SkillCategory[]) => {
        const flatSkills: Skill[] = [];
        categories.forEach(category => {
            category.skills.forEach(skill => {
                const updatedSkill: Skill = {
                    ...skill,
                    category: category.categoryName,
                };
                flatSkills.push(updatedSkill);
            });
        });

        const contentToSave = mapResumeToContent(resume);
        contentToSave.skills = flatSkills;

        updateResume({
            content: contentToSave as any
        });
    };

    /**
     * Add new skill category
     */
    const addCategory = () => {
        const newCategory: SkillCategory = {
            categoryName: "",
            skills: [],
        };

        const updatedCategories = [...skillCategories, newCategory];
        updateSkillCategories(updatedCategories);
        saveToBackend(updatedCategories); // Ensure immediate save
        setEditingCategoryIndex(updatedCategories.length - 1);
    };

    /**
     * Update skill category
     */
    const updateCategory = (index: number, updates: Partial<SkillCategory>) => {
        const updatedCategories = skillCategories.map((category, i) =>
            i === index ? { ...category, ...updates } : category
        );
        updateSkillCategories(updatedCategories);

        // Debounce backend save
        if (backendSaveTimerRef.current) {
            clearTimeout(backendSaveTimerRef.current);
        }
        backendSaveTimerRef.current = setTimeout(() => {
            saveToBackend(updatedCategories);
        }, 1000);
    };

    /**
     * Delete skill category
     */
    const deleteCategory = (index: number) => {
        const updatedCategories = skillCategories.filter((_, i) => i !== index);
        updateSkillCategories(updatedCategories);
        saveToBackend(updatedCategories);
        if (editingCategoryIndex === index) {
            setEditingCategoryIndex(null);
        }
    };

    /**
     * Duplicate skill category
     */
    const duplicateCategory = (index: number) => {
        const categoryToDuplicate = skillCategories[index];
        if (categoryToDuplicate) {
            const newCategoryName = `${categoryToDuplicate.categoryName} (Copy)`;
            const duplicatedCategory: SkillCategory = {
                ...categoryToDuplicate,
                categoryName: newCategoryName,
                skills: categoryToDuplicate.skills.map(skill => ({
                    ...skill,
                    id: generateId(),
                    category: newCategoryName,
                })),
            };
            const updatedCategories = [...skillCategories, duplicatedCategory];
            updateSkillCategories(updatedCategories);
            saveToBackend(updatedCategories);
            setEditingCategoryIndex(updatedCategories.length - 1);
        }
    };

    const toggleEditCategory = (index: number) => {
        // If we are currently editing this category and toggling it off (saving)
        if (editingCategoryIndex === index) {
            saveToBackend(skillCategories);
        }
        setEditingCategoryIndex(editingCategoryIndex === index ? null : index);
    };

    /**
     * Move category up
     */
    const moveCategoryUp = (index: number) => {
        if (index > 0) {
            const updatedCategories = [...skillCategories];
            [updatedCategories[index - 1], updatedCategories[index]] =
                [updatedCategories[index], updatedCategories[index - 1]];
            updateSkillCategories(updatedCategories);
            saveToBackend(updatedCategories);
        }
    };

    /**
     * Move category down
     */
    const moveCategoryDown = (index: number) => {
        if (index < skillCategories.length - 1) {
            const updatedCategories = [...skillCategories];
            [updatedCategories[index], updatedCategories[index + 1]] =
                [updatedCategories[index + 1], updatedCategories[index]];
            updateSkillCategories(updatedCategories);
            saveToBackend(updatedCategories);
        }
    };

    /**
     * Apply category template
     */
    const applyTemplate = (templateId: string) => {
        const template = CATEGORY_TEMPLATES[templateId as keyof typeof CATEGORY_TEMPLATES];
        if (template) {
            const newCategories = template.categories.map(cat => {
                return {
                    categoryName: cat.categoryName,
                    skills: cat.skills.map(skillName => ({
                        id: generateId(),
                        name: skillName,
                        category: cat.categoryName,
                        level: "intermediate" as const,
                    })),
                };
            });

            // Merge with existing categories
            const mergedCategories = [...skillCategories];
            newCategories.forEach(newCat => {
                const existingIndex = mergedCategories.findIndex(
                    existing => existing.categoryName.toLowerCase() === newCat.categoryName.toLowerCase()
                );

                if (existingIndex >= 0) {
                    // Merge skills into existing category
                    const existingSkillNames = mergedCategories[existingIndex].skills.map(s => s.name.toLowerCase());
                    const newSkills = newCat.skills
                        .filter(skill => !existingSkillNames.includes(skill.name.toLowerCase()))
                        .map(skill => ({ ...skill, category: newCat.categoryName })); // Ensure category name matches
                    mergedCategories[existingIndex].skills.push(...newSkills);
                } else {
                    // Add new category
                    mergedCategories.push(newCat);
                }
            });

            updateSkillCategories(mergedCategories);
            saveToBackend(mergedCategories);
            setShowTemplates(false);
        }
    };



    // Don't render if no skills section exists
    if (!skillsSection) {
        return null;
    }

    const totalSkills = skillCategories.reduce((total, category) => total + category.skills.length, 0);
    const atsCheck = checkSkillsATSCompliance(skillCategories);

    return (
        <div className={className}>
            <div className="space-y-3">
                {/* Header Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {skillCategories.length} {skillCategories.length === 1 ? "category" : "categories"}, {totalSkills} skills
                        </p>
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                            Templates
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        {/* ATS Status */}
                        {atsCheck.isCompliant ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ ATS-Friendly
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                ⚠ ATS Issues
                            </span>
                        )}

                        <button
                            onClick={addCategory}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Skills Content */}
                <div className="space-y-3">
                    {/* Templates */}
                    {showTemplates && (
                        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-blue-900">Category Templates</h4>
                            <p className="text-xs text-blue-700">
                                Choose a template to quickly set up skill categories for your role. Templates will merge with existing skills.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(CATEGORY_TEMPLATES).map(([id, template]) => (
                                    <div key={id} className="bg-white rounded p-3 border border-blue-200">
                                        <h5 className="font-medium text-sm text-gray-900">{template.name}</h5>
                                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                                        <div className="text-xs text-gray-500 mb-2">
                                            Categories: {template.categories.map(cat => cat.categoryName).join(", ")}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => applyTemplate(id)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                        >
                                            Apply Template
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTemplates(false)}
                                className="text-blue-600"
                            >
                                Close Templates
                            </Button>
                        </div>
                    )}

                    {/* Skill Categories */}
                    {skillCategories.length === 0 ? (
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
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">No skill categories added</h4>
                            <p className="text-xs text-gray-500 mb-3">
                                Organize your technical skills into categories to showcase your expertise effectively.
                            </p>
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setShowTemplates(true)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                                >
                                    Use Template
                                </button>
                                <button
                                    onClick={addCategory}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Your First Category
                                </button>
                            </div>
                        </div>
                    ) : (
                        skillCategories.map((category, index) => (
                            <SkillCategoryComponent
                                key={index}
                                category={category}
                                categoryIndex={index}
                                isEditing={editingCategoryIndex === index}
                                onUpdate={updateCategory}
                                onDelete={deleteCategory}
                                onDuplicate={duplicateCategory}
                                onToggleEdit={toggleEditCategory}
                                onMoveUp={moveCategoryUp}
                                onMoveDown={moveCategoryDown}
                            />
                        ))
                    )}

                    {/* ATS Issues */}
                    {!atsCheck.isCompliant && atsCheck.issues.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-orange-900 mb-2">ATS Compliance Issues</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                                {atsCheck.issues.map((issue, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-orange-600 mr-2">•</span>
                                        <span>{issue}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ATS Suggestions */}
                    {atsCheck.suggestions.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Suggestions</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {atsCheck.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillsEditor;