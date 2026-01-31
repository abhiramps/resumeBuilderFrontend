import React, { forwardRef } from "react";
import { Resume, LayoutSettings } from "../../types/resume.types";

/**
 * Template Base Component Props
 */
export interface TemplateBaseProps {
  /** Resume data to render */
  resume: Resume;
  /** Layout settings to apply */
  layout: LayoutSettings;
  /** Additional CSS classes */
  className?: string;
  /** Whether to render in print mode */
  printMode?: boolean;
  /** Whether to hide the header (personal info) - useful for subsequent pages */
  hideHeader?: boolean;
}

/**
 * Abstract base component for all resume templates
 * 
 * Provides common functionality and utilities that all templates can use:
 * - Consistent prop interface
 * - Common utility functions
 * - Shared styling utilities
 * - Print optimization
 * - ATS compliance helpers
 */
export const TemplateBase = forwardRef<HTMLDivElement, TemplateBaseProps>(
  (props, ref) => {
    const { resume, layout, className = "", printMode = false } = props;
    // Base container styles that all templates should use
    const baseContainerStyles: React.CSSProperties = {
      fontFamily: layout.fontFamily,
      fontSize: `${layout.fontSize.body}pt`,
      lineHeight: layout.lineHeight,
      color: layout.colors.text,
      backgroundColor: "white",
      width: printMode ? "8.5in" : "100%",
      maxWidth: "8.5in",
      minHeight: printMode ? "11in" : "auto",
      padding: `${layout.pageMargins.top}in ${layout.pageMargins.right}in ${layout.pageMargins.bottom}in ${layout.pageMargins.left}in`,
      boxShadow: printMode ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      pageBreakInside: "avoid",
    };

    return (
      <div
        ref={ref}
        className={`template-base ${className}`}
        style={baseContainerStyles}
      >
        {/* This is a base template - specific templates should override this */}
        <div className="text-center p-8 text-gray-500">
          <h2 className="text-xl font-semibold mb-2">Template Base</h2>
          <p>This is the base template component. Specific templates should extend this.</p>
          <p className="mt-4 text-sm">Resume ID: {resume.id}</p>
          <p className="text-sm">Template: {resume.template}</p>
        </div>
      </div>
    );
  }
);

TemplateBase.displayName = "TemplateBase";

/**
 * Common utility functions for templates
 */
