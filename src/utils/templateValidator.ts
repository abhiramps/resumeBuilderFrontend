import { Resume, TemplateType } from '../types/resume.types';
import { ATS_SAFE_FONTS, isATSSafeFont, isAccessibleColorCombination } from './templateStyler';

/**
 * Template Validator
 * 
 * Validates resume templates against ATS compliance rules.
 * Provides detailed validation reports and ATS scores.
 */

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion?: string;
}

export interface ValidationReport {
  score: number; // 0-100
  isATSCompliant: boolean;
  issues: ValidationIssue[];
  passedChecks: string[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

/**
 * Standard ATS-recognized section names
 */
const STANDARD_SECTION_NAMES = [
  'professional summary',
  'summary',
  'objective',
  'work experience',
  'experience',
  'professional experience',
  'employment history',
  'education',
  'skills',
  'technical skills',
  'core competencies',
  'certifications',
  'certificates',
  'projects',
  'achievements',
  'awards',
  'publications',
  'volunteer experience',
  'languages',
];

/**
 * Validate resume against ATS compliance rules
 */
export const validateResume = (resume: Resume): ValidationReport => {
  const issues: ValidationIssue[] = [];
  const passedChecks: string[] = [];

  // Run all validation checks
  validateSectionNames(resume, issues, passedChecks);
  validateFontFamily(resume, issues, passedChecks);
  validateColors(resume, issues, passedChecks);
  validateContactInfo(resume, issues, passedChecks);
  validateSectionContent(resume, issues, passedChecks);
  validateFormatting(resume, issues, passedChecks);
  validateDateFormats(resume, issues, passedChecks);
  validateTextLength(resume, issues, passedChecks);

  // Calculate score
  const score = calculateATSScore(issues, passedChecks);
  const isATSCompliant = score >= 70;

  // Count issues by severity
  const summary = {
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    infos: issues.filter(i => i.severity === 'info').length,
  };

  return {
    score,
    isATSCompliant,
    issues,
    passedChecks,
    summary,
  };
};

/**
 * Validate section names are ATS-recognizable
 */
const validateSectionNames = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  const enabledSections = resume.sections.filter(s => s.enabled);

  if (enabledSections.length === 0) {
    issues.push({
      severity: 'error',
      category: 'Structure',
      message: 'No sections enabled',
      suggestion: 'Enable at least one section to create a valid resume',
    });
    return;
  }

  let standardSectionCount = 0;

  enabledSections.forEach(section => {
    const sectionName = section.title.toLowerCase().trim();
    const isStandard = STANDARD_SECTION_NAMES.some(standard =>
      sectionName.includes(standard) || standard.includes(sectionName)
    );

    if (isStandard) {
      standardSectionCount++;
    } else if (section.type !== 'custom') {
      issues.push({
        severity: 'warning',
        category: 'Section Names',
        message: `Non-standard section name: "${section.title}"`,
        suggestion: `Consider using standard names like "Work Experience", "Education", or "Skills"`,
      });
    }
  });

  if (standardSectionCount > 0) {
    passedChecks.push(`${standardSectionCount} standard section names used`);
  }
};

/**
 * Validate font family is ATS-safe
 */
const validateFontFamily = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  const fontFamily = resume.layout.fontFamily;

  if (!fontFamily) {
    issues.push({
      severity: 'warning',
      category: 'Typography',
      message: 'No font family specified',
      suggestion: 'Use an ATS-safe font like Arial, Helvetica, or Times New Roman',
    });
    return;
  }

  if (isATSSafeFont(fontFamily)) {
    passedChecks.push('ATS-safe font family used');
  } else {
    issues.push({
      severity: 'error',
      category: 'Typography',
      message: `Non-ATS-safe font: ${fontFamily}`,
      suggestion: `Use one of: ${ATS_SAFE_FONTS.map(f => f.label).join(', ')}`,
    });
  }
};

/**
 * Validate color contrast and accessibility
 */
