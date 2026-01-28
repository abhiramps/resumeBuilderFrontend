import React from "react";
import { ResumePreview } from "./ResumePreview";
import { useResumeContext } from "../../contexts/ResumeContext";
import { usePDFExportContext } from "../../contexts/PDFExportContext";

/**
 * Preview Container Component Props
 */
export interface PreviewContainerProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
  /** Whether to show print mode toggle */
  showPrintMode?: boolean;
}

/**
 * Preview Container Component
 *
 * Wrapper component that provides:
 * - Centered preview with paper shadow effect
 * - Zoom controls for better viewing
 * - Print mode toggle
 * - Responsive scaling
 * - Scrollable container
 */
export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  className = "",
  showZoomControls = true,
  showPrintMode = true,
}) => {
  const { resume } = useResumeContext();
  const { previewRef, zoom, setZoom, printMode, setPrintMode } = usePDFExportContext();

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

  /**
   * Toggle print mode
   */
  const togglePrintMode = () => {
    setPrintMode(!printMode);
  };

  const containerStyles: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
    transition: "transform 0.2s ease-in-out",
    // Don't apply transform during printing
  };

  return (
    <div className={`preview-container ${className}`}>
      {/* Controls Bar */}
      {(showZoomControls || showPrintMode) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm print:hidden">
          {/* Zoom Controls */}
          {showZoomControls && (
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
            </div>
          )}

          {/* Print Mode Toggle */}
          {showPrintMode && (
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                <span className="hidden sm:inline">Print Mode</span>
                <span className="sm:hidden">Print</span>
              </span>
              <button
                onClick={togglePrintMode}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${printMode ? "bg-blue-600" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${printMode ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          )}
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
            {printMode ? (
                <div
                  className="print-mode-simulation"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                    width: "100%",
                  }}
                >
                  {/* Wrapper adds visual page margins and page break simulation */}
                  <div
                    style={{
                      width: "8.5in",
                      minHeight: "11in",
                      /* 
                         Simulate separate pages using a repeating gradient background.
                         Page Height: 11in (approx 1056px at 96 DPI)
                         Gap: 40px
                      */
                      backgroundImage: `repeating-linear-gradient(
                        to bottom,
                        #ffffff,
                        #ffffff 1056px,
                        #d1d5db 1056px,
                        #d1d5db 1096px
                      )`,
                      position: "relative",
                      /* Padding matching the layout */
                      padding: `${resume.layout.pageMargins.top}in ${resume.layout.pageMargins.right}in ${resume.layout.pageMargins.bottom}in ${resume.layout.pageMargins.left}in`,
                    }}
                  >
                   
                    <ResumePreview
                      ref={previewRef}
                      resume={resume}
                      printMode={printMode}
                      className=""
                    />

                  </div>
                  
                  <div className="text-gray-400 text-xs mt-2">
                    * Lines indicate approximate 11" page breaks
                  </div>
                </div>
            ) : (
              /* Normal Mode: Single continuous view */
              <ResumePreview
                ref={previewRef}
                resume={resume}
                printMode={printMode}
                className="shadow-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-4 text-center text-sm text-gray-500 no-print print:hidden">
        <p>
          Preview shows how your resume will appear when printed or exported as
          PDF.
          {printMode && " Print mode shows exact dimensions and styling."}
        </p>
      </div>
    </div>
  );
};

export default PreviewContainer;
