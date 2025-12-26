import { useRef, useCallback, useState } from 'react';
import { Resume } from '../types/resume.types';
import { resumeService } from '../services/resume.service';

export interface PDFExportOptions {
  fileName?: string;
}

export interface UsePDFExportReturn {
  componentRef: React.RefObject<HTMLDivElement>;
  handleExport: (options?: PDFExportOptions, additionalStyles?: string) => Promise<void>;
  isExporting: boolean;
}

/**
 * Custom hook for PDF export functionality using Server-Side Generation
 * 
 * Captures the current HTML and CSS of the resume preview and sends it to the backend
 * for high-quality PDF generation via Puppeteer.
 */
export const usePDFExport = (resume: Resume, externalRef?: React.RefObject<HTMLDivElement>): UsePDFExportReturn => {
  const localRef = useRef<HTMLDivElement>(null);
  const componentRef = externalRef || localRef;
  const [isExporting, setIsExporting] = useState(false);

  // Generate filename based on resume data and current date
  const generateFileName = useCallback((customName?: string): string => {
    if (customName) return customName;

    const name = resume.personalInfo.fullName || 'Resume';
    const date = new Date().toISOString().split('T')[0];
    return `${name.replace(/\s+/g, '_')}_Resume_${date}.pdf`;
  }, [resume.personalInfo.fullName]);

  // Extract all stylesheets including Tailwind styles
  const extractStyles = useCallback((): string => {
    let cssString = '';

    // Add explicit font-family override for the resume
    // This ensures the user's selected font is applied in server-side PDF generation
    const fontFamily = resume.layout.fontFamily || 'Arial';
    const fontOverride = `
      /* Force font-family for PDF generation */
      body, * {
        font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      }
    `;

    cssString += fontOverride;

    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          const rules = Array.from(sheet.cssRules);
          console.log(`Extracting ${rules.length} rules from sheet`);
          rules.forEach((rule) => {
            cssString += rule.cssText;
          });
        }
      } catch (e) {
        console.warn('Could not read stylesheet rule', e);
      }
    });

    return cssString;
  }, [resume.layout.fontFamily]);

  // Export handler
  const handleExport = useCallback(async (options?: PDFExportOptions, additionalStyles?: string) => {
    if (!componentRef.current) {
      console.error('Component ref not available');
      return;
    }

    try {
      setIsExporting(true);

      // 1. Capture HTML content
      const htmlContent = componentRef.current.outerHTML;

      // 2. Capture Styles
      let cssContent = extractStyles();

      // Append additional styles (like @page rules)
      if (additionalStyles) {
        cssContent += `\n${additionalStyles}`;
      }

      // 3. Send to Backend
      const pdfBlob = await resumeService.exportResume(htmlContent, cssContent);

      // 4. Trigger Download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFileName(options?.fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('PDF Export failed:', error);
      // Ideally show a toast notification here if available
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [resume, generateFileName, extractStyles, componentRef]);

  return {
    componentRef,
    handleExport,
    isExporting,
  };
};