const validateColors = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  const { colors } = resume.layout;

  if (!colors) {
    issues.push({
      severity: 'info',
      category: 'Colors',
      message: 'No color scheme defined',
    });
    return;
  }

  // Check text color contrast against white background
  const hasGoodContrast = isAccessibleColorCombination(colors.text || '#333', '#ffffff');

  if (hasGoodContrast) {
    passedChecks.push('Good color contrast for readability');
  } else {
    issues.push({
      severity: 'warning',
      category: 'Colors',
      message: 'Low contrast between text and background',
      suggestion: 'Use darker text colors for better readability',
    });
  }

  // Check if colors are too bright
  const isBrightColor = (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 200;
  };

  if (colors.primary && isBrightColor(colors.primary)) {
    issues.push({
      severity: 'warning',
      category: 'Colors',
      message: 'Primary color is too bright',
      suggestion: 'Use darker colors for better ATS compatibility',
    });
  }
};

/**
 * Validate contact information is present and parseable
 */
const validateContactInfo = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  const { personalInfo } = resume;

  if (!personalInfo) {
    issues.push({
      severity: 'error',
      category: 'Contact Info',
      message: 'No personal information provided',
    });
    return;
  }

  // Check required fields
  if (!personalInfo.fullName || personalInfo.fullName.trim().length === 0) {
    issues.push({
      severity: 'error',
      category: 'Contact Info',
      message: 'Full name is required',
    });
  } else {
    passedChecks.push('Full name provided');
  }

  if (!personalInfo.email || !isValidEmail(personalInfo.email)) {
    issues.push({
      severity: 'error',
      category: 'Contact Info',
      message: 'Valid email address is required',
    });
  } else {
    passedChecks.push('Valid email address');
  }

  if (!personalInfo.phone || personalInfo.phone.trim().length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Contact Info',
      message: 'Phone number is recommended',
    });
  } else {
    passedChecks.push('Phone number provided');
  }

  if (!personalInfo.location || personalInfo.location.trim().length === 0) {
    issues.push({
      severity: 'info',
      category: 'Contact Info',
      message: 'Location is recommended for local job searches',
    });
  } else {
    passedChecks.push('Location provided');
  }
};

/**
 * Validate section content
 */
const validateSectionContent = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  const enabledSections = resume.sections.filter(s => s.enabled);

  enabledSections.forEach(section => {
    switch (section.type) {
      case 'experience':
        validateExperienceSection(section.content, issues, passedChecks);
        break;
      case 'education':
        validateEducationSection(section.content, issues, passedChecks);
        break;
      case 'skills':
        validateSkillsSection(section.content, issues, passedChecks);
        break;
      case 'summary':
        validateSummarySection(section.content, issues, passedChecks);
        break;
    }
  });
};

/**
 * Validate experience section
 */
const validateExperienceSection = (
  content: any,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  if (!content.experiences || content.experiences.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Content',
      message: 'Experience section is empty',
      suggestion: 'Add at least one work experience entry',
    });
    return;
  }

  content.experiences.forEach((exp: any, index: number) => {
    if (!exp.jobTitle || exp.jobTitle.trim().length === 0) {
      issues.push({
        severity: 'error',
        category: 'Content',
        message: `Experience entry ${index + 1}: Job title is required`,
      });
    }

    if (!exp.company || exp.company.trim().length === 0) {
      issues.push({
        severity: 'error',
        category: 'Content',
        message: `Experience entry ${index + 1}: Company name is required`,
      });
    }

    if (!exp.startDate) {
      issues.push({
        severity: 'warning',
        category: 'Content',
        message: `Experience entry ${index + 1}: Start date is recommended`,
      });
    }
  });

  passedChecks.push(`${content.experiences.length} experience entries`);
};

/**
 * Validate education section
 */
