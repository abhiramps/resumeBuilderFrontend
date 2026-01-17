import React from "react";
import { TemplateType } from "../../types/resume.types";

interface TemplateThumbnailProps {
  templateType: TemplateType;
  className?: string;
}

/**
 * Template Thumbnail Component
 *
 * Displays SVG-based thumbnail previews for each template.
 * Optimized for performance with inline SVG.
 */
export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  templateType,
  className = "",
}) => {
  const thumbnails = {
    classic: <ClassicThumbnail />,
    modern: <ModernThumbnail />,
    minimal: <MinimalThumbnail />,
    professional: <ProfessionalThumbnail />,
    academic: <AcademicThumbnail />,
  };

  return (
    <div className={`template-thumbnail ${className}`}>
      {thumbnails[templateType]}
    </div>
  );
};

/**
 * Classic Template Thumbnail
 */
const ClassicThumbnail: React.FC = () => (
  <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white" />

    {/* Header - Centered */}
    <rect x="50" y="20" width="100" height="8" rx="2" fill="#2c3e50" />
    <rect x="70" y="32" width="60" height="4" rx="1" fill="#555" />
    <rect x="60" y="40" width="80" height="3" rx="1" fill="#555" />
    <line x1="20" y1="50" x2="180" y2="50" stroke="#2c3e50" strokeWidth="2" />

    {/* Section 1 */}
    <rect x="20" y="60" width="80" height="5" rx="1" fill="#2c3e50" />
    <line x1="20" y1="68" x2="180" y2="68" stroke="#2c3e50" strokeWidth="1" />
    <rect
      x="20"
      y="75"
      width="160"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="82"
      width="150"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="89"
      width="140"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 2 */}
    <rect x="20" y="105" width="70" height="5" rx="1" fill="#2c3e50" />
    <line x1="20" y1="113" x2="180" y2="113" stroke="#2c3e50" strokeWidth="1" />
    <rect
      x="20"
      y="120"
      width="100"
      height="4"
      rx="1"
      fill="#2c3e50"
      opacity="0.8"
    />
    <rect x="140" y="120" width="40" height="3" rx="1" fill="#555" />
    <circle cx="25" cy="130" r="1.5" fill="#333" />
    <rect
      x="30"
      y="128"
      width="145"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <circle cx="25" cy="137" r="1.5" fill="#333" />
    <rect
      x="30"
      y="135"
      width="140"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 3 */}
    <rect x="20" y="155" width="60" height="5" rx="1" fill="#2c3e50" />
    <line x1="20" y1="163" x2="180" y2="163" stroke="#2c3e50" strokeWidth="1" />
    <rect
      x="20"
      y="170"
      width="70"
      height="4"
      rx="1"
      fill="#333"
      opacity="0.7"
    />
    <rect
      x="20"
      y="178"
      width="160"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.5"
    />
    <rect
      x="20"
      y="185"
      width="150"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.5"
    />

    {/* Section 4 */}
    <rect x="20" y="200" width="50" height="5" rx="1" fill="#2c3e50" />
    <line x1="20" y1="208" x2="180" y2="208" stroke="#2c3e50" strokeWidth="1" />
    <rect
      x="20"
      y="215"
      width="80"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="222"
      width="75"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
  </svg>
);

/**
 * Modern Template Thumbnail
 */
