import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ResumeSection } from '../../types/resume.types';
import { DraggableSection } from './DraggableSection';

interface SortableSectionListProps {
    sections: ResumeSection[];
    onReorder: (sectionIds: string[]) => void;
    onToggleSection: (sectionId: string) => void;
    onDeleteSection: (sectionId: string) => void;
    renderSectionContent: (section: ResumeSection) => React.ReactNode;
}

export const SortableSectionList: React.FC<SortableSectionListProps> = ({
    sections,
    onReorder,
    onToggleSection,
    onDeleteSection,
    renderSectionContent,
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);

    // Configure sensors for drag interactions
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);

            const reorderedSections = arrayMove(sections, oldIndex, newIndex);
            onReorder(reorderedSections.map((s) => s.id));
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const activeSection = sortedSections.find((s) => s.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext
                items={sortedSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-4">
                    {sortedSections.map((section) => (
                        <DraggableSection
                            key={section.id}
                            section={section}
                            onToggle={() => onToggleSection(section.id)}
                            onDelete={() => onDeleteSection(section.id)}
                        >
                            {renderSectionContent(section)}
                        </DraggableSection>
                    ))}
                </div>
            </SortableContext>

            {/* Drag Overlay for visual feedback */}
            <DragOverlay>
                {activeSection ? (
                    <div className="bg-white rounded-lg border-2 border-blue-500 shadow-2xl p-4 opacity-90">
                        <h3 className="font-semibold text-gray-900">{activeSection.title}</h3>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
