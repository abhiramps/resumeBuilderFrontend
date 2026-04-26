import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  Resume,
  ResumeContextType,
  ATSValidation,
  ResumeSection,
  TemplateType,
} from "../types/resume.types";
import { AppAction } from "../types/actions.types";
import { createDefaultResume } from "../constants/defaultResume";
import { useAutoSave } from "../hooks/useAutoSave";
import { validateATS } from "../utils/atsValidator";
import { useUndoRedo } from "../hooks/useUndoRedo";

// Initial state
const initialState: Resume = createDefaultResume();

// Initial ATS validation state
const initialATSValidation: ATSValidation = {
  score: 100,
  issues: [],
  lastValidated: new Date().toISOString(),
};

// Resume reducer with all required action handlers
const resumeReducer = (state: Resume, action: AppAction): Resume => {
  const now = new Date().toISOString();

  switch (action.type) {
    case "SET_RESUME":
      return {
        ...action.payload,
        updatedAt: now,
      };

    case "UPDATE_PERSONAL_INFO":
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          ...action.payload,
        },
        updatedAt: now,
      };

    case "ADD_SECTION":
      return {
        ...state,
        sections: [...state.sections, action.payload],
        updatedAt: now,
      };

    case "UPDATE_SECTION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.id
            ? { ...section, ...action.payload.updates }
            : section
        ),
        updatedAt: now,
      };

    case "DELETE_SECTION":
      return {
        ...state,
        sections: state.sections.filter(
          (section) => section.id !== action.payload
        ),
        updatedAt: now,
      };

    case "REORDER_SECTIONS":
      const reorderedSections = action.payload
        .map((sectionId, index) => {
          const section = state.sections.find((s) => s.id === sectionId);
          return section ? { ...section, order: index } : null;
        })
        .filter(Boolean) as typeof state.sections;

      return {
        ...state,
        sections: reorderedSections,
        updatedAt: now,
      };

    case "UPDATE_LAYOUT":
      return {
        ...state,
        layout: {
          ...state.layout,
          ...action.payload,
        },
        updatedAt: now,
      };

    case "SET_TEMPLATE":
      return {
        ...state,
        template: action.payload,
        updatedAt: now,
      };

    case "RESET_RESUME":
      return {
        ...initialState,
        id: state.id, // Keep the same ID
        createdAt: state.createdAt, // Keep original creation date
        updatedAt: now,
      };

    // Additional action handlers for Task 4 requirements
    case "LOAD_RESUME":
      return {
        ...action.payload,
        updatedAt: now,
      };

    case "SAVE_RESUME":
      // This action doesn't modify state, just triggers save
      return state;

    case "UPDATE_FULL_NAME":
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          fullName: action.payload,
        },
        updatedAt: now,
      };

    case "UPDATE_TITLE":
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          title: action.payload,
        },
        updatedAt: now,
      };

    case "UPDATE_CONTACT_INFO":
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          ...action.payload,
        },
        updatedAt: now,
      };

    case "UPDATE_SOCIAL_LINKS":
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          ...action.payload,
        },
        updatedAt: now,
      };

    case "TOGGLE_SECTION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload
            ? { ...section, enabled: !section.enabled }
            : section
        ),
        updatedAt: now,
      };

    case "DUPLICATE_SECTION":
      const sectionToDuplicate = state.sections.find(
        (s) => s.id === action.payload
      );
      if (sectionToDuplicate) {
        const duplicatedSection: ResumeSection = {
          ...sectionToDuplicate,
          id: Math.random().toString(36).substr(2, 9), // Generate new ID
          title: `${sectionToDuplicate.title} (Copy)`,
          order: Math.max(...state.sections.map((s) => s.order)) + 1,
        };
        return {
          ...state,
          sections: [...state.sections, duplicatedSection],
          updatedAt: now,
        };
      }
      return state;

    case "UPDATE_MARGINS":
      return {
        ...state,
        layout: {
          ...state.layout,
          pageMargins: {
            ...state.layout.pageMargins,
            ...action.payload,
          },
        },
        updatedAt: now,
      };

    case "UPDATE_SPACING":
      return {
        ...state,
        layout: {
          ...state.layout,
          ...action.payload,
        },
        updatedAt: now,
      };

    case "UPDATE_FONT_SIZES":
      return {
        ...state,
        layout: {
          ...state.layout,
          fontSize: {
            ...state.layout.fontSize,
            ...action.payload,
          },
        },
        updatedAt: now,
      };

    case "UPDATE_FONT_FAMILY":
      return {
        ...state,
        layout: {
          ...state.layout,
          fontFamily: action.payload,
        },
        updatedAt: now,
      };

    case "UPDATE_COLORS":
      return {
        ...state,
        layout: {
          ...state.layout,
          colors: {
            ...state.layout.colors,
            ...action.payload,
          },
        },
        updatedAt: now,
      };

    case "RESET_TEMPLATE":
      return {
        ...state,
        template: "professional" as TemplateType,
        updatedAt: now,
      };

    // Content-specific actions
    case "UPDATE_SUMMARY":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "summary"
            ? {
                ...section,
                content: { summary: action.payload.summary },
              }
            : section
        ),
        updatedAt: now,
      };

    case "ADD_EXPERIENCE":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "experience"
            ? {
                ...section,
                content: {
                  experiences: [
                    ...(section.content as any).experiences,
                    action.payload.experience,
                  ],
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "UPDATE_EXPERIENCE":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "experience"
            ? {
                ...section,
                content: {
                  experiences: (section.content as any).experiences.map(
                    (exp: any) =>
                      exp.id === action.payload.experienceId
                        ? { ...exp, ...action.payload.updates }
                        : exp
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "DELETE_EXPERIENCE":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "experience"
            ? {
                ...section,
                content: {
                  experiences: (section.content as any).experiences.filter(
                    (exp: any) => exp.id !== action.payload.experienceId
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "REORDER_EXPERIENCES":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "experience"
            ? {
                ...section,
                content: {
                  experiences: action.payload.experienceIds
                    .map((id) =>
                      (section.content as any).experiences.find(
                        (exp: any) => exp.id === id
                      )
                    )
                    .filter(Boolean),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    // Similar handlers for other content types (projects, skills, education, certifications)
    case "ADD_PROJECT":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "projects"
            ? {
                ...section,
                content: {
                  projects: [
                    ...(section.content as any).projects,
                    action.payload.project,
                  ],
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "UPDATE_PROJECT":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "projects"
            ? {
                ...section,
                content: {
                  projects: (section.content as any).projects.map((proj: any) =>
                    proj.id === action.payload.projectId
                      ? { ...proj, ...action.payload.updates }
                      : proj
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "projects"
            ? {
                ...section,
                content: {
                  projects: (section.content as any).projects.filter(
                    (proj: any) => proj.id !== action.payload.projectId
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "REORDER_PROJECTS":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "projects"
            ? {
                ...section,
                content: {
                  projects: action.payload.projectIds
                    .map((id) =>
                      (section.content as any).projects.find(
                        (proj: any) => proj.id === id
                      )
                    )
                    .filter(Boolean),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "ADD_SKILL":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "skills"
            ? {
                ...section,
                content: {
                  skills: [
                    ...(section.content as any).skills,
                    action.payload.skill,
                  ],
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "UPDATE_SKILL":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "skills"
            ? {
                ...section,
                content: {
                  skills: (section.content as any).skills.map((skill: any) =>
                    skill.id === action.payload.skillId
                      ? { ...skill, ...action.payload.updates }
                      : skill
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "DELETE_SKILL":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "skills"
            ? {
                ...section,
                content: {
                  skills: (section.content as any).skills.filter(
                    (skill: any) => skill.id !== action.payload.skillId
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "REORDER_SKILLS":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "skills"
            ? {
                ...section,
                content: {
                  skills: action.payload.skillIds
                    .map((id) =>
                      (section.content as any).skills.find(
                        (skill: any) => skill.id === id
                      )
                    )
                    .filter(Boolean),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "ADD_EDUCATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "education"
            ? {
                ...section,
                content: {
                  education: [
                    ...(section.content as any).education,
                    action.payload.education,
                  ],
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "UPDATE_EDUCATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "education"
            ? {
                ...section,
                content: {
                  education: (section.content as any).education.map(
                    (edu: any) =>
                      edu.id === action.payload.educationId
                        ? { ...edu, ...action.payload.updates }
                        : edu
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "DELETE_EDUCATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "education"
            ? {
                ...section,
                content: {
                  education: (section.content as any).education.filter(
                    (edu: any) => edu.id !== action.payload.educationId
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "REORDER_EDUCATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "education"
            ? {
                ...section,
                content: {
                  education: action.payload.educationIds
                    .map((id) =>
                      (section.content as any).education.find(
                        (edu: any) => edu.id === id
                      )
                    )
                    .filter(Boolean),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "ADD_CERTIFICATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "certifications"
            ? {
                ...section,
                content: {
                  certifications: [
                    ...(section.content as any).certifications,
                    action.payload.certification,
                  ],
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "UPDATE_CERTIFICATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "certifications"
            ? {
                ...section,
                content: {
                  certifications: (section.content as any).certifications.map(
                    (cert: any) =>
                      cert.id === action.payload.certificationId
                        ? { ...cert, ...action.payload.updates }
                        : cert
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "DELETE_CERTIFICATION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "certifications"
            ? {
                ...section,
                content: {
                  certifications: (
                    section.content as any
                  ).certifications.filter(
                    (cert: any) => cert.id !== action.payload.certificationId
                  ),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "REORDER_CERTIFICATIONS":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId &&
          section.type === "certifications"
            ? {
                ...section,
                content: {
                  certifications: action.payload.certificationIds
                    .map((id) =>
                      (section.content as any).certifications.find(
                        (cert: any) => cert.id === id
                      )
                    )
                    .filter(Boolean),
                },
              }
            : section
        ),
        updatedAt: now,
      };

    case "UPDATE_CUSTOM_SECTION":
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId && section.type === "custom"
            ? {
                ...section,
                content: {
                  custom: {
                    id: (section.content as any).custom.id,
                    title: action.payload.title,
                    content: action.payload.content,
                  },
                },
              }
            : section
        ),
        updatedAt: now,
      };

    // ATS validation actions
    case "VALIDATE_ATS":
      // This action doesn't modify state, validation is handled in useEffect
      return state;

    case "CLEAR_ATS_ISSUES":
      // This action doesn't modify state, ATS issues are managed separately
      return state;

    case "FIX_ATS_ISSUE":
      // This action doesn't modify state, fixing is handled by other actions
      return state;

    // UI actions (these don't modify resume state)
    case "SET_LOADING":
    case "SET_ERROR":
    case "CLEAR_ERROR":
    case "SET_PREVIEW_MODE":
    case "TOGGLE_SIDEBAR":
    case "SET_ACTIVE_SECTION":
      return state;

    default:
      return state;
  }
};

// ATS Validation is now handled by the comprehensive validator in utils/atsValidator.ts

// Context creation
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Provider component
interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resume, dispatch] = useReducer(resumeReducer, initialState);
  const [atsValidation, setAtsValidation] =
    React.useState<ATSValidation>(initialATSValidation);
  const [isLoading] = React.useState(false);
  const [error] = React.useState<string | null>(null);

  // Undo/Redo functionality
  const { canUndo, canRedo, undo, redo } = useUndoRedo(resume, (newState) => {
    dispatch({ type: "SET_RESUME", payload: newState });
  });

  // Auto-save hook
  useAutoSave(resume, {
    interval: 30000, // 30 seconds
    debounceDelay: 1000, // 1 second
    saveOnUnload: true,
    restoreOnMount: true,
    showStatus: true,
  });

  // Validate ATS whenever resume changes (debounced to avoid performance issues)
  useEffect(() => {
    const timer = setTimeout(() => {
      const validation = validateATS(resume);
      setAtsValidation(validation);
    }, 500); // Debounce ATS validation by 500ms

    return () => clearTimeout(timer);
  }, [resume.personalInfo, resume.sections, resume.layout]);

  // Initialize with default data and optionally restore saved data
  // NOTE: Initialization is disabled to allow EditorPage to load data from backend
  // useEffect(() => {
  //   const initializeData = async () => {
  //     try {
  //       // First, clear any potentially corrupted localStorage data (temporary fix)
  //       localStorage.removeItem('resumeDraft');
  //       localStorage.removeItem('resumeBackup');
  //       console.log("Cleared localStorage for fresh start");

  //       // Always start with default resume for now
  //       console.log("Using default resume data with sample content");
  //       dispatch({ type: "SET_RESUME", payload: initialState });

  //       // TODO: Re-enable restore functionality after testing
  //       // const restoredResume = await autoSave.restoreData();
  //       // if (restoredResume && restoredResume.personalInfo && restoredResume.sections) {
  //       //   dispatch({ type: "SET_RESUME", payload: restoredResume });
  //       // }
  //     } catch (err) {
  //       console.error("Failed to initialize resume:", err);
  //       dispatch({ type: "SET_RESUME", payload: initialState });
  //     }
  //   };

  //   initializeData();
  // }, []); // Remove autoSave dependency to prevent infinite loop

  // Handle auto-save errors - removed to prevent infinite loops
  // useEffect(() => {
  //   if (autoSave.error) {
  //     setError(autoSave.error);
  //   }
  // }, [autoSave.error]);

  const contextValue = useMemo<ResumeContextType>(
    () => ({
      resume,
      dispatch,
      atsValidation,
      isLoading,
      error,
      canUndo,
      canRedo,
      undo,
      redo,
    }),
    [resume, atsValidation, isLoading, error, canUndo, canRedo, undo, redo]
  );

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
};

// Custom hook to use the context (Task 4 requirement)
export const useResumeContext = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumeContext must be used within a ResumeProvider");
  }
  return context;
};

// Legacy hook for backward compatibility
export const useResume = useResumeContext;

// Export the context for advanced usage
export { ResumeContext };
