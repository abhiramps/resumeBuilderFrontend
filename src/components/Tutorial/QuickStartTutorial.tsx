import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '../UI/Button';

/**
 * Tutorial step configuration
 */
interface TutorialStep {
    id: number;
    title: string;
    description: string;
    targetSelector?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: string;
}

/**
 * Tutorial steps configuration
 */
const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 1,
        title: 'Welcome to Resume Builder',
        description: 'Let\'s take a quick tour to help you create your perfect resume in minutes.',
        position: 'center',
    },
    {
        id: 2,
        title: 'Choose a Template',
        description: 'Start by selecting a professional template that matches your style. You can change it anytime.',
        targetSelector: '[data-tutorial="template-selector"]',
        position: 'right',
        action: 'Click on any template to select it',
    },
    {
        id: 3,
        title: 'Fill Personal Information',
        description: 'Add your contact details and professional title. This information appears at the top of your resume.',
        targetSelector: '[data-tutorial="personal-info"]',
        position: 'right',
        action: 'Fill in your name, email, and phone number',
    },
    {
        id: 4,
        title: 'Add Work Experience',
        description: 'Showcase your professional experience. Add job titles, companies, dates, and key achievements.',
        targetSelector: '[data-tutorial="work-experience"]',
        position: 'right',
        action: 'Click "Add Experience" to get started',
    },
    {
        id: 5,
        title: 'Customize Layout',
        description: 'Adjust margins, spacing, fonts, and colors to make your resume stand out while staying ATS-friendly.',
        targetSelector: '[data-tutorial="layout-controls"]',
        position: 'left',
        action: 'Try adjusting the layout settings',
    },
    {
        id: 6,
        title: 'Export Your Resume',
        description: 'When you\'re ready, export your resume as a PDF. Your work is automatically saved as you go.',
        targetSelector: '[data-tutorial="export-button"]',
        position: 'bottom',
        action: 'Click "Export PDF" when ready',
    },
];

/**
 * Local storage key for tutorial completion status
 */
const TUTORIAL_STORAGE_KEY = 'resumeBuilder_tutorialCompleted';
const TUTORIAL_SKIP_KEY = 'resumeBuilder_tutorialSkipped';
const TUTORIAL_SHOWN_RESUMES_KEY = 'resumeBuilder_tutorialShownResumes';

interface QuickStartTutorialProps {
    /** Callback when tutorial is completed */
    onComplete?: () => void;
    /** Callback when tutorial is skipped */
    onSkip?: () => void;
    /** Force show tutorial even if completed */
    forceShow?: boolean;
    /** Resume ID to track if tutorial was shown for this resume */
    resumeId?: string;
    /** Whether this is a newly created resume */
    isNewResume?: boolean;
}

/**
 * Interactive Quick Start Tutorial Component
 * 
 * Provides step-by-step walkthrough for new users with:
 * - Interactive overlays highlighting UI elements
 * - Step indicators showing progress
 * - Skip and replay options
 * - Persistent completion tracking
 */
