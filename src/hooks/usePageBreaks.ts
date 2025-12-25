import { useEffect } from 'react';

/**
 * Hook to handle visual page breaks in the Resume Preview.
 * It detects if resume items overlap with the "page gaps" (every 11 inches)
 * and adds a top margin to push them to the next page.
 * 
 * @param ref - Ref to the container element
 * @param dependencies - dependencies to re-run the calculation (e.g. resume content)
 * @param printMode - whether print mode is active
 */
export const usePageBreaks = (
  ref: React.RefObject<HTMLElement>,
  dependencies: any[],
  printMode: boolean
) => {
  useEffect(() => {
    if (!ref.current || !printMode) {
      // Cleanup margins if we exit print mode
      if (ref.current && !printMode) {
        const items = ref.current.querySelectorAll('.resume-item');
        items.forEach((item) => {
          (item as HTMLElement).style.marginTop = '0px';
        });
      }
      return;
    }

    const calculateBreaks = () => {
      if (!ref.current) return;

      const PAGE_HEIGHT_PX = 1056; // 11 inches at 96 DPI
      const GAP_HEIGHT_PX = 40;    // Visual gap size
      const BUFFER_PX = 20;        // Extra buffer to ensure it clears the gap

      const items = ref.current.querySelectorAll('.resume-item');
      
      // Reset margins first to get true natural positions
      items.forEach((item) => {
        (item as HTMLElement).style.marginTop = '0px';
      });

      // Recalculate positions
      items.forEach((item) => {
        const element = item as HTMLElement;
        const rect = element.getBoundingClientRect();
        
        // We need the offset relative to the container *top*
        // Since getBoundingClientRect is viewport-relative, we subtract the container's top
        const containerRect = ref.current!.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;
        const relativeBottom = relativeTop + rect.height;

        // Check which page the *bottom* of the element lands on
        // Page 1 ends at 1056. Page 2 starts effectively at 1056 + GAP visually? 
        // Actually, in our CSS, the "page" is a continuous block. 
        // We want to simulate that at 1056px, there is a "dead zone" of 40px.
        // So if an element crosses 1056, or 2112 (2*1056), etc., it should move.

        // Simple logic:
        // Page N ends at N * PAGE_HEIGHT_PX.
        // If (Top < PageBoundary AND Bottom > PageBoundary) -> Crosses boundary.
        
        // We find the nearest page boundary that this element might cross
        const pageIndex = Math.floor(relativeTop / PAGE_HEIGHT_PX) + 1;
        const pageBoundary = pageIndex * PAGE_HEIGHT_PX;

        if (relativeTop < pageBoundary && relativeBottom > pageBoundary) {
          // It crosses the boundary. Push it down.
          // The amount to push is: (Distance to next page start) 
          // New position should be at `pageBoundary + GAP + BUFFER`.
          // Current Top is `relativeTop`.
          // Margin needed = (pageBoundary - relativeTop) + GAP_HEIGHT_PX ??
          // No, we want the *top* of the element to coincide with the start of the next page.
          
          // We want the new position to be after the page boundary (1056) AND the gap (40).
          // So newTop should be pageBoundary + GAP_HEIGHT_PX.
          // The margin to add is (targetTop - currentTop).
          
          const targetTop = pageBoundary + GAP_HEIGHT_PX + BUFFER_PX;
          const pushDistance = targetTop - relativeTop;
          
          // Apply margin
          element.style.marginTop = `${pushDistance}px`;
        }
      });
    };

    // Run calculation
    // A small timeout allows DOM to settle (e.g. images loading, fonts)
    const timeoutId = setTimeout(calculateBreaks, 100);

    // Also listen for window resize as strict pixel maths depend on zoom/width? 
    // Actually width is fixed in print mode usually, but good practice.
    window.addEventListener('resize', calculateBreaks);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateBreaks);
    };
  }, [ref, printMode, ...dependencies]);
};
