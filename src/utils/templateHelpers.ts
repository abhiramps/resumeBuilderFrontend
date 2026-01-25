/**
 * Template Helper Utilities
 * 
 * Shared utility functions used across all resume templates
 * for consistent formatting and data processing
 */

/**
 * Date formatting utilities
 */
export const dateHelpers = {
  /**
   * Format date for resume display (ATS-compliant)
   * @param date - Date string or Date object
   * @param format - Format type
   * @returns Formatted date string
   */
  formatDate: (
    date: string | Date,
    format: 'month-year' | 'full' | 'year' | 'short' = 'month-year'
  ): string => {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return typeof date === 'string' ? date : '';
      }

      const options: Intl.DateTimeFormatOptions = {};

      switch (format) {
        case 'month-year':
          // Use abbreviated month for ATS compliance (e.g., "Jan 2022")
          options.month = 'long';
          options.year = 'numeric';
          break;
        case 'full':
          options.month = 'long';
          options.day = 'numeric';
          options.year = 'numeric';
          break;
        case 'year':
          options.year = 'numeric';
          break;
        case 'short':
          options.month = 'numeric';
          options.year = '2-digit';
          break;
        default:
          return typeof date === 'string' ? date : dateObj.toLocaleDateString();
      }

      return dateObj.toLocaleDateString('en-US', options);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return typeof date === 'string' ? date : '';
    }
  },

  /**
   * Format date range for display
   * @param startDate - Start date
   * @param endDate - End date
   * @param current - Whether the position is current
   * @param format - Date format to use
   * @returns Formatted date range string
   */
  formatDateRange: (
    startDate: string | Date,
    endDate: string | Date,
    current: boolean = false,
    format: 'month-year' | 'full' | 'year' | 'short' = 'month-year'
  ): string => {
    const start = dateHelpers.formatDate(startDate, format);

    if (current) {
      return `${start} - Present`;
    }

    const end = dateHelpers.formatDate(endDate, format);
    return `${start} - ${end}`;
  },

  /**
   * Calculate duration between dates
   * @param startDate - Start date
   * @param endDate - End date (optional, uses current date if not provided)
   * @returns Duration string (e.g., "2 years 3 months")
   */
  calculateDuration: (startDate: string | Date, endDate?: string | Date): string => {
    try {
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return '';
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);

      if (years === 0 && months === 0) {
        return 'Less than 1 month';
      } else if (years === 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else if (months === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.warn('Duration calculation error:', error);
      return '';
    }
  },
};

/**
 * Text formatting utilities
 */
export const textHelpers = {
  /**
   * Truncate text to specified length
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @param suffix - Suffix to add when truncated
   * @returns Truncated text
   */
  truncate: (text: string, maxLength: number, suffix: string = '...'): string => {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Capitalize first letter of each word
   * @param text - Text to capitalize
   * @returns Capitalized text
   */
  titleCase: (text: string): string => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  },

  /**
   * Convert text to sentence case
   * @param text - Text to convert
   * @returns Sentence case text
   */
  sentenceCase: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Clean and format text for display
   * @param text - Text to clean
   * @returns Cleaned text
   */
  cleanText: (text: string): string => {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  },

  /**
   * Extract initials from name
   * @param name - Full name
   * @returns Initials
   */
  getInitials: (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  },

  /**
   * Format bullet points
   * @param items - Array of bullet point strings
   * @returns Cleaned and formatted bullet points
   */
  formatBulletPoints: (items: string[]): string[] => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .filter(item => item && item.trim())
      .map(item => textHelpers.cleanText(item));
  },
};

/**
 * URL formatting utilities
 */
