import React, { FC } from "react";
import { useResumeContext } from "../../contexts/ResumeContext";
import { Button, Input } from "../UI";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
const SortableItem: FC<{ item: any; onUpdate: any; onDelete: any }> = ({ item, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div
          {...attributes}
          {...listeners}
          className="mt-2 mr-2 cursor-move text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          <Input
            label="Category / Title"
            value={item.title}
            onChange={(e) => onUpdate(item.id, "title", e.target.value)}
            placeholder="e.g. Languages, Volunteering"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details (One per line)
            </label>
            <textarea
              value={Array.isArray(item.content) ? item.content.join('\n') : item.content}
              onChange={(e) => onUpdate(item.id, "content", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
              placeholder="e.g. English (Native)\nSpanish (Conversational)"
            />
          </div>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="ml-4 text-red-500 hover:text-red-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const AdditionalInfoEditor: React.FC = () => {
  const { resume, dispatch } = useResumeContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const section = resume.sections.find((s) => s.type === "additional-info");

  if (!section) return null;

  const items = (section.content as any).additionalInfo || [];

  const handleAddItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      content: [],
    };

    dispatch({
      type: "UPDATE_SECTION",
      payload: {
        id: section.id,
        updates: {
          content: {
            additionalInfo: [...items, newItem],
          },
        },
      },
    });
  };

  const handleUpdateItem = (id: string, field: "title" | "content", value: any) => {
    const updatedItems = items.map((item: any) => {
      if (item.id === id) {
        if (field === "content") {
           return { ...item, content: typeof value === 'string' ? value.split('\n') : value };
        }
        return { ...item, [field]: value };
      }
      return item;
    });

    dispatch({
      type: "UPDATE_SECTION",
      payload: {
        id: section.id,
        updates: {
          content: {
            additionalInfo: updatedItems,
          },
        },
      },
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updatedItems = items.filter((item: any) => item.id !== id);
      dispatch({
        type: "UPDATE_SECTION",
        payload: {
          id: section.id,
          updates: {
            content: {
              additionalInfo: updatedItems,
            },
          },
        },
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item: any) => item.id === active.id);
      const newIndex = items.findIndex((item: any) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      dispatch({
        type: "UPDATE_SECTION",
        payload: {
          id: section.id,
          updates: {
            content: {
              additionalInfo: newItems,
            },
          },
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        <Button onClick={handleAddItem} size="sm">
          Add Item
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item: any) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((item: any) => (
              <SortableItem
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No additional information added yet.</p>
          <Button onClick={handleAddItem} variant="secondary" className="mt-4">
            Add Your First Item
          </Button>
        </div>
      )}
    </div>
  );
};
