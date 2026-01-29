import React, { useState, useRef, useLayoutEffect } from "react";
import { ResumePreview } from "./ResumePreview";
import { useResumeContext } from "../../contexts/ResumeContext";
import { usePDFExportContext } from "../../contexts/PDFExportContext";
import { Resume } from "../../types/resume.types";

export interface PreviewContainerProps {
  className?: string;
  showZoomControls?: boolean;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  className = "",
  showZoomControls = true,
}) => {
  const { resume } = useResumeContext();
  const { previewRef, zoom, setZoom } = usePDFExportContext();
  
  // State for the grouped section IDs
  const [paginatedSectionIds, setPaginatedSections] = useState<string[][]>([[]]);
  
  // Ref for the hidden "Ghost" measurement container
  const ghostRef = useRef<HTMLDivElement>(null);
  
  // Ref for the visible scrollable area (for centering)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  // Constants for A4/Letter dimensions at 96 DPI
  const PAGE_HEIGHT_PX = 1056; // 11in @ 96dpi
  const PAGE_WIDTH_PX = 816;   // 8.5in @ 96dpi

  React.useEffect(() => {
    if (window.innerWidth < 768 && zoom === 100) {
      // Auto-fit on load for mobile
      const availableWidth = window.innerWidth - 32;
      const fitZoom = Math.floor((availableWidth / PAGE_WIDTH_PX) * 100);
      setZoom(Math.min(fitZoom, 100));
    }
  }, []);

  // ----------------------------------------------------------------------
  // SCROLL CENTERING EFFECT
  // ----------------------------------------------------------------------
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const centerContent = () => {
      // If content is wider than viewport, center it
      if (container.scrollWidth > container.clientWidth) {
        const centerX = (container.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = centerX;
      }
    };

    // Center immediately on render/update
    centerContent();

    // Re-center on resize
    window.addEventListener('resize', centerContent);
    return () => window.removeEventListener('resize', centerContent);
  }, [zoom, paginatedSectionIds]); // Re-run when layout changes

  const handleZoomChange = (newZoom: number) => setZoom(newZoom);
  const zoomIn = () => {
    const idx = zoomLevels.indexOf(zoom);
    if (idx < zoomLevels.length - 1) setZoom(zoomLevels[idx + 1]);
  };
  const zoomOut = () => {
    const idx = zoomLevels.indexOf(zoom);
    if (idx > 0) setZoom(zoomLevels[idx - 1]);
  };
  const resetZoom = () => {
    if (window.innerWidth < 768) {
      const availableWidth = window.innerWidth - 32;
      const fitZoom = Math.floor((availableWidth / PAGE_WIDTH_PX) * 100);
      setZoom(Math.min(fitZoom, 100));
    } else {
      setZoom(100);
    }
  };

  // Margins
  const topMargin = (resume.layout.pageMargins.top || 0.75) * 96;
  const bottomMargin = (resume.layout.pageMargins.bottom || 0.75) * 96;
  const rightMargin = (resume.layout.pageMargins.right || 0.75) * 96;
  const leftMargin = (resume.layout.pageMargins.left || 0.75) * 96;

  // The usable vertical space for content *inside* the padding
  const CONTENT_HEIGHT = PAGE_HEIGHT_PX - topMargin - bottomMargin - 2;

  // ----------------------------------------------------------------------
  // BIN PACKING ALGORITHM
  // ----------------------------------------------------------------------
  useLayoutEffect(() => {
    const templateNode = ghostRef.current;
    if (!templateNode) return;

    const children = Array.from(templateNode.children) as HTMLElement[];
    const pages: string[][] = [];
    let currentPageSections: string[] = [];
    let currentHeight = 0;

    let headerNode = children.find(c => c.tagName === 'HEADER');
    if (headerNode) {
        const style = window.getComputedStyle(headerNode);
        currentHeight += headerNode.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }

    children.forEach((child) => {
      const sectionId = child.getAttribute('data-section-id');
      if (sectionId) {
        const style = window.getComputedStyle(child);
        const sectionHeight = child.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);

        if (currentHeight + sectionHeight <= CONTENT_HEIGHT) {
          currentPageSections.push(sectionId);
          currentHeight += sectionHeight;
        } else {
          pages.push(currentPageSections);
          currentPageSections = [sectionId];
          currentHeight = sectionHeight; 
        }
      }
    });

    if (currentPageSections.length > 0) {
      pages.push(currentPageSections);
    }

    if (pages.length === 0) pages.push([]);
    setPaginatedSections(pages);

  }, [resume, zoom]);

  const getPageResume = (pageSectionIds: string[]): Resume => {
    return {
      ...resume,
      sections: resume.sections.filter(s => pageSectionIds.includes(s.id))
    };
  };

  const stackStyles: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
    transition: "transform 0.2s ease-in-out",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
    paddingBottom: "100px",
    marginTop: "20px",
    width: `${PAGE_WIDTH_PX}px`,
    marginLeft: "auto",
    marginRight: "auto",
  };

  return (
    <div className={`preview-container flex flex-col h-full ${className}`}>
      {/* Controls Bar */}
      {showZoomControls && (
        <div className="flex items-center justify-between gap-3 mb-4 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm print:hidden flex-shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2 w-full justify-between sm:justify-start">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="hidden sm:inline text-sm font-medium text-gray-700">Zoom:</span>
              <button onClick={zoomOut} disabled={zoom <= zoomLevels[0]} className="p-1.5 sm:p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </button>
              <select value={zoom} onChange={(e) => handleZoomChange(Number(e.target.value))} className="px-1 sm:px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white">
                {zoomLevels.map((level) => (<option key={level} value={level}>{level}%</option>))}
              </select>
              <button onClick={zoomIn} disabled={zoom >= zoomLevels[zoomLevels.length - 1]} className="p-1.5 sm:p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            <button onClick={resetZoom} className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">Fit</button>
          </div>
        </div>
      )}

      {/* GHOST MEASURER */}
      <div className="fixed -left-[9999px] top-0 overflow-visible" style={{ width: `${PAGE_WIDTH_PX}px` }}>
        <ResumePreview
          ref={ghostRef}
          resume={resume}
          printMode={true}
          style={{ 
             padding: `${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`,
             minHeight: `${PAGE_HEIGHT_PX}px`
          }}
        />
        <div ref={previewRef} className="print-export-container">
             <ResumePreview
                resume={resume}
                printMode={true}
                style={{ 
                    padding: `${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`,
                    minHeight: `${PAGE_HEIGHT_PX}px`
                }}
             />
        </div>
      </div>

      {/* VISIBLE PREVIEW */}
      <div 
        ref={scrollContainerRef}
        className="preview-area flex-1 bg-[#e5e7eb] overflow-auto custom-scrollbar shadow-inner p-4 sm:p-8"
      >
        <div className="preview-wrapper w-full">
          <div style={stackStyles}>
            {paginatedSectionIds.map((pageSectionIds, index) => {
              const isFirstPage = index === 0;
              const pageResume = getPageResume(pageSectionIds);

              return (
                <div
                  key={index}
                  className="bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] relative flex-shrink-0"
                  style={{
                    width: `${PAGE_WIDTH_PX}px`,
                    height: `${PAGE_HEIGHT_PX}px`,
                    padding: `${topMargin}px ${rightMargin}px ${bottomMargin}px ${leftMargin}px`,
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <ResumePreview
                    resume={pageResume}
                    printMode={true}
                    hideHeader={!isFirstPage}
                    style={{ padding: 0, boxShadow: 'none', minHeight: 'auto' }}
                  />
                  <div className="absolute bottom-4 right-6 text-[10px] font-medium text-gray-400 pointer-events-none select-none">
                    Page {index + 1} of {paginatedSectionIds.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-2 text-center text-[10px] text-gray-400 no-print uppercase tracking-widest">
        * A4 Preview *
      </div>
    </div>
  );
};

export default PreviewContainer;