export const templateUtils = {
  /**
   * Format date string for display
   * @param date - Date string to format
   * @param format - Format type ('month-year' | 'full' | 'year')
   * @returns Formatted date string
   */
  formatDate: (date: string, format: 'month-year' | 'full' | 'year' = 'month-year'): string => {
    if (!date) return '';

    try {
      const dateObj = new Date(date);

      switch (format) {
        case 'month-year':
          return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          });
        case 'full':
          return dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
        case 'year':
          return dateObj.getFullYear().toString();
        default:
          return date;
      }
    } catch (error) {
      // If date parsing fails, return original string
      return date;
    }
  },

  /**
   * Format phone number for display
   * @param phone - Phone number string
   * @returns Formatted phone number
   */
  formatPhoneNumber: (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format based on length
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else {
      // Return original if it doesn't match expected patterns
      return phone;
    }
  },

  /**
   * Render bullet points as HTML list
   * @param items - Array of bullet point strings
   * @param className - CSS class for the list
   * @returns JSX element with bullet points
   */
  renderBulletPoints: (items: string[], className: string = ""): React.ReactElement => {
    if (!items || items.length === 0) {
      return <></>;
    }

    return (
      <ul className={`list-disc list-inside space-y-1 ${className}`}>
        {items.map((item, index) => (
          <li key={index} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
    );
  },

  /**
   * Format URL for display (remove protocol, www)
   * @param url - URL string
   * @returns Clean URL for display
   */
  formatUrl: (url: string): string => {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;

      // Remove www. prefix
      if (hostname.startsWith('www.')) {
        hostname = hostname.slice(4);
      }

      return hostname + urlObj.pathname + urlObj.search;
    } catch (error) {
      // If URL parsing fails, return original string
      return url.replace(/^https?:\/\/(www\.)?/, '');
    }
  },

  /**
   * Truncate text to specified length
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @param suffix - Suffix to add when truncated
   * @returns Truncated text
   */
  truncateText: (text: string, maxLength: number, suffix: string = '...'): string => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Get enabled sections in order
   * @param resume - Resume data
   * @returns Array of enabled sections sorted by order
   */
  getEnabledSections: (resume: Resume) => {
    return resume.sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Generate section header styles
   * @param layout - Layout settings
   * @param customStyles - Additional custom styles
   * @returns Style object for section headers
   */
  getSectionHeaderStyles: (layout: LayoutSettings, customStyles: React.CSSProperties = {}): React.CSSProperties => {
    return {
      fontSize: `${layout.fontSize.sectionHeader}pt`,
      fontWeight: "bold",
      color: layout.colors.primary,
      textTransform: "uppercase" as const,
      borderBottom: `1px solid ${layout.colors.primary}`,
      paddingBottom: "2px",
      marginBottom: "12px",
      letterSpacing: "0.5px",
      ...customStyles,
    };
  },

  /**
   * Generate name styles
   * @param layout - Layout settings
   * @param customStyles - Additional custom styles
   * @returns Style object for name
   */
  getNameStyles: (layout: LayoutSettings, customStyles: React.CSSProperties = {}): React.CSSProperties => {
    return {
      fontSize: `${layout.fontSize.name}pt`,
      fontWeight: "bold",
      color: layout.colors.primary,
      marginBottom: "4px",
      lineHeight: 1.2,
      ...customStyles,
    };
  },

  /**
   * Generate title styles
   * @param layout - Layout settings
   * @param customStyles - Additional custom styles
   * @returns Style object for professional title
   */
  getTitleStyles: (layout: LayoutSettings, customStyles: React.CSSProperties = {}): React.CSSProperties => {
    return {
      fontSize: `${layout.fontSize.title}pt`,
      color: layout.colors.secondary,
      marginBottom: "8px",
      fontStyle: "italic" as const,
      ...customStyles,
    };
  },

  /**
   * Generate contact info styles
   * @param layout - Layout settings
   * @param customStyles - Additional custom styles
   * @returns Style object for contact information
   */
  getContactStyles: (layout: LayoutSettings, customStyles: React.CSSProperties = {}): React.CSSProperties => {
    return {
      fontSize: `${layout.fontSize.body - 1}pt`,
      color: layout.colors.secondary,
      ...customStyles,
    };
  },

  /**
   * Generate body text styles
   * @param layout - Layout settings
   * @param customStyles - Additional custom styles
   * @returns Style object for body text
   */
  getBodyStyles: (layout: LayoutSettings, customStyles: React.CSSProperties = {}): React.CSSProperties => {
    return {
      fontSize: `${layout.fontSize.body}pt`,
      lineHeight: layout.lineHeight,
      color: layout.colors.text,
      ...customStyles,
    };
  },

  /**
   * Check if a section has content
   * @param section - Resume section
   * @returns Boolean indicating if section has content
   */
  hasContent: (section: any): boolean => {
    if (!section || !section.content) return false;

    switch (section.type) {
      case 'summary':
        return !!(section.content.summary && section.content.summary.trim());
      case 'experience':
        return !!(section.content.experiences && section.content.experiences.length > 0);
      case 'projects':
        return !!(section.content.projects && section.content.projects.length > 0);
      case 'skills':
        return !!(section.content.skills && section.content.skills.length > 0);
      case 'education':
        return !!(section.content.education && section.content.education.length > 0);
      case 'certifications':
        return !!(section.content.certifications && section.content.certifications.length > 0);
      case 'custom':
        return !!(section.content.custom && section.content.custom.content && section.content.custom.content.trim());
      default:
        return false;
    }
  },

  /**
   * Validate ATS compliance for template
   * @param resume - Resume data
   * @param layout - Layout settings
   * @returns ATS compliance score and issues
   */
  validateATS: (resume: Resume, layout: LayoutSettings) => {
    const issues: string[] = [];
    let score = 100;

    // Check font family
    const atsSafeFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Calibri'];
    if (!atsSafeFonts.includes(layout.fontFamily)) {
      issues.push('Font family may not be ATS-compliant');
      score -= 10;
    }

    // Check font sizes
    if (layout.fontSize.body < 9 || layout.fontSize.body > 12) {
      issues.push('Body font size should be between 9-12pt for ATS compliance');
      score -= 5;
    }

    // Check margins
    if (layout.pageMargins.top < 0.5 || layout.pageMargins.top > 1) {
      issues.push('Top margin should be between 0.5-1 inch');
      score -= 5;
    }

    // Check required sections
    const requiredSections = ['experience', 'education'];
    const enabledSectionTypes = resume.sections
      .filter(s => s.enabled)
      .map(s => s.type);

    requiredSections.forEach(sectionType => {
      if (!enabledSectionTypes.includes(sectionType as any)) {
        issues.push(`${sectionType} section is recommended for ATS compliance`);
        score -= 10;
      }
    });

    return {
      score: Math.max(0, score),
      issues,
    };
  },
};

export default TemplateBase;