const ModernThumbnail: React.FC = () => (
  <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white" />

    {/* Header - Left aligned with accent bar */}
    <rect x="20" y="20" width="4" height="35" rx="2" fill="#3b82f6" />
    <rect x="30" y="20" width="90" height="8" rx="2" fill="#3b82f6" />
    <rect x="30" y="32" width="60" height="4" rx="1" fill="#6b7280" />
    <rect x="30" y="40" width="140" height="3" rx="1" fill="#6b7280" />

    {/* Section 1 with accent */}
    <rect x="20" y="65" width="70" height="6" rx="2" fill="#3b82f6" />
    <line x1="20" y1="75" x2="180" y2="75" stroke="#3b82f6" strokeWidth="2" />
    <rect x="20" y="82" width="160" height="12" rx="2" fill="#f9fafb" />
    <rect x="23" y="85" width="3" height="6" rx="1" fill="#3b82f6" />
    <rect
      x="30"
      y="85"
      width="145"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.7"
    />
    <rect
      x="30"
      y="90"
      width="140"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.7"
    />

    {/* Section 2 */}
    <rect x="20" y="105" width="80" height="6" rx="2" fill="#3b82f6" />
    <line x1="20" y1="115" x2="180" y2="115" stroke="#3b82f6" strokeWidth="2" />
    <rect x="20" y="122" width="90" height="5" rx="1" fill="#1f2937" />
    <rect
      x="20"
      y="130"
      width="70"
      height="4"
      rx="1"
      fill="#3b82f6"
      opacity="0.8"
    />
    <rect x="140" y="122" width="40" height="4" rx="1" fill="#6b7280" />
    <rect x="25" y="138" width="3" height="3" rx="1" fill="#3b82f6" />
    <rect
      x="32"
      y="138"
      width="140"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.6"
    />
    <rect x="25" y="145" width="3" height="3" rx="1" fill="#3b82f6" />
    <rect
      x="32"
      y="145"
      width="135"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.6"
    />

    {/* Section 3 - Grid Skills */}
    <rect x="20" y="160" width="50" height="6" rx="2" fill="#3b82f6" />
    <line x1="20" y1="170" x2="180" y2="170" stroke="#3b82f6" strokeWidth="2" />
    <rect x="20" y="177" width="75" height="18" rx="2" fill="#f9fafb" />
    <rect
      x="23"
      y="180"
      width="50"
      height="4"
      rx="1"
      fill="#3b82f6"
      opacity="0.8"
    />
    <rect
      x="23"
      y="187"
      width="65"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.6"
    />
    <rect x="105" y="177" width="75" height="18" rx="2" fill="#f9fafb" />
    <rect
      x="108"
      y="180"
      width="45"
      height="4"
      rx="1"
      fill="#3b82f6"
      opacity="0.8"
    />
    <rect
      x="108"
      y="187"
      width="60"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.6"
    />

    {/* Section 4 */}
    <rect x="20" y="205" width="60" height="6" rx="2" fill="#3b82f6" />
    <line x1="20" y1="215" x2="180" y2="215" stroke="#3b82f6" strokeWidth="2" />
    <rect x="20" y="222" width="80" height="4" rx="1" fill="#1f2937" />
    <rect
      x="20"
      y="230"
      width="140"
      height="3"
      rx="1"
      fill="#1f2937"
      opacity="0.6"
    />
  </svg>
);

/**
 * Minimal Template Thumbnail
 */
const MinimalThumbnail: React.FC = () => (
  <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white" />

    {/* Header - Compact single line */}
    <rect x="20" y="20" width="70" height="6" rx="1" fill="#000" />
    <rect
      x="95"
      y="20"
      width="40"
      height="5"
      rx="1"
      fill="#000"
      opacity="0.7"
    />
    <rect
      x="20"
      y="30"
      width="160"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
    />

    {/* Section 1 - Ultra compact */}
    <rect x="20" y="42" width="60" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="50"
      width="90"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect x="140" y="50" width="40" height="3" rx="1" fill="#666" />
    <rect
      x="20"
      y="56"
      width="160"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="61"
      width="155"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="66"
      width="150"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 2 */}
    <rect x="20" y="75" width="55" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="83"
      width="85"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect x="140" y="83" width="40" height="3" rx="1" fill="#666" />
    <circle cx="22" cy="91" r="1" fill="#333" />
    <rect
      x="26"
      y="89"
      width="150"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <circle cx="22" cy="96" r="1" fill="#333" />
    <rect
      x="26"
      y="94"
      width="145"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <circle cx="22" cy="101" r="1" fill="#333" />
    <rect
      x="26"
      y="99"
      width="140"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 3 */}
    <rect x="20" y="110" width="50" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="118"
      width="80"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect x="140" y="118" width="40" height="3" rx="1" fill="#666" />
    <rect
      x="20"
      y="124"
      width="160"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="129"
      width="155"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 4 - Dense skills */}
    <rect x="20" y="140" width="40" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="148"
      width="160"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="153"
      width="155"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="158"
      width="150"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 5 */}
    <rect x="20" y="170" width="45" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="178"
      width="75"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect x="140" y="178" width="40" height="3" rx="1" fill="#666" />
    <rect
      x="20"
      y="184"
      width="140"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 6 */}
    <rect x="20" y="195" width="50" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="203"
      width="120"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="208"
      width="115"
      height="2.5"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
  </svg>
);

