import { TemplateType, LayoutSettings } from '../types/resume.types';
import { TEMPLATE_CONFIGS, TemplateConfig } from '../types/template.types';

/**
 * Template Styler Utility
 * 
 * Handles merging of template defaults with user customizations.
 * Ensures consistent styling while allowing user overrides.
 */

export interface ComputedStyles {
  fontFamily: string;
  fontSize: {
    name: number;
    title: number;
    sectionHeader: number;
    body: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  spacing: {
    pageMargins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    sectionSpacing: number;
    lineHeight: number;
  };
  layout: {
    maxWidth: number;
    columns: 1 | 2;
    columnGap?: number;
  };
  header: {
    alignment: 'left' | 'center' | 'right';
  };
  sections: {
    headerStyle: 'uppercase' | 'title-case' | 'lowercase';
    headerDecoration: 'border-bottom' | 'background' | 'none';
  };
}

/**
 * Get template configuration
 */
export const getTemplateConfig = (templateType: TemplateType): TemplateConfig => {
  return TEMPLATE_CONFIGS[templateType];
};

/**
 * Merge template defaults with user layout settings
 * User settings take precedence over template defaults
 */
export const mergeTemplateStyles = (
  templateType: TemplateType,
  userLayout: LayoutSettings
): ComputedStyles => {
  const templateConfig = getTemplateConfig(templateType);

  // Merge font sizes - user settings override template defaults
  const fontSize = {
    name: userLayout.fontSize?.name ?? templateConfig.styles.header.nameSize,
    title: userLayout.fontSize?.title ?? templateConfig.styles.header.titleSize,
    sectionHeader: userLayout.fontSize?.sectionHeader ?? templateConfig.styles.sections.headerSize,
    body: userLayout.fontSize?.body ?? 10, // Default body size
  };

  // Merge colors - user settings override template defaults
  const colors = {
    primary: userLayout.colors?.primary ?? templateConfig.styles.colors.primary,
    secondary: userLayout.colors?.secondary ?? templateConfig.styles.colors.secondary,
    text: userLayout.colors?.text ?? templateConfig.styles.colors.text,
    background: '#ffffff',
  };

  // Merge spacing - user settings override template defaults
  const spacing = {
    pageMargins: {
      top: userLayout.pageMargins?.top ?? 0.5,
      right: userLayout.pageMargins?.right ?? 0.5,
      bottom: userLayout.pageMargins?.bottom ?? 0.5,
      left: userLayout.pageMargins?.left ?? 0.5,
    },
    sectionSpacing: userLayout.sectionSpacing ?? templateConfig.styles.sections.spacing,
    lineHeight: userLayout.lineHeight ?? 1.3,
  };

  // Layout settings from template
  const layout = {
    maxWidth: templateConfig.styles.layout.maxWidth,
    columns: templateConfig.styles.layout.columns,
    columnGap: templateConfig.styles.layout.columnGap,
  };

  // Font family - user setting or template default
  const fontFamily = userLayout.fontFamily ?? getFontFamilyForTemplate(templateType);

  return {
    fontFamily,
    fontSize,
    colors,
    spacing,
    layout,
    header: {
      alignment: templateConfig.styles.header.alignment,
    },
    sections: {
      headerStyle: templateConfig.styles.sections.headerStyle,
      headerDecoration: templateConfig.styles.sections.headerDecoration,
    },
  };
};

/**
 * Get default font family for template
 */
export const getFontFamilyForTemplate = (templateType: TemplateType): string => {
  const fontMap: Record<TemplateType, string> = {
    classic: 'Times New Roman, serif',
    modern: 'Arial, Helvetica, sans-serif',
    minimal: 'Arial, Helvetica, sans-serif',
    professional: 'Arial, Helvetica, sans-serif',
    academic: 'Times New Roman, serif',
  };

  return fontMap[templateType];
};

/**
 * Apply template-specific font size adjustments
 * Some templates may need relative size adjustments
 */
export const applyFontSizeAdjustments = (
  templateType: TemplateType,
  baseFontSize: number
): number => {
  const adjustments: Record<TemplateType, number> = {
    classic: 1.0,
    modern: 1.0,
    minimal: 0.95, // Slightly smaller for space efficiency
    professional: 1.0,
    academic: 0.95,
  };

  return baseFontSize * adjustments[templateType];
};

/**
 * Get ATS-safe fonts list
 */
export const ATS_SAFE_FONTS = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Calibri, sans-serif', label: 'Calibri' },
] as const;

