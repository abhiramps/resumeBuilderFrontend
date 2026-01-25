import { Resume, ATSValidation, ATSIssue } from '../types/resume.types';

/**
 * ATS-safe fonts that are widely supported by Applicant Tracking Systems
 */
const ATS_SAFE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Calibri',
];

/**
 * Standard section headers recognized by ATS systems
 */
const STANDARD_SECTION_HEADERS = [
  'professional summary',
  'summary',
  'work experience',
  'experience',
  'projects',
  'technical skills',
  'skills',
  'education',
  'certifications',
  'additional information',
];

/**
 * Special characters that may cause parsing issues in ATS
 */
const PROBLEMATIC_CHARACTERS = /[•◦▪▫■□●○◆◇★☆♦♣♠♥]/g;

/**
 * Validates email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (flexible for international formats)
 */
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Checks if date format is ATS-friendly (MM/YYYY or Month YYYY)
 * Also accepts YYYY-MM format used for internal storage
 */
const isValidDateFormat = (date: string): boolean => {
  if (!date || date.toLowerCase() === 'present') return true;
  
  // Accept formats: 
  // - MM/YYYY (e.g., "01/2020")
  // - Month YYYY (e.g., "January 2020" or "Jan 2020")
  // - YYYY (e.g., "2020")
  // - YYYY-MM (internal storage format, e.g., "2020-01")
  // - YYYY-MM-DD (ISO format, e.g., "2020-01-15")
  const dateRegex = /^(\d{1,2}\/\d{4}|[A-Za-z]+\s\d{4}|\d{4}|\d{4}-\d{2}|\d{4}-\d{2}-\d{2})$/;
  return dateRegex.test(date.trim());
};

/**
 * Calculates keyword density for a given text
 */
const calculateKeywordDensity = (text: string): number => {
  if (!text) return 0;
  
  const words = text.split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  
  return uniqueWords.size / Math.max(words.length, 1);
};

/**
 * Validates contact information
 */
const validateContactInfo = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { personalInfo } = resume;

  if (!personalInfo.fullName?.trim()) {
    issues.push({
      id: 'missing-name',
      type: 'error',
      message: 'Full name is required',
      section: 'Personal Information',
      suggestion: 'Add your full name to the personal information section',
    });
  }

  if (!personalInfo.email?.trim()) {
    issues.push({
      id: 'missing-email',
      type: 'error',
      message: 'Email address is required',
      section: 'Personal Information',
      suggestion: 'Add a valid email address',
    });
  } else if (!isValidEmail(personalInfo.email)) {
    issues.push({
      id: 'invalid-email',
      type: 'error',
      message: 'Email format is invalid',
      section: 'Personal Information',
      suggestion: 'Use a valid email format (e.g., name@example.com)',
    });
  }

  if (!personalInfo.phone?.trim()) {
    issues.push({
      id: 'missing-phone',
      type: 'warning',
      message: 'Phone number is recommended',
      section: 'Personal Information',
      suggestion: 'Add your phone number for better contact options',
    });
  } else if (!isValidPhone(personalInfo.phone)) {
    issues.push({
      id: 'invalid-phone',
      type: 'warning',
      message: 'Phone number format may not be recognized',
      section: 'Personal Information',
      suggestion: 'Use a standard format (e.g., +1-234-567-8900)',
    });
  }

  if (!personalInfo.location?.trim()) {
    issues.push({
      id: 'missing-location',
      type: 'info',
      message: 'Location is helpful for ATS matching',
      section: 'Personal Information',
      suggestion: 'Add your city and state/country',
    });
  }

  return issues;
};

/**
 * Validates font selection for ATS compatibility
 */
const validateFont = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { fontFamily } = resume.layout;

  if (!ATS_SAFE_FONTS.includes(fontFamily)) {
    issues.push({
      id: 'unsafe-font',
      type: 'warning',
      message: 'Font may not be ATS-compliant',
      section: 'Layout',
      suggestion: `Use one of these ATS-safe fonts: ${ATS_SAFE_FONTS.join(', ')}`,
    });
  }

  return issues;
};