export const urlHelpers = {
  /**
   * Format URL for display (remove protocol, www)
   * @param url - URL string
   * @returns Clean URL for display
   */
  formatForDisplay: (url: string): string => {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;

      // Remove www. prefix
      if (hostname.startsWith('www.')) {
        hostname = hostname.slice(4);
      }

      const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
      return hostname + path + urlObj.search;
    } catch (error) {
      // If URL parsing fails, clean manually
      return url.replace(/^https?:\/\/(www\.)?/, '');
    }
  },

  /**
   * Validate URL format
   * @param url - URL to validate
   * @returns Boolean indicating if URL is valid
   */
  isValid: (url: string): boolean => {
    if (!url) return false;

    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Ensure URL has protocol
   * @param url - URL string
   * @returns URL with protocol
   */
  ensureProtocol: (url: string): string => {
    if (!url) return '';

    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }

    return url;
  },

  /**
   * Extract domain from URL
   * @param url - URL string
   * @returns Domain name
   */
  getDomain: (url: string): string => {
    if (!url) return '';

    try {
      const urlObj = new URL(urlHelpers.ensureProtocol(url));
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }
  },
};

/**
 * Phone number formatting utilities
 */
export const phoneHelpers = {
  /**
   * Format phone number for display
   * @param phone - Phone number string
   * @param format - Format type
   * @returns Formatted phone number
   */
  format: (phone: string, format: 'standard' | 'international' | 'dots' = 'standard'): string => {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format based on length and format type
    if (digits.length === 10) {
      // Indian format as requested: 97459 91905 (without country code)
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      const mainDigits = digits.slice(1);
      switch (format) {
        case 'standard':
          return `+1 (${mainDigits.slice(0, 3)}) ${mainDigits.slice(3, 6)}-${mainDigits.slice(6)}`;
        case 'international':
          return `+1 ${mainDigits.slice(0, 3)} ${mainDigits.slice(3, 6)} ${mainDigits.slice(6)}`;
        case 'dots':
          return `+1.${mainDigits.slice(0, 3)}.${mainDigits.slice(3, 6)}.${mainDigits.slice(6)}`;
        default:
          return phone;
      }
    } else {
      // Return original if it doesn't match expected patterns
      return phone;
    }
  },

  /**
   * Validate phone number format
   * @param phone - Phone number to validate
   * @returns Boolean indicating if phone number is valid
   */
  isValid: (phone: string): boolean => {
    if (!phone) return false;

    const digits = phone.replace(/\D/g, '');
    // Allow 10 (standard), 11 (US/other), 12 (91+10)
    return digits.length >= 10 && digits.length <= 13;
  },

  /**
   * Clean phone number (remove formatting)
   * @param phone - Phone number to clean
   * @returns Clean phone number with digits only
   */
  clean: (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  },
};

/**
 * Content validation utilities
 */
export const validationHelpers = {
  /**
   * Check if section has content
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
   * Validate email format
   * @param email - Email to validate
   * @returns Boolean indicating if email is valid
   */
  isValidEmail: (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if text is too long for ATS
   * @param text - Text to check
   * @param maxLength - Maximum recommended length
   * @returns Boolean indicating if text is too long
   */
  isTooLong: (text: string, maxLength: number): boolean => {
    if (!text) return false;
    return text.length > maxLength;
  },

  /**
   * Count words in text
   * @param text - Text to count
   * @returns Word count
   */
  wordCount: (text: string): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },
};

/**
 * Style generation utilities
 */
export const styleHelpers = {
  /**
   * Generate responsive font size
   * @param baseSize - Base font size in points
   * @param scale - Scale factor
   * @returns CSS font size string
   */
  responsiveFontSize: (baseSize: number, scale: number = 1): string => {
    return `${baseSize * scale}pt`;
  },

  /**
   * Generate color with opacity
   * @param color - Base color (hex)
   * @param opacity - Opacity (0-1)
   * @returns RGBA color string
   */
  colorWithOpacity: (color: string, opacity: number): string => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Generate spacing value
   * @param base - Base spacing value
   * @param multiplier - Multiplier
   * @returns CSS spacing value
   */
  spacing: (base: number, multiplier: number = 1): string => {
    return `${base * multiplier}px`;
  },
};

/**
 * Export all helpers as a single object for convenience
 */
export const templateHelpers = {
  date: dateHelpers,
  text: textHelpers,
  url: urlHelpers,
  phone: phoneHelpers,
  validation: validationHelpers,
  style: styleHelpers,
};

export default templateHelpers;