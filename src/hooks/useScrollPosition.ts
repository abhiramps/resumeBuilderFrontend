/**
 * useScrollPosition Hook
 * Tracks scroll position for navbar transformations and parallax effects
 */

import { useEffect, useState } from 'react';

interface ScrollPosition {
    scrollY: number;
    scrollDirection: 'up' | 'down' | null;
}

export const useScrollPosition = (throttleMs: number = 16) => {
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
        scrollY: 0,
        scrollDirection: null,
    });

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollPosition = () => {
            const currentScrollY = window.scrollY;
            const direction = currentScrollY > lastScrollY ? 'down' : 'up';

            setScrollPosition({
                scrollY: currentScrollY,
                scrollDirection: direction,
            });

            lastScrollY = currentScrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, [throttleMs]);

    return scrollPosition;
};