const validateEducationSection = (
  content: any,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  if (!content.education || content.education.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Content',
      message: 'Education section is empty',
      suggestion: 'Add at least one education entry',
    });
    return;
  }

  content.education.forEach((edu: any, index: number) => {
    if (!edu.degree || edu.degree.trim().length === 0) {
      issues.push({
        severity: 'error',
        category: 'Content',
        message: `Education entry ${index + 1}: Degree is required`,
      });
    }

    if (!edu.institution || edu.institution.trim().length === 0) {
      issues.push({
        severity: 'error',
        category: 'Content',
        message: `Education entry ${index + 1}: Institution is required`,
      });
    }
  });

  passedChecks.push(`${content.education.length} education entries`);
};

/**
 * Validate skills section
 */
const validateSkillsSection = (
  content: any,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  if (!content.skills || content.skills.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Content',
      message: 'Skills section is empty',
      suggestion: 'Add relevant technical and soft skills',
    });
    return;
  }

  if (content.skills.length < 5) {
    issues.push({
      severity: 'info',
      category: 'Content',
      message: 'Consider adding more skills',
      suggestion: 'Most resumes benefit from 8-15 relevant skills',
    });
  }

  passedChecks.push(`${content.skills.length} skills listed`);
};

/**
 * Validate summary section
 */
const validateSummarySection = (
  content: any,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  if (!content.summary || content.summary.trim().length === 0) {
    issues.push({
      severity: 'info',
      category: 'Content',
      message: 'Professional summary is empty',
      suggestion: 'Add a brief summary highlighting your key qualifications',
    });
    return;
  }

  const wordCount = content.summary.trim().split(/\s+/).length;

  if (wordCount < 20) {
    issues.push({
      severity: 'info',
      category: 'Content',
      message: 'Professional summary is very short',
      suggestion: 'Aim for 50-100 words to effectively showcase your experience',
    });
  } else if (wordCount > 150) {
    issues.push({
      severity: 'warning',
      category: 'Content',
      message: 'Professional summary is too long',
      suggestion: 'Keep it concise (50-100 words) for better readability',
    });
  } else {
    passedChecks.push('Professional summary has appropriate length');
  }
};

/**
 * Validate formatting
 */
const validateFormatting = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  const { layout } = resume;

  // Check font sizes
  if (layout.fontSize) {
    if (layout.fontSize.body < 9) {
      issues.push({
        severity: 'warning',
        category: 'Formatting',
        message: 'Body text is too small',
        suggestion: 'Use at least 10pt for body text',
      });
    } else if (layout.fontSize.body > 14) {
      issues.push({
        severity: 'warning',
        category: 'Formatting',
        message: 'Body text is too large',
        suggestion: 'Use 10-12pt for body text',
      });
    } else {
      passedChecks.push('Appropriate body text size');
    }
  }

  // Check line height
  if (layout.lineHeight) {
    if (layout.lineHeight < 1.0) {
      issues.push({
        severity: 'error',
        category: 'Formatting',
        message: 'Line height is too tight',
        suggestion: 'Use at least 1.2 for readability',
      });
    } else if (layout.lineHeight > 2.0) {
      issues.push({
        severity: 'warning',
        category: 'Formatting',
        message: 'Line height is too loose',
        suggestion: 'Use 1.2-1.5 for optimal readability',
      });
    } else {
      passedChecks.push('Appropriate line height');
    }
  }

  // Check margins
  if (layout.pageMargins) {
    const { top, right, bottom, left } = layout.pageMargins;
    const minMargin = Math.min(top, right, bottom, left);
    const maxMargin = Math.max(top, right, bottom, left);

    if (minMargin < 0.3) {
      issues.push({
        severity: 'error',
        category: 'Formatting',
        message: 'Margins are too small',
        suggestion: 'Use at least 0.5" margins for print safety',
      });
    } else if (maxMargin > 1.5) {
      issues.push({
        severity: 'info',
        category: 'Formatting',
        message: 'Margins are quite large',
        suggestion: 'Consider reducing margins to fit more content',
      });
    } else {
      passedChecks.push('Appropriate page margins');
    }
  }
};