export const QuickStartTutorial: React.FC<QuickStartTutorialProps> = ({
    onComplete,
    onSkip,
    forceShow = false,
    resumeId,
    isNewResume = false,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightPosition, setHighlightPosition] = useState<DOMRect | null>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    /**
     * Check if tutorial was already shown for this resume
     */
    const wasTutorialShownForResume = useCallback((id: string): boolean => {
        try {
            const shownResumes = localStorage.getItem(TUTORIAL_SHOWN_RESUMES_KEY);
            if (!shownResumes) return false;
            const resumeIds = JSON.parse(shownResumes) as string[];
            return resumeIds.includes(id);
        } catch (error) {
            console.error('Error checking tutorial status:', error);
            return false;
        }
    }, []);

    /**
     * Mark tutorial as shown for this resume
     */
    const markTutorialShownForResume = useCallback((id: string) => {
        try {
            const shownResumes = localStorage.getItem(TUTORIAL_SHOWN_RESUMES_KEY);
            const resumeIds = shownResumes ? JSON.parse(shownResumes) as string[] : [];
            if (!resumeIds.includes(id)) {
                resumeIds.push(id);
                localStorage.setItem(TUTORIAL_SHOWN_RESUMES_KEY, JSON.stringify(resumeIds));
            }
        } catch (error) {
            console.error('Error marking tutorial as shown:', error);
        }
    }, []);

    /**
     * Check if tutorial should be shown
     */
    useEffect(() => {
        const hasCompletedGlobally = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
        const hasSkippedGlobally = localStorage.getItem(TUTORIAL_SKIP_KEY) === 'true';

        // Don't show if user has globally disabled it
        if (hasCompletedGlobally || hasSkippedGlobally) {
            return;
        }

        // Show if forced
        if (forceShow) {
            setTimeout(() => setIsVisible(true), 500);
            return;
        }

        // Show only for new resumes that haven't seen the tutorial yet
        if (isNewResume && resumeId && !wasTutorialShownForResume(resumeId)) {
            setTimeout(() => {
                setIsVisible(true);
                markTutorialShownForResume(resumeId);
            }, 500);
        }
    }, [forceShow, resumeId, isNewResume, wasTutorialShownForResume, markTutorialShownForResume]);

    /**
     * Update target element and highlight position when step changes
     */
    useEffect(() => {
        if (!isVisible) return;

        const step = TUTORIAL_STEPS[currentStep];

        if (step.targetSelector) {
            const element = document.querySelector(step.targetSelector) as HTMLElement;

            if (element) {
                const rect = element.getBoundingClientRect();
                setHighlightPosition(rect);

                // Scroll element into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setHighlightPosition(null);
            }
        } else {
            setHighlightPosition(null);
        }
    }, [currentStep, isVisible]);

    /**
     * Handle next step
     */
    const handleNext = useCallback(() => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    }, [currentStep]);

    /**
     * Handle previous step
     */
    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    /**
     * Handle tutorial completion
     */
    const handleComplete = useCallback(() => {
        if (dontShowAgain) {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        }
        setIsVisible(false);
        onComplete?.();
    }, [dontShowAgain, onComplete]);

    /**
     * Handle tutorial skip
     */
    const handleSkip = useCallback(() => {
        if (dontShowAgain) {
            localStorage.setItem(TUTORIAL_SKIP_KEY, 'true');
        }
        setIsVisible(false);
        onSkip?.();
    }, [dontShowAgain, onSkip]);

    /**
     * Calculate tooltip position based on target element and preferred position
     */
    const getTooltipPosition = useCallback(() => {
        if (!highlightPosition) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const step = TUTORIAL_STEPS[currentStep];
        const padding = 20;
        const tooltipWidth = 400;
        const tooltipHeight = 250;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate safe boundaries
        const minLeft = padding;
        const maxLeft = viewportWidth - tooltipWidth - padding;
        const minTop = padding;
        const maxTop = viewportHeight - tooltipHeight - padding;

        let position = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        switch (step.position) {
            case 'right':
                // Check if there's enough space on the right
                const rightPosition = highlightPosition.right + padding;
                if (rightPosition + tooltipWidth < viewportWidth - padding) {
                    const topPos = Math.max(minTop, Math.min(maxTop, highlightPosition.top + highlightPosition.height / 2 - tooltipHeight / 2));
                    position = {
                        top: `${topPos}px`,
                        left: `${rightPosition}px`,
                        transform: 'none',
                    };
                } else {
                    // Fall back to center
                    position = {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    };
                }
                break;
            case 'left':
                // Check if there's enough space on the left
                const leftPosition = highlightPosition.left - tooltipWidth - padding;
                if (leftPosition > padding) {
                    const topPos = Math.max(minTop, Math.min(maxTop, highlightPosition.top + highlightPosition.height / 2 - tooltipHeight / 2));
                    position = {
                        top: `${topPos}px`,
                        left: `${leftPosition}px`,
                        transform: 'none',
                    };
                } else {
                    // Fall back to center
                    position = {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    };
                }
                break;
            case 'top':
                // Check if there's enough space on top
                const topPosition = highlightPosition.top - tooltipHeight - padding;
                if (topPosition > padding) {
                    const leftPos = Math.max(minLeft, Math.min(maxLeft, highlightPosition.left + highlightPosition.width / 2 - tooltipWidth / 2));
                    position = {
                        top: `${topPosition}px`,
                        left: `${leftPos}px`,
                        transform: 'none',
                    };
                } else {
                    // Fall back to center
                    position = {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    };
                }
                break;
            case 'bottom':
                // Check if there's enough space on bottom
                const bottomPosition = highlightPosition.bottom + padding;
                if (bottomPosition + tooltipHeight < viewportHeight - padding) {
                    const leftPos = Math.max(minLeft, Math.min(maxLeft, highlightPosition.left + highlightPosition.width / 2 - tooltipWidth / 2));
                    position = {
                        top: `${bottomPosition}px`,
                        left: `${leftPos}px`,
                        transform: 'none',
                    };
                } else {
                    // Fall back to center
                    position = {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    };
                }
                break;
            default:
                position = {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                };
        }

        return position;
    }, [highlightPosition, currentStep]);

    if (!isVisible) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay with spotlight effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40">
                {highlightPosition && (
                    <div
                        className="absolute border-4 border-blue-500 rounded-lg shadow-2xl pointer-events-none animate-pulse z-50"
                        style={{
                            top: `${highlightPosition.top - 8}px`,
                            left: `${highlightPosition.left - 8}px`,
                            width: `${highlightPosition.width + 16}px`,
                            height: `${highlightPosition.height + 16}px`,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                        }}
                    />
                )}
            </div>

            {/* Tutorial tooltip */}
            <div
                className="absolute bg-white rounded-lg shadow-2xl p-6 max-w-md z-[60]"
                style={{ ...getTooltipPosition(), width: '400px' }}
            >
                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close tutorial"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                        </span>
                        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Step content */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {step.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                        {step.description}
                    </p>
                    {step.action && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900 font-medium">
                                {step.action}
                            </p>
                        </div>
                    )}
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {TUTORIAL_STEPS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentStep
                                ? 'bg-blue-600 w-8'
                                : index < currentStep
                                    ? 'bg-blue-400'
                                    : 'bg-gray-300'
                                }`}
                            aria-label={`Go to step ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {!isFirstStep && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrevious}
                                leftIcon={<ChevronLeft className="w-4 h-4" />}
                            >
                                Previous
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleSkip}
                        >
                            Skip for now
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleNext}
                            rightIcon={
                                isLastStep ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )
                            }
                        >
                            {isLastStep ? 'Get Started' : 'Next'}
                        </Button>
                    </div>
                </div>

                {/* Don't show again checkbox */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                            Don't show this tutorial again
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

/**
 * Hook to replay tutorial
 */
export const useReplayTutorial = () => {
    const replayTutorial = useCallback(() => {
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        localStorage.removeItem(TUTORIAL_SKIP_KEY);
        window.location.reload();
    }, []);

    return { replayTutorial };
};
