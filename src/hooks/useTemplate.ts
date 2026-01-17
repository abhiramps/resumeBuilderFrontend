import { useCallback, useMemo } from "react";
import { useResumeContext } from "../contexts/ResumeContext";
import { TemplateType, LayoutSettings } from "../types/resume.types";
import { TEMPLATE_CONFIGS } from "../types/template.types";

/**
 * useTemplate Hook
 * 
 * Provides template management functionality:
 * - Get current template configuration
 * - Switch templates
 * - Apply template defaults
 * - Get available templates
 * - Template validation
 */
export const useTemplate = () => {
  const { resume, dispatch } = useResumeContext();

  /**
   * Get current template configuration
   */
  const currentTemplate = useMemo(() => {
    return TEMPLATE_CONFIGS[resume.template] || TEMPLATE_CONFIGS.professional;
  }, [resume.template]);

  /**
   * Get all available template configurations
   */
  const availableTemplates = useMemo(() => {
    return Object.values(TEMPLATE_CONFIGS);
  }, []);

  /**
   * Switch to a different template
   * @param templateId - Template ID to switch to
   * @param preserveLayout - Whether to preserve current layout settings
   */
  const switchTemplate = useCallback((templateId: TemplateType, preserveLayout: boolean = false) => {
    const templateConfig = TEMPLATE_CONFIGS[templateId];

    if (!templateConfig) {
      console.error(`Template ${templateId} not found`);
      return;
    }

    // Update template
    dispatch({
      type: "SET_TEMPLATE",
      payload: templateId,
    });

    // Apply template defaults if not preserving layout
    if (!preserveLayout) {
      // Convert template styles to layout settings
      const defaultLayout: Partial<LayoutSettings> = {
        fontSize: {
          name: templateConfig.styles.header.nameSize,
          title: templateConfig.styles.header.titleSize,
          sectionHeader: templateConfig.styles.sections.headerSize,
          body: 11, // Default body size
        },
        colors: {
          primary: templateConfig.styles.colors.primary,
          secondary: templateConfig.styles.colors.secondary,
          text: templateConfig.styles.colors.text,
        },
        sectionSpacing: templateConfig.styles.sections.spacing,
      };

      dispatch({
        type: "UPDATE_LAYOUT",
        payload: defaultLayout,
      });
    }
  }, [dispatch]);

  /**
   * Apply template default layout settings
   * @param templateId - Template ID (optional, uses current if not provided)
   */
  const applyTemplateDefaults = useCallback((templateId?: TemplateType) => {
    const targetTemplate = templateId || resume.template;
    const templateConfig = TEMPLATE_CONFIGS[targetTemplate];

    if (templateConfig) {
      // Convert template styles to layout settings
      const defaultLayout: Partial<LayoutSettings> = {
        fontSize: {
          name: templateConfig.styles.header.nameSize,
          title: templateConfig.styles.header.titleSize,
          sectionHeader: templateConfig.styles.sections.headerSize,
          body: 11, // Default body size
        },
        colors: {
          primary: templateConfig.styles.colors.primary,
          secondary: templateConfig.styles.colors.secondary,
          text: templateConfig.styles.colors.text,
        },
        sectionSpacing: templateConfig.styles.sections.spacing,
      };

      dispatch({
        type: "UPDATE_LAYOUT",
        payload: defaultLayout,
      });
    }
  }, [resume.template, dispatch]);

  /**
   * Reset template to default settings
   */
  const resetTemplate = useCallback(() => {
    applyTemplateDefaults();
  }, [applyTemplateDefaults]);

  /**
   * Get template by ID
   * @param templateId - Template ID
   * @returns Template configuration or undefined
   */
  const getTemplate = useCallback((templateId: TemplateType) => {
    return TEMPLATE_CONFIGS[templateId];
  }, []);

  /**
   * Check if template supports specific customization
   * @param customization - Customization type to check
   * @returns Boolean indicating support
   */
  const supportsCustomization = useCallback((customization: string) => {
    // All templates support basic customizations
    const supportedCustomizations = ['colors', 'fonts', 'spacing', 'margins'];
    return supportedCustomizations.includes(customization);
  }, []);

  /**
   * Get template recommendations based on resume content
   * @returns Array of recommended template IDs
   */
  const getRecommendations = useCallback(() => {
    const recommendations: TemplateType[] = [];

    // Analyze resume content
    const hasProjects = resume.sections.some(s => s.type === 'projects' && s.enabled);
    const hasSkills = resume.sections.some(s => s.type === 'skills' && s.enabled);
    const experienceCount = resume.sections
      .find(s => s.type === 'experience')?.content as any;
    const hasMultipleExperiences = experienceCount?.experiences?.length > 2;

    // Recommend based on content
    if (hasProjects && hasSkills) {
      recommendations.push('modern', 'professional');
    }

    if (hasMultipleExperiences) {
      recommendations.push('classic', 'minimal');
    }

    // Always include current template
    if (!recommendations.includes(resume.template)) {
      recommendations.unshift(resume.template);
    }

    return recommendations;
  }, [resume]);

  /**
   * Validate template compatibility with resume content
   * @param templateId - Template ID to validate
   * @returns Validation result with score and issues
   */
  const validateTemplate = useCallback((templateId: TemplateType) => {
    const templateConfig = getTemplate(templateId);
    if (!templateConfig) {
      return {
        score: 0,
        issues: ['Template not found'],
        compatible: false,
      };
    }

    const issues: string[] = [];
    let score = 100;

    // All templates are ATS compliant by design
    const atsScores = {
      classic: 95,
      modern: 90,
      minimal: 98,
      professional: 100,
      academic: 98,
    };

    const atsScore = atsScores[templateId];
    if (atsScore < 90) {
      issues.push('Template may have ATS compatibility issues');
      score -= 10;
    }

    // Check content compatibility
    const enabledSections = resume.sections.filter(s => s.enabled);
    if (enabledSections.length > 6 && templateId === 'minimal') {
      issues.push('Minimal template may not accommodate all sections well');
      score -= 15;
    }

    // Check for missing required sections
    const hasExperience = resume.sections.some(s => s.type === 'experience' && s.enabled);
    const hasEducation = resume.sections.some(s => s.type === 'education' && s.enabled);

    if (!hasExperience) {
      issues.push('Experience section is recommended for professional templates');
      score -= 10;
    }

    if (!hasEducation) {
      issues.push('Education section is recommended');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      compatible: score >= 70,
    };
  }, [resume, getTemplate]);

  /**
   * Get template preview data
   * @param templateId - Template ID
   * @returns Preview configuration
   */
  const getTemplatePreview = useCallback((templateId: TemplateType) => {
    const templateConfig = getTemplate(templateId);
    if (!templateConfig) return null;

    const atsScores = {
      classic: 95,
      modern: 90,
      minimal: 98,
      professional: 100,
      academic: 98,
    };

    const bestForMap = {
      classic: ['Traditional industries', 'Conservative companies', 'Senior roles'],
      modern: ['Tech companies', 'Startups', 'Creative roles'],
      minimal: ['Academic positions', 'Research roles', 'Content-heavy resumes'],
      professional: ['Backend engineering', 'DevOps', 'Technical leadership'],
      academic: ['Academic positions', 'Research roles', 'FAANG applications', 'Graduate students'],
    };

    return {
      id: templateConfig.id,
      name: templateConfig.name,
      description: templateConfig.description,
      thumbnail: templateConfig.preview,
      atsScore: atsScores[templateId],
      bestFor: bestForMap[templateId],
      validation: validateTemplate(templateId),
    };
  }, [getTemplate, validateTemplate]);

  /**
   * Compare templates
   * @param templateIds - Array of template IDs to compare
   * @returns Comparison data
   */
  const compareTemplates = useCallback((templateIds: TemplateType[]) => {
    return templateIds.map(id => ({
      template: getTemplate(id),
      preview: getTemplatePreview(id),
      validation: validateTemplate(id),
    })).filter(item => item.template);
  }, [getTemplate, getTemplatePreview, validateTemplate]);

  return {
    // Current state
    currentTemplate,
    availableTemplates,

    // Actions
    switchTemplate,
    applyTemplateDefaults,
    resetTemplate,

    // Utilities
    getTemplate,
    supportsCustomization,
    getRecommendations,
    validateTemplate,
    getTemplatePreview,
    compareTemplates,
  };
};

export default useTemplate;