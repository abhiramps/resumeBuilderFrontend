import { TemplateType } from "../types/resume.types";
import { TemplateConfig } from "../types/template.types";

/**
 * Template configurations for all available resume templates
 * Each template includes default layout settings and customization options
 */

// Classic Template Configuration
export const CLASSIC_TEMPLATE_CONFIG: TemplateConfig = {
  id: "classic",
  name: "Classic",
  description:
    "Traditional chronological format with clean typography and professional appearance",
  preview: "",
  styles: {
    header: {
      nameSize: 24,
      titleSize: 14,
      contactSize: 10,
      alignment: "left",
    },
    sections: {
      headerStyle: "uppercase",
      headerSize: 12,
      headerDecoration: "border-bottom",
      spacing: 16,
    },
    layout: {
      maxWidth: 800,
      columns: 1,
    },
    colors: {
      primary: "#2c3e50",
      secondary: "#555555",
      text: "#333333",
      background: "#ffffff",
    },
  },
};

// Modern Template Configuration
export const MODERN_TEMPLATE_CONFIG: TemplateConfig = {
  id: "modern",
  name: "Modern",
  description:
    "Clean, contemporary design with subtle accents and improved readability",
  preview: "",
  styles: {
    header: {
      nameSize: 26,
      titleSize: 16,
      contactSize: 11,
      alignment: "center",
    },
    sections: {
      headerStyle: "title-case",
      headerSize: 14,
      headerDecoration: "background",
      spacing: 20,
    },
    layout: {
      maxWidth: 850,
      columns: 1,
    },
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      text: "#1e293b",
      background: "#ffffff",
    },
  },
};

// Minimal Template Configuration
export const MINIMAL_TEMPLATE_CONFIG: TemplateConfig = {
  id: "minimal",
  name: "Minimal",
  description: "Ultra-clean, space-efficient design with maximum content focus",
  preview: "",
  styles: {
    header: {
      nameSize: 22,
      titleSize: 12,
      contactSize: 9,
      alignment: "left",
    },
    sections: {
      headerStyle: "uppercase",
      headerSize: 10,
      headerDecoration: "none",
      spacing: 12,
    },
    layout: {
      maxWidth: 750,
      columns: 1,
    },
    colors: {
      primary: "#000000",
      secondary: "#666666",
      text: "#333333",
      background: "#ffffff",
    },
  },
};

// Professional Template Configuration (Based on successful backend engineer resume)
export const PROFESSIONAL_TEMPLATE_CONFIG: TemplateConfig = {
  id: "professional",
  name: "Professional",
  description:
    "Professional template optimized for backend engineers with proven ATS success",
  preview: "",
  styles: {
    header: {
      nameSize: 22,
      titleSize: 12,
      contactSize: 9,
      alignment: "center",
    },
    sections: {
      headerStyle: "uppercase",
      headerSize: 12,
      headerDecoration: "border-bottom",
      spacing: 18,
    },
    layout: {
      maxWidth: 800,
      columns: 1,
    },
    colors: {
      primary: "#2c3e50",
      secondary: "#555555",
      text: "#333333",
      background: "#ffffff",
    },
  },
};

// Academic Template Configuration (LaTeX-inspired)
export const ACADEMIC_TEMPLATE_CONFIG: TemplateConfig = {
  id: "academic",
  name: "Academic",
  description: "LaTeX-inspired academic resume for research and FAANG positions",
  preview: "",
  styles: {
    header: {
      nameSize: 20,
      titleSize: 11,
      contactSize: 10,
      alignment: "center",
    },
    sections: {
      headerStyle: "uppercase",
      headerSize: 11,
      headerDecoration: "border-bottom",
      spacing: 16,
    },
    layout: {
      maxWidth: 800,
      columns: 1,
    },
    colors: {
      primary: "#000000",
      secondary: "#333333",
      text: "#000000",
      background: "#ffffff",
    },
  },
};

// Template configurations mapping
export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  classic: CLASSIC_TEMPLATE_CONFIG,
  modern: MODERN_TEMPLATE_CONFIG,
  minimal: MINIMAL_TEMPLATE_CONFIG,
  professional: PROFESSIONAL_TEMPLATE_CONFIG,
  academic: ACADEMIC_TEMPLATE_CONFIG,
};

// Default layout settings for each template
export const TEMPLATE_DEFAULT_LAYOUTS = {
  classic: {
    pageMargins: { top: 1.0, right: 1.0, bottom: 1.0, left: 1.0 },
    sectionSpacing: 16,
    lineHeight: 1.4,
    fontSize: { name: 24, title: 14, sectionHeader: 12, body: 11 },
    fontFamily: "Times New Roman",
    colors: { primary: "#2c3e50", secondary: "#555555", text: "#333333" },
  },

  modern: {
    pageMargins: { top: 1.0, right: 1.0, bottom: 1.0, left: 1.0 },
    sectionSpacing: 20,
    lineHeight: 1.5,
    fontSize: { ingress: 26, title: 16, sectionHeader: 14, body: 11 },
    fontFamily: "Arial",
    colors: { primary: "#2563eb", secondary: "#64748b", text: "#1e293b" },
  },

  minimal: {
    pageMargins: { top: 0.8, right: 0.8, bottom: 0.8, left: 0.8 },
    sectionSpacing: 12,
    lineHeight: 1.3,
    fontSize: { name: 22, title: 12, sectionHeader: 10, body: 10 },
    fontFamily: "Arial",
    colors: { primary: "#000000", secondary: "#666666", text: "#333333" },
  },

  professional: {
    pageMargins: { top: 1.0, right: 1.0, bottom: 1.0, left: 1.0 },
    sectionSpacing: 18,
    lineHeight: 1.4,
    fontSize: { name: 22, title: 12, sectionHeader: 12, body: 11 },
    fontFamily: "Arial",
    colors: { primary: "#2c3e50", secondary: "#555555", text: "#333333" },
  },

  academic: {
    pageMargins: { top: 0.4, right: 0.4, bottom: 0.4, left: 0.4 },
    sectionSpacing: 16,
    lineHeight: 1.3,
    fontSize: { name: 20, title: 11, sectionHeader: 11, body: 10 },
    fontFamily: "Times New Roman",
    colors: { primary: "#000000", secondary: "#333333", text: "#000000" },
  },
} as const;

