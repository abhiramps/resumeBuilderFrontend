import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from "react";
import { ResumePreview } from "./ResumePreview";
import { useResumeContext } from "../../contexts/ResumeContext";
import { usePDFExportContext } from "../../contexts/PDFExportContext";
import { Resume } from "../../types/resume.types";

// --- Constants ---
const DPI = 96;
const PAGE_WIDTH_IN = 8.5;
const PAGE_HEIGHT_IN = 11;
const PAGE_WIDTH_PX = PAGE_WIDTH_IN * DPI;   // 816px
const PAGE_HEIGHT_PX = PAGE_HEIGHT_IN * DPI; // 1056px
const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
const MOBILE_BREAKPOINT = 768;
const CONTAINER_PADDING = 32; // p-4 * 2 = 32px

export interface PreviewContainerProps {
  className?: string;
  showZoomControls?: boolean;
}

// --- Hooks ---

/**
 * Calculates page breaks based on rendered content height
 */
const usePagination = (
  resume: Resume, 
  ghostRef: React.RefObject<HTMLDivElement>, 
  contentHeightLimit: number
) => {
  const [paginatedSectionIds, setPaginatedSections] = useState<string[][]>([[]]);

  useLayoutEffect(() => {
    const templateNode = ghostRef.current;
    if (!templateNode) return;

    const children = Array.from(templateNode.children) as HTMLElement[];
    const pages: string[][] = [];
    let currentPageSections: string[] = [];
    let currentHeight = 0;

    // Account for Header (always on Page 1)
    const headerNode = children.find(c => c.tagName === 'HEADER');
    if (headerNode) {
      const style = window.getComputedStyle(headerNode);
      currentHeight += headerNode.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }

    // Bin Packing Algorithm
    children.forEach((child) => {
      const sectionId = child.getAttribute('data-section-id');
      if (!sectionId) return;

      const style = window.getComputedStyle(child);
      const sectionHeight = child.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);

      if (currentHeight + sectionHeight <= contentHeightLimit) {
        currentPageSections.push(sectionId);
        currentHeight += sectionHeight;
      } else {
        pages.push(currentPageSections);
        currentPageSections = [sectionId];
        currentHeight = sectionHeight;
      }
    });

    if (currentPageSections.length > 0) pages.push(currentPageSections);
    if (pages.length === 0) pages.push([]);

    setPaginatedSections(pages);
  }, [resume, contentHeightLimit]);

  return paginatedSectionIds;
};

/**
 * Centers content horizontally when it is wider than the viewport
 */
const useScrollCentering = (
  containerRef: React.RefObject<HTMLElement>, 
  dependency: any
) => {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollWidth > container.clientWidth) {
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    }
  }, [dependency]);
};

// --- Component ---

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  className = "",
  showZoomControls = true,
}) => {
  const { resume } = useResumeContext();
  const { previewRef, zoom, setZoom } = usePDFExportContext();
  
  const ghostRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Memoized Layout Calculations
  const margins = useMemo(() => ({
    top: (resume.layout.pageMargins.top || 0.75) * DPI,
    right: (resume.layout.pageMargins.right || 0.75) * DPI,
    bottom: (resume.layout.pageMargins.bottom || 0.75) * DPI,
    left: (resume.layout.pageMargins.left || 0.75) * DPI,
  }), [resume.layout.pageMargins]);

  const contentHeightLimit = PAGE_HEIGHT_PX - margins.top - margins.bottom - 2; // -2px buffer

  // Logic
  const paginatedSectionIds = usePagination(resume, ghostRef, contentHeightLimit);
  useScrollCentering(scrollContainerRef, zoom); // Re-center on zoom change

  // Zoom Actions
  const calculateFitZoom = () => {
    const availableWidth = window.innerWidth - CONTAINER_PADDING;
    return Math.min(Math.floor((availableWidth / PAGE_WIDTH_PX) * 100), 100);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => setZoom(Number(e.target.value));
  
  const adjustZoom = (direction: 'in' | 'out') => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (direction === 'in' && idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
    if (direction === 'out' && idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
  };

  // Initial Auto-Fit for Mobile
  useEffect(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT && zoom === 100) {
      setZoom(calculateFitZoom());
    }
  }, []);

  const resetZoom = () => {
    setZoom(window.innerWidth < MOBILE_BREAKPOINT ? calculateFitZoom() : 100);
  };

  // Styles
  const pageContainerStyle: React.CSSProperties = {
    width: `${PAGE_WIDTH_PX}px`,
    height: `${PAGE_HEIGHT_PX}px`,
    padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const stackStyle: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
    transition: "transform 0.2s ease-in-out",
    width: `${PAGE_WIDTH_PX}px`,
    margin: "20px auto 0 auto",
    paddingBottom: "100px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  };

  // Render Helpers
  const getPageResume = (ids: string[]): Resume => ({
    ...resume,
    sections: resume.sections.filter(s => ids.includes(s.id))
  });

  return (
    <div className={`preview-container flex flex-col h-full ${className}`}>
      {/* Controls Bar */}
      {showZoomControls && (
        <div className="flex items-center justify-between gap-3 mb-4 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 shadow-sm print:hidden flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Zoom:</span>
            
            <button onClick={() => adjustZoom('out')} disabled={zoom <= ZOOM_LEVELS[0]} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            
            <select value={zoom} onChange={handleZoomChange} className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white">
              {ZOOM_LEVELS.map(level => <option key={level} value={level}>{level}%</option>)}
            </select>
            
            <button onClick={() => adjustZoom('in')} disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            
            <button onClick={resetZoom} className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded ml-2">Fit</button>
          </div>
        </div>
      )}

      {/* Hidden Ghost Container for Measurement */}
      <div className="fixed -left-[9999px] top-0 overflow-visible" style={{ width: `${PAGE_WIDTH_PX}px` }}>
        <ResumePreview
          ref={ghostRef}
          resume={resume}
          printMode={true}
          style={{ ...pageContainerStyle, height: 'auto', minHeight: `${PAGE_HEIGHT_PX}px` }}
        />
        {/* Continuous Render for PDF Export */}
        <div ref={previewRef}>
           <ResumePreview
              resume={resume}
              printMode={true}
              style={{ ...pageContainerStyle, minHeight: `${PAGE_HEIGHT_PX}px` }}
           />
        </div>
      </div>

      {/* Visible Paginated Preview */}
      <div 
        ref={scrollContainerRef}
        className="preview-area flex-1 bg-[#e5e7eb] overflow-auto custom-scrollbar shadow-inner p-4 sm:p-8"
      >
        <div className="w-full">
          <div style={stackStyle}>
            {paginatedSectionIds.map((ids, index) => (
              <div
                key={index}
                className="bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] relative flex-shrink-0"
                style={pageContainerStyle}
              >
                <ResumePreview
                  resume={getPageResume(ids)}
                  printMode={true}
                  hideHeader={index > 0}
                  style={{ padding: 0, boxShadow: 'none', minHeight: 'auto' }}
                />
                <div className="absolute bottom-4 right-6 text-[10px] font-medium text-gray-400 select-none">
                  Page {index + 1} of {paginatedSectionIds.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-2 text-center text-[10px] text-gray-400 no-print uppercase tracking-widest">
        A4 Preview
      </div>
    </div>
  );
};

export default PreviewContainer;
