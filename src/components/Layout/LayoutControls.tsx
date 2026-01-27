import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useResumeContext } from '../../contexts/ResumeContext';
import { useResumeBackend } from '../../contexts/ResumeBackendContext';
import { Ruler, Space, RotateCcw, Link2, Unlink, Type, Palette, ChevronDown, ChevronRight, Database } from 'lucide-react';
import { TemplateCustomization } from './TemplateCustomization';
import { DataManagement } from './DataManagement';
import { Resume, LayoutSettings } from '../../types/resume.types';

type Unit = 'inches' | 'mm';

// Helper to convert frontend Resume state to backend ResumeContent
const mapResumeToContent = (resume: Resume, updatedLayout?: LayoutSettings): any => {
    const content: any = {
        personalInfo: resume.personalInfo,
        sectionOrder: resume.sections.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            enabled: s.enabled,
            order: s.order
        })),
        layout: updatedLayout || resume.layout
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
            case 'additional-info':
                content.additionalInfo = sectionContent.additionalInfo;
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

const MARGIN_PRESETS = {
  narrow: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
  normal: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
  wide: { top: 1.0, right: 1.0, bottom: 1.0, left: 1.0 },
};

const DEFAULT_LAYOUT = {
  pageMargins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
  sectionSpacing: 16,
  lineHeight: 1.5,
  fontSize: {
    name: 24,
    title: 12,
    sectionHeader: 12,
    body: 11,
  },
  fontFamily: 'Arial',
  colors: {
    primary: '#2c3e50',
    secondary: '#555555',
    text: '#333333',
  },
};

const ATS_SAFE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Calibri',
];

const FONT_SIZE_PRESETS = {
  small: { name: 20, title: 11, sectionHeader: 11, body: 9 },
  medium: { name: 24, title: 12, sectionHeader: 12, body: 11 },
  large: { name: 28, title: 14, sectionHeader: 13, body: 12 },
};

const COLOR_PRESETS = {
  professional: {
    primary: '#2c3e50',
    secondary: '#555555',
    text: '#333333',
  },
  modern: {
    primary: '#1a73e8',
    secondary: '#5f6368',
    text: '#202124',
  },
  vibrant: {
    primary: '#d32f2f',
    secondary: '#757575',
    text: '#212121',
  },
};