/**
 * Validates section headers for ATS recognition
 */
const validateSectionHeaders = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { sections } = resume;

  sections.forEach((section) => {
    if (!section.enabled) return;

    const normalizedTitle = section.title.toLowerCase().trim();
    const isStandard = STANDARD_SECTION_HEADERS.some(
      (header) => normalizedTitle.includes(header) || header.includes(normalizedTitle)
    );

    if (!isStandard && section.type !== 'custom') {
      issues.push({
        id: `non-standard-header-${section.id}`,
        type: 'info',
        message: `Section header "${section.title}" may not be recognized by ATS`,
        section: section.title,
        suggestion: 'Consider using standard headers like "Work Experience", "Skills", "Education"',
      });
    }
  });

  return issues;
};

/**
 * Validates required sections presence
 */
const validateRequiredSections = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { sections } = resume;

  const enabledSections = sections.filter((s) => s.enabled);
  const sectionTypes = enabledSections.map((s) => s.type);

  if (!sectionTypes.includes('experience')) {
    issues.push({
      id: 'missing-experience',
      type: 'warning',
      message: 'Work experience section is missing',
      section: 'Sections',
      suggestion: 'Add a work experience section to showcase your professional background',
    });
  }

  if (!sectionTypes.includes('skills')) {
    issues.push({
      id: 'missing-skills',
      type: 'warning',
      message: 'Skills section is missing',
      section: 'Sections',
      suggestion: 'Add a skills section to highlight your technical abilities',
    });
  }

  if (!sectionTypes.includes('education')) {
    issues.push({
      id: 'missing-education',
      type: 'info',
      message: 'Education section is recommended',
      section: 'Sections',
      suggestion: 'Add your educational background',
    });
  }

  return issues;
};

/**
 * Validates date formats in experience and education sections
 */
const validateDateFormats = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { sections } = resume;

  sections.forEach((section) => {
    if (!section.enabled) return;

    if (section.type === 'experience') {
      const experiences = (section.content as any).experiences || [];
      experiences.forEach((exp: any, index: number) => {
        if (exp.startDate && !isValidDateFormat(exp.startDate)) {
          issues.push({
            id: `invalid-exp-start-date-${exp.id}`,
            type: 'warning',
            message: `Experience #${index + 1}: Start date format may not be recognized`,
            section: section.title,
            suggestion: 'Use format: MM/YYYY or Month YYYY (e.g., 01/2020 or January 2020)',
          });
        }
        if (exp.endDate && !exp.current && !isValidDateFormat(exp.endDate)) {
          issues.push({
            id: `invalid-exp-end-date-${exp.id}`,
            type: 'warning',
            message: `Experience #${index + 1}: End date format may not be recognized`,
            section: section.title,
            suggestion: 'Use format: MM/YYYY or Month YYYY, or mark as "Present"',
          });
        }
      });
    }

    if (section.type === 'education') {
      const education = (section.content as any).education || [];
      education.forEach((edu: any, index: number) => {
        if (edu.startDate && !isValidDateFormat(edu.startDate)) {
          issues.push({
            id: `invalid-edu-start-date-${edu.id}`,
            type: 'warning',
            message: `Education #${index + 1}: Start date format may not be recognized`,
            section: section.title,
            suggestion: 'Use format: MM/YYYY or Month YYYY',
          });
        }
        if (edu.endDate && !isValidDateFormat(edu.endDate)) {
          issues.push({
            id: `invalid-edu-end-date-${edu.id}`,
            type: 'warning',
            message: `Education #${index + 1}: End date format may not be recognized`,
            section: section.title,
            suggestion: 'Use format: MM/YYYY or Month YYYY',
          });
        }
      });
    }
  });

  return issues;
};