/**
 * Professional Template Thumbnail
 */
const ProfessionalThumbnail: React.FC = () => (
  <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white" />

    {/* Header - Centered with border */}
    <rect x="60" y="20" width="80" height="7" rx="2" fill="#2c3e50" />
    <rect x="70" y="31" width="60" height="4" rx="1" fill="#555" />
    <rect x="50" y="39" width="100" height="3" rx="1" fill="#555" />
    <rect x="60" y="45" width="80" height="3" rx="1" fill="#555" />
    <line x1="20" y1="53" x2="180" y2="53" stroke="#2c3e50" strokeWidth="2" />

    {/* Section 1 - Professional Summary */}
    <rect x="20" y="63" width="100" height="5" rx="1" fill="#2c3e50" />
    <line x1="20" y1="71" x2="180" y2="71" stroke="#2c3e50" strokeWidth="1.5" />
    <rect
      x="20"
      y="77"
      width="160"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.7"
    />
    <rect
      x="20"
      y="83"
      width="155"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.7"
    />
    <rect
      x="20"
      y="89"
      width="150"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.7"
    />

    {/* Section 2 - Technical Skills */}
    <rect x="20" y="100" width="80" height="5" rx="1" fill="#2c3e50" />
    <line
      x1="20"
      y1="108"
      x2="180"
      y2="108"
      stroke="#2c3e50"
      strokeWidth="1.5"
    />
    <rect
      x="20"
      y="114"
      width="50"
      height="3"
      rx="1"
      fill="#2c3e50"
      opacity="0.8"
    />
    <rect
      x="72"
      y="114"
      width="105"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="120"
      width="45"
      height="3"
      rx="1"
      fill="#2c3e50"
      opacity="0.8"
    />
    <rect
      x="67"
      y="120"
      width="110"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <rect
      x="20"
      y="126"
      width="55"
      height="3"
      rx="1"
      fill="#2c3e50"
      opacity="0.8"
    />
    <rect
      x="77"
      y="126"
      width="100"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 3 - Experience */}
    <rect x="20" y="140" width="110" height="5" rx="1" fill="#2c3e50" />
    <line
      x1="20"
      y1="148"
      x2="180"
      y2="148"
      stroke="#2c3e50"
      strokeWidth="1.5"
    />
    <rect
      x="20"
      y="154"
      width="80"
      height="4"
      rx="1"
      fill="#2c3e50"
      opacity="0.9"
    />
    <rect x="140" y="154" width="40" height="3" rx="1" fill="#666" />
    <rect
      x="20"
      y="161"
      width="100"
      height="3"
      rx="1"
      fill="#555"
      fontStyle="italic"
    />
    <circle cx="23" cy="169" r="1.5" fill="#333" />
    <rect
      x="28"
      y="167"
      width="145"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />
    <circle cx="23" cy="175" r="1.5" fill="#333" />
    <rect
      x="28"
      y="173"
      width="140"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 4 - Projects */}
    <rect x="20" y="188" width="70" height="5" rx="1" fill="#2c3e50" />
    <line
      x1="20"
      y1="196"
      x2="180"
      y2="196"
      stroke="#2c3e50"
      strokeWidth="1.5"
    />
    <rect
      x="20"
      y="202"
      width="90"
      height="4"
      rx="1"
      fill="#2c3e50"
      opacity="0.9"
    />
    <rect x="140" y="202" width="40" height="3" rx="1" fill="#666" />
    <rect
      x="20"
      y="209"
      width="120"
      height="3"
      rx="1"
      fill="#555"
      fontStyle="italic"
    />
    <rect
      x="20"
      y="215"
      width="155"
      height="3"
      rx="1"
      fill="#333"
      opacity="0.6"
    />

    {/* Section 5 - Education */}
    <rect x="20" y="228" width="60" height="5" rx="1" fill="#2c3e50" />
    <line
      x1="20"
      y1="236"
      x2="180"
      y2="236"
      stroke="#2c3e50"
      strokeWidth="1.5"
    />
    <rect
      x="20"
      y="242"
      width="100"
      height="4"
      rx="1"
      fill="#2c3e50"
      opacity="0.8"
    />
    <rect x="140" y="242" width="40" height="3" rx="1" fill="#666" />
    <rect x="20" y="249" width="120" height="3" rx="1" fill="#555" />
  </svg>
);