export const LayoutControls: React.FC = () => {
  const { resume, dispatch } = useResumeContext();
  const { currentResume, updateResume } = useResumeBackend();
  const [unit, setUnit] = useState<Unit>('inches');
  const [linkedMargins, setLinkedMargins] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['margins', 'typography', 'data'])
  );
  
  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.has(sectionId);

  const { pageMargins, sectionSpacing, lineHeight, fontSize, fontFamily, colors } = resume.layout;

  /**
   * Save to backend helper
   */
  const saveToBackend = async (updatedLayout?: LayoutSettings) => {
    if (!currentResume) return;

    try {
      setSaveStatus("saving");
      const content = mapResumeToContent(resume, updatedLayout);
      await updateResume({ content });
      setSaveStatus("saved");
      
      // Reset to idle after delay
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    }
  };

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback(
    (updatedLayout?: LayoutSettings) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      setSaveStatus("saving");
      
      debounceTimerRef.current = setTimeout(() => {
        saveToBackend(updatedLayout);
      }, 1000);
    },
    [currentResume, resume, updateResume]
  );

  // Watch for layout changes to trigger autosave
  // This handles all layout updates including those from presets or child components
  const lastLayoutRef = useRef(resume.layout);
  useEffect(() => {
    if (JSON.stringify(lastLayoutRef.current) !== JSON.stringify(resume.layout)) {
      // Check if the new layout matches the backend (avoid auto-save on initial sync)
      const isSyncedWithBackend = currentResume?.content?.layout && 
          JSON.stringify(resume.layout) === JSON.stringify(currentResume.content.layout);

      if (!isSyncedWithBackend) {
          debouncedSave(resume.layout);
      }
      
      lastLayoutRef.current = resume.layout;
    }
  }, [resume.layout, debouncedSave, currentResume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Convert inches to mm and vice versa
  const convertToDisplay = (inches: number): number => {
    return unit === 'inches' ? inches : inches * 25.4;
  };

  const convertFromDisplay = (value: number): number => {
    return unit === 'inches' ? value : value / 25.4;
  };

  const handleMarginChange = (side: keyof typeof pageMargins, value: number) => {
    const inchValue = convertFromDisplay(value);

    if (linkedMargins) {
      dispatch({
        type: 'UPDATE_MARGINS',
        payload: {
          top: inchValue,
          right: inchValue,
          bottom: inchValue,
          left: inchValue,
        },
      });
    } else {
      dispatch({
        type: 'UPDATE_MARGINS',
        payload: { [side]: inchValue },
      });
    }
  };

  const handleSpacingChange = (value: number) => {
    dispatch({
      type: 'UPDATE_SPACING',
      payload: { sectionSpacing: value },
    });
  };

  const handleLineHeightChange = (value: number) => {
    dispatch({
      type: 'UPDATE_SPACING',
      payload: { lineHeight: value },
    });
  };

  const applyPreset = (preset: keyof typeof MARGIN_PRESETS) => {
    dispatch({
      type: 'UPDATE_MARGINS',
      payload: MARGIN_PRESETS[preset],
    });
  };

  const handleFontSizeChange = (field: keyof typeof fontSize, value: number) => {
    dispatch({
      type: 'UPDATE_FONT_SIZES',
      payload: { [field]: value },
    });
  };

  const handleFontFamilyChange = (value: string) => {
    dispatch({
      type: 'UPDATE_FONT_FAMILY',
      payload: value,
    });
  };

  const handleColorChange = (field: keyof typeof colors, value: string) => {
    dispatch({
      type: 'UPDATE_COLORS',
      payload: { [field]: value },
    });
  };

  const applyFontSizePreset = (preset: keyof typeof FONT_SIZE_PRESETS) => {
    dispatch({
      type: 'UPDATE_FONT_SIZES',
      payload: FONT_SIZE_PRESETS[preset],
    });
  };

  const applyColorPreset = (preset: keyof typeof COLOR_PRESETS) => {
    dispatch({
      type: 'UPDATE_COLORS',
      payload: COLOR_PRESETS[preset],
    });
  };

  // Calculate contrast ratio between two colors
  const getContrastRatio = (color1: string, color2: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;

      const [rs, gs, bs] = [r, g, b].map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  const contrastRatio = getContrastRatio(colors.text, '#ffffff');
  const meetsWCAG = contrastRatio >= 4.5;

  const resetToDefaults = () => {
    dispatch({
      type: 'UPDATE_MARGINS',
      payload: DEFAULT_LAYOUT.pageMargins,
    });
    dispatch({
      type: 'UPDATE_SPACING',
      payload: {
        sectionSpacing: DEFAULT_LAYOUT.sectionSpacing,
        lineHeight: DEFAULT_LAYOUT.lineHeight,
      },
    });
    dispatch({
      type: 'UPDATE_FONT_SIZES',
      payload: DEFAULT_LAYOUT.fontSize,
    });
    dispatch({
      type: 'UPDATE_FONT_FAMILY',
      payload: DEFAULT_LAYOUT.fontFamily,
    });
    dispatch({
      type: 'UPDATE_COLORS',
      payload: DEFAULT_LAYOUT.colors,
    });
  };

  const getMinMax = () => {
    if (unit === 'inches') {
      return { min: 0.1, max: 2.0, step: 0.05 };
    }
    return { min: 2.54, max: 50.8, step: 1.27 };
  };

  const marginLimits = getMinMax();

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Global Autosave Status Indicator */}
      {(saveStatus !== "idle") && (
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 border-b border-gray-100 flex justify-end">
                {saveStatus === "saving" && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></div>
                        Autosaving Settings...
                    </span>
                )}
                {saveStatus === "saved" && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-green-600 flex items-center">
                        <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                        </svg>
                        Settings Saved
                    </span>
                )}
                {saveStatus === "error" && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-red-500 flex items-center">
                        <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sync Error
                    </span>
                )}
          </div>
      )}
      {/* Template-Specific Customization - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('template')}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2"></div>
            Template Settings
          </h3>
          {isSectionExpanded('template') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isSectionExpanded('template') && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <TemplateCustomization />
          </div>
        )}
      </div>

      {/* Page Margins - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('margins')}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
            <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mr-2" />
            Page Margins
          </h4>
          {isSectionExpanded('margins') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isSectionExpanded('margins') && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
            {/* Unit Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Unit:</span>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${unit === 'inches'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setUnit('mm')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${unit === 'mm'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  mm
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setLinkedMargins(!linkedMargins)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${linkedMargins
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
                  }`}
                title={linkedMargins ? 'Unlink margins' : 'Link margins'}
              >
                {linkedMargins ? (
                  <>
                    <Link2 className="w-3 h-3" />
                    Linked
                  </>
                ) : (
                  <>
                    <Unlink className="w-3 h-3" />
                    Unlinked
                  </>
                )}
              </button>
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Margin Presets */}
            <div className="flex gap-2">
              <button
                onClick={() => applyPreset('narrow')}
                className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              >
                Narrow
              </button>
              <button
                onClick={() => applyPreset('normal')}
                className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              >
                Normal
              </button>
              <button
                onClick={() => applyPreset('wide')}
                className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              >
                Wide
              </button>
            </div>

            {/* Individual Margin Controls */}
            <div className="space-y-3">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600 capitalize">
                      {side}
                    </label>
                    <span className="text-xs text-gray-500">
                      {convertToDisplay(pageMargins[side]).toFixed(unit === 'inches' ? 2 : 1)}
                      {unit === 'inches' ? '"' : 'mm'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={marginLimits.min}
                    max={marginLimits.max}
                    step={marginLimits.step}
                    value={convertToDisplay(pageMargins[side])}
                    onChange={(e) => handleMarginChange(side, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spacing - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('spacing')}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
            <Space className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mr-2" />
            Spacing
          </h4>
          {isSectionExpanded('spacing') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isSectionExpanded('spacing') && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
            {/* Section Spacing */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Section Spacing</label>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Space between sections</span>
                  <span className="text-xs text-gray-500">{sectionSpacing}px</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={sectionSpacing}
                  onChange={(e) => handleSpacingChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Line Height</label>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Text line spacing</span>
                  <span className="text-xs text-gray-500">{lineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={2.0}
                  step={0.1}
                  value={lineHeight}
                  onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Typography - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('typography')}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mr-2" />
            Typography
          </h4>
          {isSectionExpanded('typography') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isSectionExpanded('typography') && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
            {/* Font Size Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Size Presets</label>
              <div className="flex gap-2">
                <button
                  onClick={() => applyFontSizePreset('small')}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                >
                  Small
                </button>
                <button
                  onClick={() => applyFontSizePreset('medium')}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                >
                  Medium
                </button>
                <button
                  onClick={() => applyFontSizePreset('large')}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                >
                  Large
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily }}
              >
                {ATS_SAFE_FONTS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600">✓ ATS-safe</span>
              </div>
            </div>

            {/* Font Sizes */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Name Size</label>
                  <span className="text-xs text-gray-500">{fontSize.name}pt</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={32}
                  step={1}
                  value={fontSize.name}
                  onChange={(e) => handleFontSizeChange('name', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Title Size</label>
                  <span className="text-xs text-gray-500">{fontSize.title}pt</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={16}
                  step={1}
                  value={fontSize.title}
                  onChange={(e) => handleFontSizeChange('title', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Section Header</label>
                  <span className="text-xs text-gray-500">{fontSize.sectionHeader}pt</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={16}
                  step={1}
                  value={fontSize.sectionHeader}
                  onChange={(e) => handleFontSizeChange('sectionHeader', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Body Text</label>
                  <span className="text-xs text-gray-500">{fontSize.body}pt</span>
                </div>
                <input
                  type="range"
                  min={9}
                  max={14}
                  step={1}
                  value={fontSize.body}
                  onChange={(e) => handleFontSizeChange('body', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Management - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('data')}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mr-2" />
            Data Management
          </h4>
          {isSectionExpanded('data') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isSectionExpanded('data') && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <DataManagement />
          </div>
        )}
      </div>

      {/* Colors - Collapsible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('colors')}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 mr-2" />
            Colors
          </h4>
          {isSectionExpanded('colors') ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isSectionExpanded('colors') && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
            {/* Color Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Color Schemes</label>
              <div className="flex gap-2">
                <button
                  onClick={() => applyColorPreset('professional')}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                  title="Professional: Navy & Gray"
                >
                  Professional
                </button>
                <button
                  onClick={() => applyColorPreset('modern')}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                  title="Modern: Blue & Gray"
                >
                  Modern
                </button>
                <button
                  onClick={() => applyColorPreset('vibrant')}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                  title="Vibrant: Red & Gray"
                >
                  Vibrant
                </button>
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#2c3e50"
                />
              </div>
              <p className="text-xs text-gray-500">Used for headers and name</p>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#555555"
                />
              </div>
              <p className="text-xs text-gray-500">Used for subtitles and dates</p>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#333333"
                />
              </div>
              <p className="text-xs text-gray-500">Used for body text</p>
            </div>

            {/* Contrast Checker */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Contrast Ratio</span>
                <span className="text-xs font-mono text-gray-600">{contrastRatio.toFixed(2)}:1</span>
              </div>
              <div className="flex items-center gap-2">
                {meetsWCAG ? (
                  <>
                    <span className="text-xs text-green-600">✓ WCAG AA Compliant</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-orange-600">⚠ Low Contrast</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 4.5:1 recommended for readability
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
