/**
 * Design System Tokens
 * Centralized design configuration for consistent styling and animations
 */

export const designTokens = {
    colors: {
        gradients: {
            primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            cta: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
            ctaHover: 'linear-gradient(90deg, #4338CA 0%, #6D28D9 100%)',
            feature: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
            mesh: 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.15) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,0.15) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,0.15) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,0.15) 0px, transparent 50%)',
        },
        brand: {
            primary: '#4F46E5',
            primaryHover: '#4338CA',
            secondary: '#7C3AED',
            secondaryHover: '#6D28D9',
            accent: '#EC4899',
            accentHover: '#DB2777',
        },
        trust: {
            green: '#10B981',
            blue: '#3B82F6',
            purple: '#8B5CF6',
        }
    },

    spacing: {
        section: {
            mobile: '3rem',
            tablet: '4rem',
            desktop: '5rem',
        },
        container: {
            mobile: '1rem',
            tablet: '1.5rem',
            desktop: '2rem',
        },
    },

    animations: {
        durations: {
            instant: '100ms',
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
            slower: '700ms',
        },
        easings: {
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        spring: {
            gentle: { type: 'spring', stiffness: 100, damping: 15 },
            bouncy: { type: 'spring', stiffness: 300, damping: 20 },
            snappy: { type: 'spring', stiffness: 400, damping: 30 },
        }
    },

    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        glow: '0 0 20px rgba(79, 70, 229, 0.4)',
        glowPurple: '0 0 30px rgba(124, 58, 237, 0.3)',
        glowPink: '0 0 25px rgba(236, 72, 153, 0.3)',
    },

    typography: {
        fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
        },
        lineHeights: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        }
    },

    borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
    },

    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    }
} as const;

export type DesignTokens = typeof designTokens;
