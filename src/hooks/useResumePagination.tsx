import { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Resume, ResumeSection, WorkExperience, Education, Project, Certification, AdditionalInfoItem } from '../types/resume.types';
import { ResumePreview } from '../components/Preview/ResumePreview';

// A4 Dimensions in MM
const PAGE_HEIGHT_MM = 297;
// Pixels per inch / mm (approximate for screen)
// 1in = 96px
// 1mm = 3.7795px
const PX_PER_MM = 3.7795;
const PAGE_HEIGHT_PX = Math.ceil(PAGE_HEIGHT_MM * PX_PER_MM);

interface MeasuredItem {
    index: number;
    height: number;
    marginTop: number;
    marginBottom: number;
    top: number;
    bottom: number;
}

interface SectionMeasurement {
    id: string;
    totalHeight: number;
    headerHeight: number; // h2 + margins
    headerMarginTop: number;
    headerMarginBottom: number;
    contentWrapperHeight: number; // The div wrapping items
    items: MeasuredItem[];
}

export const useResumePagination = (resume: Resume) => {
    const [paginatedResumes, setPaginatedResumes] = useState<Resume[]>([]);
    const [isCalculating, setIsCalculating] = useState(true);

    const calculatePages = useCallback(async () => {
        setIsCalculating(true);

        // Create a hidden container for measurement
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.visibility = 'hidden';
        container.style.width = '210mm'; // A4 width
        container.style.backgroundColor = 'white';
        container.style.zIndex = '-1000';
        document.body.appendChild(container);

        // Render the full resume into the container
        const root = createRoot(container);
        
        // We render with printMode=true so it removes shadows/scaling and uses correct print widths
        // We render ALL sections in one big container to measure them
        flushSync(() => {
            root.render(
                <ResumePreview 
                    resume={resume} 
                    printMode={true} 
                    className="measurement-preview"
                />
            );
        });

        // Small delay to ensure layout is computed (images, fonts, etc.)
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 50));

        // --- MEASUREMENT PHASE ---
        
        // 1. Measure Margins (from layout)
        const marginTopPx = (resume.layout.pageMargins.top * 96); // inches to px
        const marginBottomPx = (resume.layout.pageMargins.bottom * 96);
        const contentHeightPx = PAGE_HEIGHT_PX - marginTopPx - marginBottomPx;

        // 2. Measure Header (Personal Info)
        const headerEl = container.querySelector('header');
        let headerHeight = 0;
        if (headerEl) {
            const rect = headerEl.getBoundingClientRect();
            const styles = window.getComputedStyle(headerEl);
            // Including margins
            headerHeight = rect.height + parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        }

        // 3. Measure Sections
        const sectionMeasurements: SectionMeasurement[] = [];
        const enabledSections = resume.sections
            .filter(s => s.enabled)
            .sort((a, b) => a.order - b.order);

        for (const section of enabledSections) {
            const sectionEl = container.querySelector(`[data-section-id="${section.id}"]`);
            if (!sectionEl) continue;

            const rect = sectionEl.getBoundingClientRect();
            const styles = window.getComputedStyle(sectionEl);
            const marginTop = parseFloat(styles.marginTop);
            const marginBottom = parseFloat(styles.marginBottom);
            const totalHeight = rect.height + marginTop + marginBottom;

            // Measure Title (h2)
            let headerH = 0;
            let headerMT = 0;
            let headerMB = 0;
            const titleEl = sectionEl.querySelector('h2');
            if (titleEl) {
                const titleRect = titleEl.getBoundingClientRect();
                const titleStyle = window.getComputedStyle(titleEl);
                headerMT = parseFloat(titleStyle.marginTop);
                headerMB = parseFloat(titleStyle.marginBottom);
                headerH = titleRect.height + headerMT + headerMB;
            }

            // Measure Items
            // Assumption: Structure is section > h2, section > div (wrapper) > div (item) OR list (ul) > li (item)
            // Most templates render items in a div wrapper or ul
            const items: MeasuredItem[] = [];
            let contentWrapperHeight = 0;

            // Find wrapper. Usually next sibling of h2
            // If Modern/Professional/Classic: wrapper is div or ul
            let wrapper = titleEl ? titleEl.nextElementSibling : sectionEl.firstElementChild;
            
            // If no title, wrapper is first child.
            // Note: Some templates might wrap everything in another div. 
            // We rely on the template structure: 
            // Modern: h2 -> div -> div[]
            // Classic: h2 -> div -> div[] (Experience) OR ul -> li[] (Skills)
            
            if (wrapper) {
                const wrapperRect = wrapper.getBoundingClientRect();
                const wrapperStyle = window.getComputedStyle(wrapper);
                contentWrapperHeight = wrapperRect.height + parseFloat(wrapperStyle.marginTop) + parseFloat(wrapperStyle.marginBottom);

                const children = Array.from(wrapper.children);
                // If it's a list (ul), children are li. If div, children are div.
                children.forEach((child, idx) => {
                   const cRect = child.getBoundingClientRect();
                   const cStyle = window.getComputedStyle(child);
                   const cHeight = cRect.height + parseFloat(cStyle.marginTop) + parseFloat(cStyle.marginBottom);
                   
                   // Important: Measure vertical position to determine gaps precisely if possible
                   // But simple height summation + margin is usually enough if margins handle gaps.
                   // We trust getBoundingClientRect includes rendered gaps if we look at top/bottom relative to viewport
                   items.push({
                       index: idx,
                       height: cHeight,
                       marginTop: parseFloat(cStyle.marginTop),
                       marginBottom: parseFloat(cStyle.marginBottom),
                       top: cRect.top,
                       bottom: cRect.bottom
                   });
                });
            }

            sectionMeasurements.push({
                id: section.id,
                totalHeight,
                headerHeight: headerH,
                headerMarginTop: headerMT,
                headerMarginBottom: headerMB,
                contentWrapperHeight,
                items
            });
        }

        // Cleanup
        root.unmount();
        document.body.removeChild(container);


        // --- PAGINATION ALGORITHM ---
        
        const pages: Resume[] = [];
        let currentPageSections: ResumeSection[] = [];
        let currentHeight = 0; // Tracks used height on current page
        let pageIndex = 0;

        // Initialize Page 1
        // Page 1 has header
        currentHeight += headerHeight;

        for (const measurement of sectionMeasurements) {
            const originalSection = enabledSections.find(s => s.id === measurement.id);
            if (!originalSection) continue;

            // Does the whole section fit?
            // Note: Use measurement.totalHeight which includes header + content + margins
            // Safety: +2px for rounding errors
            if (currentHeight + measurement.totalHeight <= contentHeightPx + 2) {
                // Add full section
                currentPageSections.push(originalSection);
                currentHeight += measurement.totalHeight;
            } else {
                // Section flows over. Needs splitting.
                
                // Can we fit just the header?
                // Avoid orphan header: Ensure header + at least first item fits
                const firstItemHeight = measurement.items.length > 0 ? measurement.items[0].height : 0;
                const minHeightNeeded = measurement.headerHeight + firstItemHeight;

                if (currentHeight + minHeightNeeded > contentHeightPx) {
                    // Scenario C: Header doesn't fit (or would be orphaned). Push WHOLE section to next page.
                    
                    // Push current page
                    pages.push({ ...resume, sections: currentPageSections });
                    
                    // Reset for New Page
                    pageIndex++;
                    currentPageSections = [];
                    currentHeight = 0; 
                    
                    // Add full section to new page (assuming it fits on a fresh page, otherwise loop continues logic)
                    // But wait, if it's longer than a full page, we still need to split it!
                    // So we fall through to split logic, but now currentHeight is 0.
                }

                // Split Logic (Scenario B)
                // We are on (possibly) new page or current page with some space.
                // We need to decide what items go here.

                const fittingItems: any[] = [];
                const overflowItems: any[] = [];
                
                // 1. Add Header (if not hidden)
                // On a fresh page, we definitely add header. 
                // If we are continuing from previous page? No, we just decided to push whole section or split.
                // If we are splitting, the first part MUST have the header.
                
                let usedHeightForSection = 0;
                
                // If we pushed to new page above, currentHeight is 0.
                // If we stayed on current page, currentHeight is whatever it was.
                
                // Does header fit? (It should, because we checked minHeightNeeded above, unless it's a huge header)
                // Actually, if we are here, we know `currentHeight + minHeightNeeded <= contentHeightPx` IS FALSE
                // OR `currentHeight + totalHeight <= contentHeightPx` IS FALSE.
                
                // Re-evaluate if we are on a fresh page or not
                if (currentHeight === 0) {
                     // Fresh page. Header goes here.
                     usedHeightForSection += measurement.headerHeight;
                } else {
                    // Existing page. Check if header + item 1 fits.
                    if (currentHeight + minHeightNeeded <= contentHeightPx) {
                        // Yes, fits. Header goes here.
                        usedHeightForSection += measurement.headerHeight;
                    } else {
                        // Header doesn't fit. We should have pushed to new page.
                        // Logic error in "Scenario C" block?
                        // The "Scenario C" block pushed page and reset height. 
                        // So if we entered that block, currentHeight is 0.
                        // If we didn't, it means header DOES fit.
                        usedHeightForSection += measurement.headerHeight;
                    }
                }
                
                // Now iterate items
                measurement.items.forEach((item, idx) => {
                    // Gap approximation: (item.top - prevItem.bottom) is hard to get from isolated measurements
                    // But we measured margins. height includes margins.
                    // So just summing heights is usually correct if margins collapse?
                    // Flexbox/Grid gaps are not included in item height usually.
                    // Assuming block layout with margins:
                    
                    if (currentHeight + usedHeightForSection + item.height <= contentHeightPx) {
                        fittingItems.push(getSectionItem(originalSection, idx));
                        usedHeightForSection += item.height;
                    } else {
                        overflowItems.push(getSectionItem(originalSection, idx));
                    }
                });

                // Create P1 Section
                if (fittingItems.length > 0) {
                     const p1Section = createPartialSection(originalSection, fittingItems);
                     currentPageSections.push(p1Section);
                     currentHeight += usedHeightForSection;
                }
                
                // Handle Overflow (P2+)
                if (overflowItems.length > 0) {
                    // Loop until all overflow is handled
                    let remainingItems = [...overflowItems];
                    
                    while (remainingItems.length > 0) {
                        // Push Page
                        pages.push({ ...resume, sections: currentPageSections });
                        pageIndex++;
                        currentPageSections = [];
                        currentHeight = 0;
                        
                        // New Page.
                        // Add "continued" section without header (Scenario B: DO NOT render Header again)
                        
                        // How many fit on this empty page?
                        const nextBatch: any[] = [];
                        let batchHeight = 0;
                        
                        // Note: No header height added here!
                        // Maybe add a small margin top for visual separation?
                        
                        // We need to reconstruct items for the remaining parts
                        // We need the heights of these specific items.
                        // We can map back to measurement.items by index.
                        
                        // We know the index of the first overflow item.
                        const firstOverflowIdx = measurement.items.length - remainingItems.length;
                        
                        for (let i = 0; i < remainingItems.length; i++) {
                            const originalIdx = firstOverflowIdx + i;
                            const itemH = measurement.items[originalIdx].height;
                            
                            if (currentHeight + batchHeight + itemH <= contentHeightPx) {
                                nextBatch.push(remainingItems[i]);
                                batchHeight += itemH;
                            } else {
                                break;
                            }
                        }
                        
                        // Create P2 Section (Hidden Title)
                        const p2Section = createPartialSection(originalSection, nextBatch);
                        p2Section.hideTitle = true; // <--- This fixes Bug #1
                        
                        currentPageSections.push(p2Section);
                        currentHeight += batchHeight;
                        
                        // Remove processed items
                        remainingItems = remainingItems.slice(nextBatch.length);
                        
                        // Safety break to prevent infinite loops if an item is larger than a page
                        if (nextBatch.length === 0 && remainingItems.length > 0) {
                            // Force push one item or break
                             // If a single item is > page, we just print it and let it overflow or clip
                             const forcedItem = remainingItems.shift();
                             const forcedSection = createPartialSection(originalSection, [forcedItem]);
                             forcedSection.hideTitle = true;
                             currentPageSections.push(forcedSection);
                             // currentHeight += ??? (overflows)
                             // Just break page
                        }
                    }
                }
            }
        }

        // Push Final Page
        if (currentPageSections.length > 0) {
            pages.push({ ...resume, sections: currentPageSections });
        }

        setPaginatedResumes(pages);
        setIsCalculating(false);

    }, [resume]); 

    useEffect(() => {
        // Debounce
        const timer = setTimeout(() => {
            calculatePages();
        }, 500);
        return () => clearTimeout(timer);
    }, [calculatePages]);

    return { paginatedResumes, isCalculating };
};

// Helpers (Same as before)
function getSectionItem(section: ResumeSection, index: number): any {
    switch (section.type) {
        case 'experience': return (section.content as { experiences: WorkExperience[] }).experiences[index];
        case 'education': return (section.content as { education: Education[] }).education[index];
        case 'projects': return (section.content as { projects: Project[] }).projects[index];
        case 'certifications': return (section.content as { certifications: Certification[] }).certifications[index];
        case 'additional-info': return (section.content as { additionalInfo: AdditionalInfoItem[] }).additionalInfo[index];
        default: return null;
    }
}

function createPartialSection(original: ResumeSection, items: any[]): ResumeSection {
    const newContent = { ...original.content };
    
    switch (original.type) {
        case 'experience': (newContent as any).experiences = items; break;
        case 'education': (newContent as any).education = items; break;
        case 'projects': (newContent as any).projects = items; break;
        case 'certifications': (newContent as any).certifications = items; break;
        case 'additional-info': (newContent as any).additionalInfo = items; break;
    }

    return {
        ...original,
        content: newContent as any,
        // ID must be unique-ish or react complains about keys if we render multiple times? 
        // Actually unique key is section.id. If we split, we have same ID on multiple pages.
        // React might complain. Better to suffix ID?
        // But `data-section-id` relies on original ID.
        // Let's keep ID but React `key` in parent loop usually handles page index.
        id: original.id // Keep same ID for consistency or modify if needed
    };
}