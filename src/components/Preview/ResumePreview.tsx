import { forwardRef, memo } from "react";
import { Resume } from "../../types/resume.types";
import {
  ClassicTemplate,
  ModernTemplate,
  MinimalTemplate,
  ProfessionalTemplate,
  AcademicTemplate,
} from "../Templates";

/**
 * Resume Preview Component Props
 */
export interface ResumePreviewProps {
  /** Resume data to display */
  resume: Resume;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show print-specific styling */
  printMode?: boolean;
}

/**
 * Resume Preview Component
 *
 * Displays the formatted resume with:
 * - Letter size (8.5" x 11") dimensions
 * - User's layout settings applied
 * - Only enabled sections shown
 * - Sections in correct order
 * - Print-optimized styling
 * - ATS-safe formatting
 *
 * Uses forwardRef for PDF generation compatibility
 */
const ResumePreviewComponent = forwardRef<HTMLDivElement, ResumePreviewProps>(
  (props, ref) => {
    const { resume, className = "", printMode = false } = props;

    // Safety check: ensure resume has required properties
    if (!resume || !resume.layout) {
      return (
        <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Loading resume preview...</p>
        </div>
      );
    }

    // Render the appropriate template based on resume.template
    const templateProps = {
      resume,
      layout: resume.layout,
      printMode,
      className,
    };

    switch (resume.template) {
      case "classic":
        return <ClassicTemplate ref={ref} {...templateProps} />;
      case "modern":
        return <ModernTemplate ref={ref} {...templateProps} />;
      case "minimal":
        return <MinimalTemplate ref={ref} {...templateProps} />;
      case "professional":
        return <ProfessionalTemplate ref={ref} {...templateProps} />;
      case "academic":
        return <AcademicTemplate ref={ref} {...templateProps} />;
      default:
        return <ProfessionalTemplate ref={ref} {...templateProps} />;
    }
  }
);

ResumePreviewComponent.displayName = "ResumePreview";

// Memoize the preview to prevent unnecessary re-renders
export const ResumePreview = memo(ResumePreviewComponent);

export default ResumePreview;