/**
 * Validates content for problematic special characters
 */
const validateSpecialCharacters = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { sections } = resume;

  sections.forEach((section) => {
    if (!section.enabled) return;

    const contentStr = JSON.stringify(section.content);
    if (PROBLEMATIC_CHARACTERS.test(contentStr)) {
      issues.push({
        id: `special-chars-${section.id}`,
        type: 'warning',
        message: `Section "${section.title}" contains special characters that may not parse correctly`,
        section: section.title,
        suggestion: 'Replace decorative bullets with standard hyphens or asterisks',
      });
    }
  });

  return issues;
};

/**
 * Validates resume length (page count estimation)
 */
const validateLength = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { sections } = resume;

  // Rough estimation: count total content length
  let totalContentLength = 0;
  sections.forEach((section) => {
    if (section.enabled) {
      totalContentLength += JSON.stringify(section.content).length;
    }
  });

  // Very rough estimate: 3000 chars ≈ 1 page
  const estimatedPages = totalContentLength / 3000;

  if (estimatedPages > 2.5) {
    issues.push({
      id: 'too-long',
      type: 'warning',
      message: 'Resume may be too long (exceeds 2 pages)',
      section: 'Length',
      suggestion: 'Consider condensing content to 1-2 pages for better ATS performance',
    });
  } else if (estimatedPages < 0.5) {
    issues.push({
      id: 'too-short',
      type: 'info',
      message: 'Resume appears short',
      section: 'Length',
      suggestion: 'Consider adding more details about your experience and skills',
    });
  }

  return issues;
};

/**
 * Validates keyword density in experience descriptions
 */
const validateKeywordDensity = (resume: Resume): ATSIssue[] => {
  const issues: ATSIssue[] = [];
  const { sections } = resume;

  const experienceSection = sections.find((s) => s.type === 'experience' && s.enabled);
  if (experienceSection) {
    const experiences = (experienceSection.content as any).experiences || [];
    
    experiences.forEach((exp: any, index: number) => {
      const description = exp.description || '';
      const achievements = (exp.achievements || []).join(' ');
      const fullText = `${description} ${achievements}`;
      
      const density = calculateKeywordDensity(fullText);
      
      if (density < 0.3 && fullText.length > 100) {
        issues.push({
          id: `low-keyword-density-${exp.id}`,
          type: 'info',
          message: `Experience #${index + 1}: Low keyword variety`,
          section: experienceSection.title,
          suggestion: 'Include more specific technical terms and action verbs',
        });
      }
    });
  }

  return issues;
};

/**
 * Main ATS validation function
 * Analyzes resume and returns comprehensive validation results
 */
export const validateATS = (resume: Resume): ATSValidation => {
  const allIssues: ATSIssue[] = [
    ...validateContactInfo(resume),
    ...validateFont(resume),
    ...validateSectionHeaders(resume),
    ...validateRequiredSections(resume),
    ...validateDateFormats(resume),
    ...validateSpecialCharacters(resume),
    ...validateLength(resume),
    ...validateKeywordDensity(resume),
  ];

  // Calculate score based on issue severity
  let score = 100;
  
  allIssues.forEach((issue) => {
    switch (issue.type) {
      case 'error':
        score -= 15;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'info':
        score -= 2;
        break;
    }
  });

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues: allIssues,
    lastValidated: new Date().toISOString(),
  };
};

/**
 * Get score color based on value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Get score background color based on value
 */
export const getScoreBgColor = (score: number): string => {
  if (score >= 90) return 'bg-green-50';
  if (score >= 70) return 'bg-yellow-50';
  if (score >= 50) return 'bg-orange-50';
  return 'bg-red-50';
};

/**
 * Get issue icon color based on type
 */
export const getIssueColor = (type: 'error' | 'warning' | 'info'): string => {
  switch (type) {
    case 'error':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-600';
    case 'info':
      return 'text-blue-600';
  }
};