/**
 * Validate if font is ATS-safe
 */
export const isATSSafeFont = (fontFamily: string): boolean => {
  return ATS_SAFE_FONTS.some(font => font.value === fontFamily);
};

/**
 * Get color contrast ratio (for accessibility)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast calculation
  // In production, use a proper color contrast library
  const getLuminance = (color: string): number => {
    // Remove # if present
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  try {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 4.5; // Default safe ratio
  }
};

/**
 * Validate color accessibility
 */
export const isAccessibleColorCombination = (
  textColor: string,
  backgroundColor: string
): boolean => {
  const ratio = getContrastRatio(textColor, backgroundColor);
  return ratio >= 4.5; // WCAG AA standard
};

/**
 * Get template-specific spacing multiplier
 */
export const getSpacingMultiplier = (templateType: TemplateType): number => {
  const multipliers: Record<TemplateType, number> = {
    classic: 1.0,
    modern: 1.1, // Slightly more spacious
    minimal: 0.8, // More compact
    professional: 1.0,
    academic: 0.9,
  };

  return multipliers[templateType];
};

/**
 * Calculate optimal line height based on font size
 */
export const calculateOptimalLineHeight = (fontSize: number): number => {
  // Smaller fonts need relatively larger line height
  if (fontSize <= 9) return 1.5;
  if (fontSize <= 11) return 1.4;
  if (fontSize <= 13) return 1.3;
  return 1.2;
};

/**
 * Get print-safe page margins
 */
export const getPrintSafeMargins = (margins: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): typeof margins => {
  const MIN_MARGIN = 0.3; // Minimum 0.3 inches for print safety
  const MAX_MARGIN = 2.0; // Maximum 2 inches

  return {
    top: Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, margins.top)),
    right: Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, margins.right)),
    bottom: Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, margins.bottom)),
    left: Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, margins.left)),
  };
};

/**
 * Export computed styles for debugging
 */
export const exportComputedStyles = (styles: ComputedStyles): string => {
  return JSON.stringify(styles, null, 2);
};

/**
 * Template style presets for quick application
 */
export const TEMPLATE_PRESETS: Record<TemplateType, Partial<LayoutSettings>> = {
  classic: {
    fontFamily: 'Times New Roman, serif',
    fontSize: {
      name: 24,
      title: 14,
      sectionHeader: 12,
      body: 10,
    },
    colors: {
      primary: '#2c3e50',
      secondary: '#555',
      text: '#333',
    },
    lineHeight: 1.3,
  },
  modern: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: {
      name: 26,
      title: 16,
      sectionHeader: 14,
      body: 10,
    },
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      text: '#1f2937',
    },
    lineHeight: 1.4,
  },
  minimal: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: {
      name: 22,
      title: 12,
      sectionHeader: 10,
      body: 9,
    },
    colors: {
      primary: '#000000',
      secondary: '#666666',
      text: '#333333',
    },
    lineHeight: 1.2,
  },
  professional: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: {
      name: 22,
      title: 12,
      sectionHeader: 12,
      body: 10,
    },
    colors: {
      primary: '#2c3e50',
      secondary: '#555',
      text: '#333',
    },
    lineHeight: 1.3,
  },
  academic: {
    fontFamily: 'Times New Roman, serif',
    fontSize: {
      name: 20,
      title: 11,
      sectionHeader: 11,
      body: 10,
    },
    colors: {
      primary: '#000000',
      secondary: '#333333',
      text: '#000000',
    },
    lineHeight: 1.3,
  },
};

/**
 * Apply template preset to layout settings
 */
export const applyTemplatePreset = (
  templateType: TemplateType,
  currentLayout: LayoutSettings
): LayoutSettings => {
  const preset = TEMPLATE_PRESETS[templateType];

  return {
    ...currentLayout,
    ...preset,
    // Preserve page margins from current layout
    pageMargins: currentLayout.pageMargins,
  };
};
