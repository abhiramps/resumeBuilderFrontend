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
    <div className="w-full max-w-3xl mx-auto">
      {/* Selected Template Info Card */}
      <div className="flex items-center p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl transition-all hover:border-gray-300 hover:shadow-sm">
        {/* Thumbnail Preview */}
        <div className="h-16 w-12 sm:h-20 sm:w-16 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <TemplateThumbnail 
            templateType={currentTemplate} 
            className="w-full h-full object-cover origin-top transform scale-100" 
          />
        </div>

        {/* Info Text */}
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
              {currentInfo.name}
            </h3>
            <span className="hidden sm:inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium border border-green-200">
              Active
            </span>
            <span className={`hidden sm:inline-flex px-2 py-0.5 text-xs rounded-full font-medium border ${
                currentInfo.atsScore >= 95 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              ATS Score: {currentInfo.atsScore}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-2">
            {currentInfo.description}
          </p>
          <div className="flex sm:hidden items-center gap-2 mt-1">
             <span className="text-xs text-green-600 font-medium">Active</span>
             <span className="text-xs text-gray-400">•</span>
             <span className="text-xs text-gray-500">ATS: {currentInfo.atsScore}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="ml-3 sm:ml-4 px-3 sm:px-4 py-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 flex-shrink-0 group"
        >
          <span>Change</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

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
              <div className="pointer-events-auto w-full flex justify-center">
                <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
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
                  <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {Object.values(TEMPLATE_INFO).map((template) => {
                        const isSelected = selectedTemplate === template.id;
                        const isCurrent = currentTemplate === template.id;

                        return (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`relative border rounded-xl p-2 sm:p-3 cursor-pointer transition-all duration-200 group hover:shadow-md ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                                : isCurrent
                                ? "border-green-500 bg-green-50/50 ring-1 ring-green-500"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                            }`}
                          >
                            {/* Current Badge */}
                            {isCurrent && (
                              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 px-1 sm:px-1.5 py-0.5 bg-green-500 text-white text-[8px] sm:text-[10px] uppercase tracking-wider font-bold rounded shadow-sm z-10">
                                <span className="hidden sm:inline">Current</span>
                                <span className="sm:hidden">Active</span>
                              </div>
                            )}

                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 p-0.5 sm:p-1 bg-blue-500 rounded-full shadow-sm z-10">
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                              </div>
                            )}

                            {/* Template Preview */}
                            <div className="h-24 sm:h-32 rounded-lg mb-2 sm:mb-3 overflow-hidden border border-gray-200 bg-white shadow-sm relative group-hover:shadow-inner transition-shadow">
                              <TemplateThumbnail
                                templateType={template.id}
                                className="w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>

                            {/* Template Info */}
                            <div className="space-y-1 sm:space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-bold text-gray-900 text-[11px] sm:text-sm truncate">
                                  {template.name}
                                </h3>
                                <div className="flex items-center space-x-0.5 sm:space-x-1 bg-white px-1 py-0.5 rounded border border-gray-100 flex-shrink-0">
                                  <span className="text-[8px] sm:text-[10px] font-semibold text-gray-500">
                                    ATS
                                  </span>
                                  <span
                                    className={`text-[8px] sm:text-[10px] font-bold ${
                                      template.atsScore >= 95
                                        ? "text-green-600"
                                        : template.atsScore >= 90
                                        ? "text-blue-600"
                                        : "text-yellow-600"
                                    }`}
                                  >
                                    {template.atsScore}
                                  </span>
                                </div>
                              </div>

                              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 sm:line-clamp-2 min-h-[1.2em] sm:min-h-[2.5em]">
                                {template.description}
                              </p>

                              <div className="pt-1.5 sm:pt-2 border-t border-gray-100">
                                <div className="flex items-baseline gap-1 mb-1 sm:mb-1.5">
                                  <span className="hidden sm:inline text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                    Best For
                                  </span>
                                  <span className="text-[9px] sm:text-xs text-gray-700 line-clamp-1">
                                    {template.bestFor}
                                  </span>
                                </div>
                                
                                <div className="hidden sm:flex flex-wrap gap-1">
                                  {template.features.slice(0, 3).map((feature, index) => (
                                    <span
                                      key={index}
                                      className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                  {template.features.length > 3 && (
                                    <span className="px-1.5 py-0.5 text-gray-400 text-[10px]">
                                      +{template.features.length - 3}
                                    </span>
                                  )}
                                </div>
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
