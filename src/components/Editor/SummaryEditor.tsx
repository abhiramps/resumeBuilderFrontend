import React, { useState, useCallback, useRef, useEffect } from "react";
import { Textarea, Button } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";

/**
 * Summary Editor Component Props
 */
export interface SummaryEditorProps {
  className?: string;
}

/**
 * ATS Keywords by category for suggestions
 */
const ATS_KEYWORDS = {
  technical: [
    "software development",
    "full-stack",
    "agile",
    "cloud computing",
    "microservices",
    "API development",
    "database design",
    "DevOps",
    "CI/CD",
    "testing",
    "debugging",
    "optimization",
    "scalable",
    "architecture",
  ],
  leadership: [
    "team leadership",
    "project management",
    "mentoring",
    "cross-functional",
    "stakeholder management",
    "strategic planning",
    "process improvement",
    "collaboration",
  ],
  achievements: [
    "increased efficiency",
    "reduced costs",
    "improved performance",
    "delivered projects",
    "exceeded targets",
    "streamlined processes",
    "enhanced user experience",
  ],
};

/**
 * Sample summaries for inspiration
 */
const SAMPLE_SUMMARIES = [
  "Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-quality solutions that improve user experience and business outcomes.",

  "Full-stack developer specializing in modern JavaScript frameworks and cloud-native architectures. Strong background in agile methodologies, API development, and database optimization. Passionate about mentoring junior developers and implementing best practices.",

  "Results-driven software engineer with expertise in microservices architecture and DevOps practices. Successfully delivered 15+ projects on time and under budget while maintaining 99.9% system uptime. Experienced in leading technical initiatives and process improvements.",
];

/**
 * Tips for writing effective summaries
 */
const SUMMARY_TIPS = [
  "Keep it concise: 3-5 sentences, 150-300 characters",
  "Start with your years of experience and main expertise",
  "Include 2-3 key technical skills or technologies",
  "Mention leadership or collaboration experience",
  "End with what you're passionate about or seeking",
  "Use action words and quantifiable achievements",
  "Avoid first-person pronouns (I, me, my)",
  "Include industry-specific keywords for ATS",
];

/**
 * Professional Summary Editor Component
 *
 * Provides a comprehensive editor for the professional summary section with:
 * - Large textarea with auto-resize
 * - Character and word count tracking
 * - ATS keyword suggestions
 * - Real-time validation
 * - Sample summaries
 * - Writing tips
 * - Collapsible interface
 */
