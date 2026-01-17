import { TemplateType } from "./resume.types";

// Template-specific styling configurations
export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  preview: string; // Base64 or URL to preview image
  styles: {
    header: {
      nameSize: number;
      titleSize: number;
      contactSize: number;
      alignment: "left" | "center" | "right";
    };
    sections: {
      headerStyle: "uppercase" | "title-case" | "lowercase";
      headerSize: number;
      headerDecoration: "border-bottom" | "background" | "none";
      spacing: number;
    };
    layout: {
      maxWidth: number;
      columns: 1 | 2;
      columnGap?: number;
    };
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
  };
}

// Template configurations
export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional chronological format with clean typography",
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
        secondary: "#555",
        text: "#333",
        background: "#ffffff",
      },
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean, contemporary design with subtle accents",
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
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, space-efficient design",
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
  },
  professional: {
    id: "professional",
    name: "Professional",
    description:
      "Professional template based on successful backend engineer resume",
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
        secondary: "#555",
        text: "#333",
        background: "#ffffff",
      },
    },
  },
  academic: {
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
        headerDecoration: "none",
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
  },
};

// Template utility functions
export const getTemplateConfig = (templateId: TemplateType): TemplateConfig => {
  return TEMPLATE_CONFIGS[templateId];
};

export const getAllTemplates = (): TemplateConfig[] => {
  return Object.values(TEMPLATE_CONFIGS);
};

// Template-specific component props
export interface TemplateProps {
  resume: any; // Will be typed as Resume when imported
  className?: string;
}

// Template component type
export type TemplateComponent = React.ComponentType<TemplateProps>;