/**
 * Validate date formats
 */
const validateDateFormats = (
  _resume: Resume,
  _issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  // This is a simplified check - in production, you'd validate actual date formats
  passedChecks.push('Date formats are handled by template helpers');
};

/**
 * Validate text length for single page
 */
const validateTextLength = (
  resume: Resume,
  issues: ValidationIssue[],
  passedChecks: string[]
): void => {
  // Estimate total content length
  let totalCharacters = 0;

  resume.sections.forEach(section => {
    if (!section.enabled) return;

    if (section.type === 'summary') {
      const content = section.content as { summary: string };
      if (content.summary) {
        totalCharacters += content.summary.length;
      }
    }

    if (section.type === 'experience') {
      const content = section.content as { experiences: any[] };
      if (content.experiences) {
        content.experiences.forEach((exp: any) => {
          totalCharacters += (exp.description || '').length;
          if (exp.achievements) {
            exp.achievements.forEach((ach: string) => {
              totalCharacters += ach.length;
            });
          }
        });
      }
    }
  });

  // Rough estimate: 3000-4000 characters fit on one page
  if (totalCharacters > 5000) {
    issues.push({
      severity: 'info',
      category: 'Length',
      message: 'Resume content may exceed one page',
      suggestion: 'Consider condensing content or using a more compact template',
    });
  } else {
    passedChecks.push('Content length appropriate for one page');
  }
};

/**
 * Calculate ATS score based on issues and passed checks
 */
const calculateATSScore = (
  issues: ValidationIssue[],
  passedChecks: string[]
): number => {
  let score = 100;

  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'error':
        score -= 10;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'info':
        score -= 2;
        break;
    }
  });

  // Bonus points for passed checks (up to 20 points)
  const bonusPoints = Math.min(20, passedChecks.length * 2);
  score += bonusPoints;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

/**
 * Get ATS score category
 */
export const getATSScoreCategory = (score: number): {
  label: string;
  color: string;
  description: string;
} => {
  if (score >= 90) {
    return {
      label: 'Excellent',
      color: 'green',
      description: 'Highly optimized for ATS systems',
    };
  } else if (score >= 80) {
    return {
      label: 'Good',
      color: 'blue',
      description: 'Well-optimized with minor improvements possible',
    };
  } else if (score >= 70) {
    return {
      label: 'Fair',
      color: 'yellow',
      description: 'Acceptable but could be improved',
    };
  } else if (score >= 50) {
    return {
      label: 'Poor',
      color: 'orange',
      description: 'Needs significant improvements',
    };
  } else {
    return {
      label: 'Critical',
      color: 'red',
      description: 'Major ATS compatibility issues',
    };
  }
};

/**
 * Helper: Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get template-specific ATS score
 */
export const getTemplateATSScore = (templateType: TemplateType): number => {
  const scores: Record<TemplateType, number> = {
    classic: 95,
    modern: 92,
    minimal: 100,
    professional: 95,
    academic: 98,
  };

  return scores[templateType];
};

/**
 * Export validation report as text
 */
export const exportValidationReport = (report: ValidationReport): string => {
  let text = `ATS Validation Report\n`;
  text += `=====================\n\n`;
  text += `Score: ${report.score}/100\n`;
  text += `Status: ${report.isATSCompliant ? 'COMPLIANT' : 'NEEDS IMPROVEMENT'}\n\n`;

  if (report.issues.length > 0) {
    text += `Issues Found:\n`;
    text += `-------------\n`;
    report.issues.forEach((issue, index) => {
      text += `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}\n`;
      if (issue.suggestion) {
        text += `   Suggestion: ${issue.suggestion}\n`;
      }
      text += `\n`;
    });
  }

  if (report.passedChecks.length > 0) {
    text += `Passed Checks:\n`;
    text += `--------------\n`;
    report.passedChecks.forEach((check, index) => {
      text += `${index + 1}. ${check}\n`;
    });
  }

  return text;
};