export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  className = "",
}) => {
  const { resume, dispatch } = useResumeContext();
  const { currentResume, updateResume } = useResumeBackend();
  const [showTips, setShowTips] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  
  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Find the summary section
  const summarySection = (resume.sections || []).find(
    (section) => section.type === "summary"
  );

  const propsSummary = summarySection?.content
    ? (summarySection.content as { summary: string }).summary
    : "";

  // Local state for immediate UI updates
  const [localSummary, setLocalSummary] = useState(propsSummary);

  // Sync local state when props change (e.g., loading saved data)
  useEffect(() => {
    setLocalSummary(propsSummary);
  }, [summarySection?.id]); // Only sync when section changes

  // Character and word counts (use local state)
  const charCount = localSummary.length;
  const wordCount = localSummary.trim() ? localSummary.trim().split(/\s+/).length : 0;

  // Validation states
  const isOptimalLength = charCount >= 150 && charCount <= 300;
  const hasSpecialChars = /[^\w\s.,;:!?()-]/.test(localSummary);
  const isValidFormat = !hasSpecialChars;

  // Ref to store the debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * content mapper helper
   */
  const mapResumeToContent = (updatedSummary: string) => {
      const content: any = {
          personalInfo: resume.personalInfo,
          sectionOrder: resume.sections.map(s => ({
              id: s.id,
              type: s.type,
              title: s.title,
              enabled: s.enabled,
              order: s.order
          })),
          summary: updatedSummary,
          // Map other sections from backend state if available to preserve them
          experience: currentResume?.content?.experience || (resume.sections.find(s => s.type === 'experience')?.content as any)?.experiences || [],
          education: currentResume?.content?.education || (resume.sections.find(s => s.type === 'education')?.content as any)?.education || [],
          skills: currentResume?.content?.skills || (resume.sections.find(s => s.type === 'skills')?.content as any)?.skills || [],
          certifications: currentResume?.content?.certifications || (resume.sections.find(s => s.type === 'certifications')?.content as any)?.certifications || [],
          projects: currentResume?.content?.projects || (resume.sections.find(s => s.type === 'projects')?.content as any)?.projects || [],
          languages: currentResume?.content?.languages || [],
          customSections: currentResume?.content?.customSections || resume.sections
              .filter(s => s.type === 'custom')
              .map(s => ({
                  id: s.id,
                  title: s.title,
                  content: (s.content as any)?.custom?.content || '',
                  order: s.order
              })),
          layout: currentResume?.content?.layout || resume.layout,
          additionalInfo: currentResume?.content?.additionalInfo || (resume.sections.find(s => s.type === 'additional-info')?.content as any)?.additionalInfo || []
      };
      return content;
  };

  /**
   * Save to backend helper
   */
  const saveToBackend = async (updatedValue: string) => {
    if (!currentResume) return;

    try {
      setSaveStatus("saving");
      const content = mapResumeToContent(updatedValue);
      await updateResume({ content });
      setSaveStatus("saved");
      
      // Reset to idle after delay
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    }
  };

  /**
   * Debounced update function
   */
  const debouncedUpdate = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      setSaveStatus("saving");
      
      debounceTimerRef.current = setTimeout(() => {
        if (summarySection) {
          // 1. Update local context
          dispatch({
            type: "UPDATE_SECTION",
            payload: {
              id: summarySection.id,
              updates: {
                content: { summary: value },
              },
            },
          });
          
          // 2. Persist to backend
          saveToBackend(value);
        }
      }, 1000); // 1 second debounce for backend
    },
    [dispatch, summarySection, resume, currentResume, updateResume]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle summary text change
   */
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Update local state immediately
    setLocalSummary(value);
    // Debounce parent update
    debouncedUpdate(value);
  };

  /**
   * Insert sample summary
   */
  const insertSample = (sample: string) => {
    // Update local state immediately
    setLocalSummary(sample);

    // Update parent
    if (summarySection) {
      dispatch({
        type: "UPDATE_SECTION",
        payload: {
          id: summarySection.id,
          updates: {
            content: { summary: sample },
          },
        },
      });
      
      // Save to backend immediately for selection
      saveToBackend(sample);
    }
    setShowSamples(false);
  };

  /**
   * Insert keyword at cursor position
   */
  const insertKeyword = (keyword: string) => {
    const textarea = document.querySelector('textarea[data-summary-editor]') as HTMLTextAreaElement;
    if (textarea && summarySection) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = localSummary;
      const newText = currentText.substring(0, start) + keyword + currentText.substring(end);

      // Update local state immediately
      setLocalSummary(newText);

      // Update parent
      dispatch({
        type: "UPDATE_SECTION",
        payload: {
          id: summarySection.id,
          updates: {
            content: { summary: newText },
          },
        },
      });
      
      // Save to backend
      saveToBackend(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + keyword.length, start + keyword.length);
      }, 0);
    }
  };

  /**
   * Get character count color based on length
   */
  const getCharCountColor = () => {
    if (charCount < 150) return "text-orange-600";
    if (charCount > 300) return "text-red-600";
    return "text-green-600";
  };

  // Don't render if no summary section exists
  if (!summarySection) {
    return null;
  }

  return (
    <div className={className}>
      {/* Editor Content */}
      <div className="space-y-4">
        {/* Header with Save Status */}
        <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional Summary</h4>
            <div className="flex items-center gap-3">
                 {/* Autosave Status Indicator */}
                {saveStatus === "saving" && (
                    <span className="text-xs text-gray-400 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></div>
                        Saving...
                    </span>
                )}
                {saveStatus === "saved" && (
                    <span className="text-xs text-green-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                    </span>
                )}
                {saveStatus === "error" && (
                    <span className="text-xs text-red-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Error saving
                    </span>
                )}
            </div>
        </div>

        {/* Main Editor */}
        <div className="space-y-4">
          <Textarea
            data-summary-editor
            value={localSummary}
            onChange={handleSummaryChange}
            placeholder="Write a compelling 3-5 sentence summary highlighting your experience, key skills, and career objectives..."
            autoResize
            maxLength={500}
            showCharCount={false}
            rows={6}
            className="text-sm leading-relaxed"
            helperText={
              !isValidFormat
                ? "Avoid special characters for ATS compatibility"
                : isOptimalLength
                  ? "Perfect length for ATS scanning"
                  : charCount < 150
                    ? "Consider adding more detail (150-300 characters recommended)"
                    : "Consider shortening for better readability"
            }
            error={!isValidFormat ? "Contains special characters that may not be ATS-friendly" : undefined}
          />

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                Words: <span className="font-medium">{wordCount}</span>
              </span>
              <span className="text-gray-600">
                Characters: <span className={`font-medium ${getCharCountColor()}`}>{charCount}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {isOptimalLength && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Optimal Length
                </span>
              )}
              {isValidFormat && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ✓ ATS-Friendly
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSamples(!showSamples)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Sample Summaries
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeywords(!showKeywords)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            >
              ATS Keywords
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTips(!showTips)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Writing Tips
            </Button>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Writing Tips */}
          {showTips && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-blue-900 mb-2 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Writing Tips
              </h4>
              <ul className="space-y-1.5 text-xs text-blue-800">
                {SUMMARY_TIPS.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ATS Keywords */}
          {showKeywords && (
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-green-900 mb-2 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                ATS Keywords
              </h4>
              <div className="space-y-2">
                {Object.entries(ATS_KEYWORDS).map(([category, keywords]) => (
                  <div key={category}>
                    <h5 className="text-xs font-medium text-green-800 mb-1 capitalize">
                      {category}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {keywords.slice(0, 6).map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => insertKeyword(keyword)}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Summaries */}
          {showSamples && (
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-purple-900 mb-2 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sample Summaries
              </h4>
              <div className="space-y-2">
                {SAMPLE_SUMMARIES.map((sample, index) => (
                  <div key={index} className="bg-white rounded p-2 border border-purple-200">
                    <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                      {sample}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertSample(sample)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 text-xs"
                    >
                      Use This Sample
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryEditor;