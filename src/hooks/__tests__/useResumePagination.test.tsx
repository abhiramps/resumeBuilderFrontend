import { renderHook, act } from '@testing-library/react';
import { useResumePagination } from '../useResumePagination';
import { Resume, ResumeSection } from '../../types/resume.types';

// Mock DOM measurements
const mockGetBoundingClientRect = jest.fn();
const mockGetComputedStyle = jest.fn();

// Setup standard A4 page height in pixels (approx 1123px)
// Margins: 0.75in top/bottom = ~72px each -> content height ~979px
const PAGE_CONTENT_HEIGHT = 979;

beforeAll(() => {
    // Mock Element.getBoundingClientRect
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    
    // Mock window.getComputedStyle
    window.getComputedStyle = mockGetComputedStyle;
    
    // Mock document.fonts.ready
    Object.defineProperty(document, 'fonts', {
        value: { ready: Promise.resolve() }
    });
});

describe('useResumePagination', () => {
    const mockResume: Resume = {
        id: '1',
        personalInfo: { fullName: 'Test User', title: 'Developer', email: 'test@example.com', phone: '123', location: 'City' },
        sections: [],
        layout: {
            pageMargins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
            sectionSpacing: 20,
            lineHeight: 1.5,
            fontSize: { name: 20, title: 14, sectionHeader: 12, body: 10 },
            fontFamily: 'Arial',
            colors: { primary: '#000', secondary: '#666', text: '#333' }
        },
        template: 'modern',
        createdAt: '',
        updatedAt: ''
    };

    it('should put single small section on one page', async () => {
        const section1: ResumeSection = {
            id: 's1',
            type: 'experience',
            title: 'Experience',
            enabled: true,
            order: 1,
            content: { experiences: [{ id: 'e1', jobTitle: 'Job 1', company: 'Co', location: 'Loc', startDate: '', current: false, description: 'Desc' }] }
        };

        const resume = { ...mockResume, sections: [section1] };

        // Mock measurements
        mockGetBoundingClientRect.mockImplementation(() => ({ height: 200, top: 0, bottom: 200 }));
        mockGetComputedStyle.mockImplementation(() => ({ marginTop: '0px', marginBottom: '0px' }));

        const { result } = renderHook(() => useResumePagination(resume));
        
        // Wait for async calculation
        await act(async () => {
            await new Promise(r => setTimeout(r, 600)); // Wait for debounce + render
        });

        // Expect 1 page
        expect(result.current.paginatedResumes.length).toBe(1);
        expect(result.current.paginatedResumes[0].sections.length).toBe(1);
    });
});
