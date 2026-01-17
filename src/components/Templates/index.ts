/**
 * Templates Components Export Index
 * 
 * Centralized exports for all template-related components
 */

export { TemplateBase, templateUtils } from "./TemplateBase";
export type { TemplateBaseProps } from "./TemplateBase";

//Add new templates here
// Template components
export { ClassicTemplate } from "./ClassicTemplate";
export { ModernTemplate } from "./ModernTemplate";
export { MinimalTemplate } from "./MinimalTemplate";
export { ProfessionalTemplate } from "./ProfessionalTemplate";
export { AcademicTemplate } from "./AcademicTemplate";
export { TemplateThumbnail } from "./TemplateThumbnail";


// Template configurations and types
export { TEMPLATE_CONFIGS } from "../../types/template.types";
export type { TemplateConfig } from "../../types/template.types";

// Re-export template helpers for convenience
export { templateHelpers } from "../../utils/templateHelpers";