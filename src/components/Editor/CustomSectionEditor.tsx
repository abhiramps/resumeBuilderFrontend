import React, { useState, useRef, useEffect } from 'react';
import { ResumeSection, Resume } from '../../types/resume.types';
import { useResumeContext } from '../../contexts/ResumeContext';
import { useResumeBackend } from '../../contexts/ResumeBackendContext';
import { Input } from '../UI';

interface CustomSectionEditorProps {
    section: ResumeSection;
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

export const CustomSectionEditor: React.FC<CustomSectionEditorProps> = ({ section }) => {
    const { resume, dispatch } = useResumeContext();
    const { updateResume } = useResumeBackend();
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backendSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (section.type !== 'custom') return null;

    const customContent = (section.content as any).custom;
    const initialTitle = customContent?.title || '';
    const initialContent = customContent?.content || '';

    // Local state
    const [title, setTitle] = useState(initialTitle);
    const [items, setItems] = useState<string[]>(
        initialContent ? initialContent.split('\n') : []
    );

    // Sync local state when section changes (e.g. reorder or external update)
    useEffect(() => {
        setTitle(customContent?.title || '');
        setItems((customContent?.content || '').split('\n').filter((i: string) => i.trim() !== ''));
    }, [customContent?.id, customContent?.title, customContent?.content]);

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            if (backendSaveTimerRef.current) clearTimeout(backendSaveTimerRef.current);
        };
    }, []);

    /**
     * Save changes to backend
     */
    const saveToBackend = (updatedTitle: string, updatedContent: string) => {
        // We need to construct the full custom sections list for the backend
        // Since we are editing ONE section, we need to ensure others are preserved
        // mapResumeToContent does this by reading from 'resume' state
        // BUT 'resume' state might be slightly stale if we just dispatched.
        // However, mapResumeToContent iterates over resume.sections.
        // We need to ensure the mapped content includes OUR updates.
        
        // Actually, simpler: Dispatch updates to context FIRST.
        // Then map resume (which will have updates after context update? No, context update is async/react cycle)
        // So we should construct the content object manually with our override.
        
        const contentToSave = mapResumeToContent(resume);
        
        // Find and update this specific custom section in the list
        if (contentToSave.customSections) {
            const idx = contentToSave.customSections.findIndex((cs: any) => cs.id === customContent.id);
            if (idx !== -1) {
                contentToSave.customSections[idx] = {
                    ...contentToSave.customSections[idx],
                    title: updatedTitle,
                    content: updatedContent
                };
            }
        }

        updateResume({
            content: contentToSave as any
        });
    };

    /**
     * Dispatch updates to context and schedule backend save
     */
    const handleUpdate = (newTitle: string, newItems: string[]) => {
        const newContent = newItems.join('\n');
        
        setTitle(newTitle);
        setItems(newItems);

        // Debounce Context Update (Local UI)
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            dispatch({
                type: 'UPDATE_CUSTOM_SECTION',
                payload: {
                    sectionId: section.id,
                    title: newTitle,
                    content: newContent,
                },
            });
        }, 300);

        // Debounce Backend Save
        if (backendSaveTimerRef.current) clearTimeout(backendSaveTimerRef.current);
        backendSaveTimerRef.current = setTimeout(() => {
            saveToBackend(newTitle, newContent);
        }, 1000);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleUpdate(e.target.value, items);
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        handleUpdate(title, newItems);
    };

    const handleAddItem = () => {
        const newItems = [...items, ''];
        handleUpdate(title, newItems);
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        handleUpdate(title, newItems);
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === items.length - 1)
        ) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        handleUpdate(title, newItems);
    };

    return (
        <div className="space-y-4">
            <Input
                label="Section Title"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Volunteering, Awards, Hobbies"
                className="font-medium"
            />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-700">
                        List Items
                    </label>
                    <button
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Item
                    </button>
                </div>

                <div className="space-y-2">
                    {items.length === 0 && (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-500">No items added yet.</p>
                            <button
                                onClick={handleAddItem}
                                className="mt-2 text-xs text-blue-600 hover:underline"
                            >
                                Add your first item
                            </button>
                        </div>
                    )}

                    {items.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 group">
                            <div className="flex flex-col gap-0.5 mt-2">
                                <button
                                    onClick={() => handleMoveItem(index, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleMoveItem(index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="flex-1">
                                <textarea
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Description..."
                                />
                            </div>

                            <button
                                onClick={() => handleDeleteItem(index)}
                                className="mt-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete item"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};