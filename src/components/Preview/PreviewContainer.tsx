import React from "react";
import { ResumePreview } from "./ResumePreview";
import { useResumeContext } from "../../contexts/ResumeContext";
import { usePDFExportContext } from "../../contexts/PDFExportContext";
import { useResumePagination } from "../../hooks/useResumePagination";

/**
 * Preview Container Component Props
 */
export interface PreviewContainerProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
  /** Deprecated: Whether to show print mode toggle (Print mode is now always on) */
  showPrintMode?: boolean;
}

/**
 * Preview Container Component
 *
 * Wrapper component that provides:
 * - Pagination (A4 pages)
 * - Zoom controls
 * - Responsive scaling
 * - Print layout
 */
export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  className = "",
  showZoomControls = true,
  showPrintMode: _showPrintMode = true, // Kept for prop compatibility but unused
}) => {
  const { resume } = useResumeContext();
  const { previewRef, zoom, setZoom } = usePDFExportContext();
  const { paginatedResumes, isCalculating } = useResumePagination(resume);

  // Zoom levels
  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  // Set default zoom on mobile
  React.useEffect(() => {
    if (window.innerWidth < 768 && zoom === 100) {
      setZoom(50);
    }
  }, []);

  /**
   * Handle zoom change
   */
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  /**
   * Zoom in
   */
  const zoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };

  /**
   * Zoom out
   */
  const zoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  /**
   * Reset zoom to 100%
   */
  const resetZoom = () => {
    setZoom(window.innerWidth < 768 ? 50 : 100);
  };

  const containerStyles: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
    transition: "transform 0.2s ease-in-out",
  };

  return (
    <div className={`preview-container ${className}`}>
      {/* Controls Bar */}
      {showZoomControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm print:hidden">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Zoom:</span>

            {/* Zoom Out Button */}
            <button
              onClick={zoomOut}
              disabled={zoom <= zoomLevels[0]}
              className="p-1.5 sm:p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            {/* Zoom Level Selector */}
            <select
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="px-1 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {zoomLevels.map((level) => (
                <option key={level} value={level}>
                  {level}%
                </option>
              ))}
            </select>

            {/* Zoom In Button */}
            <button
              onClick={zoomIn}
              disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
              className="p-1.5 sm:p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Reset Zoom Button */}
            <button
              onClick={resetZoom}
              className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="Reset Zoom"
            >
              Fit
            </button>
            
            {isCalculating && (
                 <span className="ml-2 text-xs text-gray-400 animate-pulse">Calculating layout...</span>
            )}
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="preview-area bg-gray-100 rounded-lg p-2 sm:p-6 overflow-auto custom-scrollbar shadow-inner min-h-[400px]">
        <div
          className="preview-wrapper flex justify-center"
          style={{ minHeight: "600px" }}
        >
          {/* Wrapper with zoom */}
          <div style={containerStyles}>
             <div 
                ref={previewRef} 
                className="print-wrapper flex flex-col items-center gap-8"
             >
                {paginatedResumes.map((pageResume, i) => (
                    <div 
                        key={i} 
                        className="resume-page bg-white shadow-lg print:shadow-none print:m-0"
                        style={{
                            width: '210mm',
                            // Slightly reduced height to prevent browser rounding errors creating blank pages
                            height: '296.5mm',
                            position: 'relative',
                            overflow: 'hidden',
                            // Apply margins here since printMode=true strips them from TemplateBase
                            padding: `${resume.layout.pageMargins.top}in ${resume.layout.pageMargins.right}in ${resume.layout.pageMargins.bottom}in ${resume.layout.pageMargins.left}in`,
                            pageBreakAfter: i < paginatedResumes.length - 1 ? 'always' : 'auto'
                        }}
                    >
                        <ResumePreview 
                            resume={pageResume} 
                            printMode={true} 
                            className="h-full w-full"
                            hideHeader={i > 0} // Hide header on subsequent pages
                        />
                         {/* Page Number (Optional, for debugging or feature) 
                        <div className="absolute bottom-2 right-4 text-xs text-gray-400 no-print">
                            Page {i + 1}
                        </div>
                        */}
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-4 text-center text-sm text-gray-500 no-print print:hidden">
        <p>
          Preview shows exact A4 pages. Content automatically flows to new pages.
        </p>
      </div>
    </div>
  );
};

export default PreviewContainer;