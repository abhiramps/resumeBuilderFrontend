import React, { useState } from "react";
import { createPortal } from "react-dom";
import { TemplateType } from "../../types/resume.types";
import { Check, ChevronDown, X } from "lucide-react";
import { TemplateThumbnail } from "../Templates/TemplateThumbnail";

interface TemplateSelectorProps {
  currentTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

interface TemplateInfo {
  id: TemplateType;
  name: string;
  description: string;
  atsScore: number;
  bestFor: string;
  features: string[];
}

const TEMPLATE_INFO: Record<TemplateType, TemplateInfo> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional chronological format with clean typography",
    atsScore: 95,
    bestFor: "Traditional industries, conservative companies, senior roles",
    features: [
      "Times New Roman font",
      "Centered header",
      "Traditional bullets",
      "Single column",
    ],
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean, contemporary design with visual accents",
    atsScore: 92,
    bestFor: "Tech companies, startups, creative roles, modern industries",
    features: [
      "Sans-serif font",
      "Accent colors",
      "Grid skills layout",
      "Contemporary style",
    ],
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, space-efficient design",
    atsScore: 100,
    bestFor: "Experienced candidates, single-page resumes, maximum content",
    features: [
      "Maximum density",
      "Black & white",
      "Minimal spacing",
      "Space-optimized",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    description:
      "Professional template based on successful backend engineer resume",
    atsScore: 95,
    bestFor: "Backend engineers, technical roles, professional presentation",
    features: [
      "Centered header",
      "Category skills",
      "Professional colors",
      "Single-page optimized",
    ],
  },
  academic: {
    id: "academic",
    name: "Academic",
    description: "LaTeX-inspired academic resume for research and FAANG positions",
    atsScore: 98,
    bestFor: "Academic positions, research roles, FAANG applications, graduate students",
    features: [
      "LaTeX-style layout",
      "Serif typography",
      "Centered header",
      "Traditional formatting",
    ],
  },
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onTemplateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    null
  );

  const currentInfo = TEMPLATE_INFO[currentTemplate];

  const handleTemplateSelect = (template: TemplateType) => {
    if (template === currentTemplate) {
      setIsOpen(false);
      return;
    }
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onTemplateChange(selectedTemplate);
      setSelectedTemplate(null);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium shadow-sm"
      >
        <span className="text-gray-700">{currentInfo.name}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Modal Overlay */}
      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30"
              style={{ zIndex: 9998 }}
              onClick={handleCancel}
            />

            {/* Modal Content */}
            <div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 9999, pointerEvents: "none" }}
            >
              <div className="pointer-events-auto">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Choose Template
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Select a template that best fits your needs
                      </p>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Templates Grid */}
                  <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.values(TEMPLATE_INFO).map((template) => {
                        const isSelected = selectedTemplate === template.id;
                        const isCurrent = currentTemplate === template.id;

                        return (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${isSelected
                                ? "border-blue-500 bg-blue-50"
                                : isCurrent
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {/* Current Badge */}
                            {isCurrent && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                                Current
                              </div>
                            )}

                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 p-1 bg-blue-500 rounded-full">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}

                            {/* Template Preview */}
                            <div className="h-40 rounded-lg mb-3 overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
                              <TemplateThumbnail
                                templateType={template.id}
                                className="w-full h-full"
                              />
                            </div>

                            {/* Template Info */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">
                                  {template.name}
                                </h3>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs font-semibold text-gray-600">
                                    ATS:
                                  </span>
                                  <span
                                    className={`text-xs font-bold ${template.atsScore >= 95
                                        ? "text-green-600"
                                        : template.atsScore >= 90
                                          ? "text-blue-600"
                                          : "text-yellow-600"
                                      }`}
                                  >
                                    {template.atsScore}/100
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600">
                                {template.description}
                              </p>

                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  Best For:
                                </p>
                                <p className="text-xs text-gray-600">
                                  {template.bestFor}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {template.features.map((feature, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="text-sm text-gray-600">
                      {selectedTemplate &&
                        selectedTemplate !== currentTemplate ? (
                        <span>
                          Switching to{" "}
                          <strong>
                            {TEMPLATE_INFO[selectedTemplate].name}
                          </strong>{" "}
                          template
                        </span>
                      ) : (
                        <span>
                          All resume data will be preserved when switching
                          templates
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        disabled={
                          !selectedTemplate ||
                          selectedTemplate === currentTemplate
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTemplate &&
                            selectedTemplate !== currentTemplate
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Apply Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default TemplateSelector;