/**
 * Academic Template Thumbnail
 * LaTeX-inspired academic resume layout
 */
const AcademicThumbnail: React.FC = () => (
  <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white" />

    {/* Header - Centered LaTeX style */}
    <rect x="55" y="20" width="90" height="7" rx="1" fill="#000" />
    <rect x="60" y="31" width="80" height="3" rx="1" fill="#000" opacity="0.7" />
    <rect x="65" y="37" width="70" height="3" rx="1" fill="#000" opacity="0.7" />

    {/* Section 1 - OBJECTIVE */}
    <rect x="20" y="50" width="50" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="58"
      width="160"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
      fontStyle="italic"
    />
    <rect
      x="20"
      y="64"
      width="155"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
      fontStyle="italic"
    />

    {/* Section 2 - EDUCATION */}
    <rect x="20" y="75" width="55" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="83"
      width="90"
      height="4"
      rx="1"
      fill="#000"
      opacity="0.9"
    />
    <rect x="140" y="83" width="40" height="3" rx="1" fill="#000" opacity="0.7" fontStyle="italic" />
    <rect
      x="20"
      y="90"
      width="80"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
      fontStyle="italic"
    />
    <rect
      x="20"
      y="96"
      width="140"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.5"
    />

    {/* Section 3 - SKILLS */}
    <rect x="20" y="107" width="35" height="4" rx="1" fill="#000" />
    {/* Table-like skills layout */}
    <rect
      x="20"
      y="115"
      width="45"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect
      x="68"
      y="115"
      width="110"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <rect
      x="20"
      y="121"
      width="40"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect
      x="63"
      y="121"
      width="115"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <rect
      x="20"
      y="127"
      width="35"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.8"
    />
    <rect
      x="58"
      y="127"
      width="120"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
    />

    {/* Section 4 - EXPERIENCE */}
    <rect x="20" y="140" width="60" height="4" rx="1" fill="#000" />
    <rect
      x="20"
      y="148"
      width="75"
      height="4"
      rx="1"
      fill="#000"
      opacity="0.9"
    />
    <rect x="140" y="148" width="40" height="3" rx="1" fill="#000" opacity="0.7" />
    <rect
      x="20"
      y="155"
      width="90"
      height="3"
      rx="1"
      fill="#000"
      opacity="0.6"
      fontStyle="italic"
    />
    <circle cx="23" cy="163" r="1.5" fill="#000" />
    <rect
      x="28"
      y="161"
      width="145"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <circle cx="23" cy="169" r="1.5" fill="#000" />
    <rect
      x="28"
      y="167"
      width="140"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <circle cx="23" cy="175" r="1.5" fill="#000" />
    <rect
      x="28"
      y="173"
      width="135"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />

    {/* Section 5 - PROJECTS */}
    <rect x="20" y="186" width="50" height="4" rx="1" fill="#000" />
    <circle cx="23" cy="195" r="1.5" fill="#000" />
    <rect
      x="28"
      y="193"
      width="150"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <circle cx="23" cy="201" r="1.5" fill="#000" />
    <rect
      x="28"
      y="199"
      width="145"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <circle cx="23" cy="207" r="1.5" fill="#000" />
    <rect
      x="28"
      y="205"
      width="140"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />

    {/* Section 6 - EXTRA-CURRICULAR */}
    <rect x="20" y="218" width="110" height="4" rx="1" fill="#000" />
    <circle cx="23" cy="227" r="1.5" fill="#000" />
    <rect
      x="28"
      y="225"
      width="150"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
    <circle cx="23" cy="233" r="1.5" fill="#000" />
    <rect
      x="28"
      y="231"
      width="145"
      height="2.5"
      rx="1"
      fill="#000"
      opacity="0.6"
    />
  </svg>
);

export default TemplateThumbnail;