// Customization capabilities for each template
export const TEMPLATE_CUSTOMIZATION_OPTIONS = {
  classic: {
    customizableColors: ["primary", "secondary"],
    customizableFonts: true,
    customizableSpacing: true,
    customizableMargins: true,
    maxColumns: 1,
    supportsImages: false,
    supportsTables: false,
    atsCompliant: true,
  },

  modern: {
    customizableColors: ["primary", "secondary", "text"],
    customizableFonts: true,
    customizableSpacing: true,
    customizableMargins: true,
    maxColumns: 1,
    supportsImages: false,
    supportsTables: false,
    atsCompliant: true,
  },

  minimal: {
    customizableColors: ["primary", "secondary"],
    customizableFonts: true,
    customizableSpacing: true,
    customizableMargins: true,
    maxColumns: 1,
    supportsImages: false,
    supportsTables: false,
    atsCompliant: true,
  },

  professional: {
    customizableColors: ["primary", "secondary"],
    customizableFonts: true,
    customizableSpacing: true,
    customizableMargins: true,
    maxColumns: 1,
    supportsImages: false,
    supportsTables: false,
    atsCompliant: true,
  },

  academic: {
    customizableColors: ["primary", "secondary"],
    customizableFonts: true,
    customizableSpacing: true,
    customizableMargins: true,
    maxColumns: 1,
    supportsImages: false,
    supportsTables: false,
    atsCompliant: true,
  },
} as const;

// Template recommendations based on industry/role
export const TEMPLATE_RECOMMENDATIONS = {
  "software-engineer": {
    recommended: ["professional", "modern"],
    reasoning:
      "Clean, technical-focused layouts work best for engineering roles",
  },

  "frontend-developer": {
    recommended: ["modern", "classic"],
    reasoning:
      "Modern designs appeal to frontend developers while maintaining professionalism",
  },

  "backend-developer": {
    recommended: ["professional", "classic"],
    reasoning: "Traditional layouts emphasize technical skills and experience",
  },

  "fullstack-developer": {
    recommended: ["professional", "modern"],
    reasoning: "Balanced approach showcasing both technical and design skills",
  },

  "devops-engineer": {
    recommended: ["professional", "minimal"],
    reasoning:
      "Technical focus with clean presentation of tools and technologies",
  },

  "data-scientist": {
    recommended: ["classic", "professional"],
    reasoning:
      "Professional layouts that highlight analytical and technical skills",
  },

  "product-manager": {
    recommended: ["modern", "classic"],
    reasoning:
      "Clean, business-focused layouts that emphasize leadership and strategy",
  },
} as const;

// Utility functions
export const getTemplateConfig = (templateId: TemplateType): TemplateConfig => {
  return TEMPLATE_CONFIGS[templateId];
};

export const getAllTemplates = (): TemplateConfig[] => {
  return Object.values(TEMPLATE_CONFIGS);
};

export const getTemplateDefaultLayout = (templateId: TemplateType) => {
  return TEMPLATE_DEFAULT_LAYOUTS[templateId];
};

export const getTemplateCustomizationOptions = (templateId: TemplateType) => {
  return TEMPLATE_CUSTOMIZATION_OPTIONS[templateId];
};

export const getRecommendedTemplates = (role: string): TemplateConfig[] => {
  const recommendation =
    TEMPLATE_RECOMMENDATIONS[role as keyof typeof TEMPLATE_RECOMMENDATIONS];
  if (!recommendation) {
    return [PROFESSIONAL_TEMPLATE_CONFIG, CLASSIC_TEMPLATE_CONFIG];
  }

  return recommendation.recommended.map((id) => TEMPLATE_CONFIGS[id]);
};

export const isTemplateATSCompliant = (templateId: TemplateType): boolean => {
  return TEMPLATE_CUSTOMIZATION_OPTIONS[templateId].atsCompliant;
};

// Template comparison data
export const TEMPLATE_COMPARISON = {
  classic: {
    atsScore: 95,
    readabilityScore: 90,
    customizationScore: 85,
    modernAppeal: 70,
    bestFor: [
      "Traditional industries",
      "Conservative companies",
      "Senior roles",
    ],
  },

  modern: {
    atsScore: 90,
    readabilityScore: 95,
    customizationScore: 90,
    modernAppeal: 95,
    bestFor: ["Tech companies", "Startups", "Creative roles"],
  },

  minimal: {
    atsScore: 98,
    readabilityScore: 85,
    customizationScore: 75,
    modernAppeal: 80,
    bestFor: ["Academic positions", "Research roles", "Content-heavy resumes"],
  },

  professional: {
    atsScore: 100,
    readabilityScore: 88,
    customizationScore: 80,
    modernAppeal: 75,
    bestFor: ["Backend engineering", "DevOps", "Technical leadership"],
  },
} as const;
