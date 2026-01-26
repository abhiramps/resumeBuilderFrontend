import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input, Button } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";
import { PersonalInfo } from "../../types/resume.types";

/**
 * Custom link interface for additional URLs
 */
interface CustomLink {
  id: string;
  label: string;
  url: string;
}

/**
 * Personal Info Editor Component Props
 */
export interface PersonalInfoEditorProps {
  className?: string;
}

/**
 * Validation error interface
 */
interface ValidationErrors {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  customLinks?: { [key: string]: string | undefined };
}

/**
 * Personal Information Editor Component
 *
 * Provides a comprehensive form for editing personal information with:
 * - Real-time validation
 * - Custom links management
 * - Context integration
 * - Collapsible sections
 * - Error handling
 */
export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  className = "",
}) => {
  const { resume, dispatch } = useResumeContext();
  const {
    currentResume,
    updateResume,
  } = useResumeBackend();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(
    resume.personalInfo
  );
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCollapsed, setIsCollapsed] = useState(true);
  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedDataRef = useRef<string>(JSON.stringify(resume.personalInfo));

  // Update local state when context changes
  useEffect(() => {
    setPersonalInfo(resume.personalInfo);
  }, [resume.personalInfo]);

  /**
   * Email validation regex
   */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Phone validation regex (supports various formats)
   */
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

  /**
   * URL validation regex
   */
  const urlRegex =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  /**
   * Check if the personal info is valid for saving to backend
   */
  const isPersonalInfoValid = (info: PersonalInfo): boolean => {
    // Check required fields
    if (!info.fullName.trim()) return false;
    if (!info.title.trim()) return false;
    if (!info.location.trim()) return false;

    // Check formatted fields
    if (validateEmail(info.email)) return false;
    if (validatePhone(info.phone)) return false;

    // Check optional URLs
    if (info.linkedin && validateUrl(info.linkedin, "LinkedIn")) return false;
    if (info.github && validateUrl(info.github, "GitHub")) return false;
    if (info.portfolio && validateUrl(info.portfolio, "Portfolio")) return false;

    return true;
  };

  /**
   * Validate email format
   */
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  /**
   * Validate phone format
   */
  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid phone number";
    }
    return undefined;
  };

  /**
   * Validate URL format
   */
  const validateUrl = (url: string, fieldName: string): string | undefined => {
    if (!url.trim()) {
      return undefined; // URLs are optional
    }
    if (!urlRegex.test(url)) {
      return `Please enter a valid ${fieldName} URL`;
    }
    return undefined;
  };



  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * content mapper helper (reused from ProjectsEditor concept)
   */
  const mapResumeToContent = (currentResume: any, updatedPersonalInfo: PersonalInfo) => {
      const content: any = {
          personalInfo: updatedPersonalInfo,
          sectionOrder: currentResume.content?.sectionOrder || [],
          // Preserve other sections
          summary: currentResume.content?.summary,
          experience: currentResume.content?.experience,
          education: currentResume.content?.education,
          skills: currentResume.content?.skills,
          certifications: currentResume.content?.certifications,
          projects: currentResume.content?.projects,
          languages: currentResume.content?.languages,
          customSections: currentResume.content?.customSections,
          layout: currentResume.content?.layout,
          additionalInfo: currentResume.content?.additionalInfo
      };
      return content;
  };

  /**
   * Save to backend helper
   */
  const saveToBackend = async (updatedInfo: PersonalInfo) => {
    if (!currentResume) return;

    try {
      setSaveStatus("saving");
      
      const content = mapResumeToContent(currentResume, updatedInfo);
      
      await updateResume({ content });
      
      setSaveStatus("saved");
      lastSavedDataRef.current = JSON.stringify(updatedInfo);
      
      // Reset to idle after delay
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    }
  };

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback(
    (updatedInfo: PersonalInfo) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setSaveStatus("saving");

      debounceTimerRef.current = setTimeout(() => {
        // 1. Update Context (always update UI state)
        dispatch({
          type: "UPDATE_PERSONAL_INFO",
          payload: updatedInfo,
        });

        // 2. Persist to Backend - ONLY if valid to avoid API errors
        if (isPersonalInfoValid(updatedInfo)) {
          saveToBackend(updatedInfo);
        } else {
          // If invalid, don't try to save to backend, just reset status
          setSaveStatus("idle");
        }
      }, 1000); // 1 second delay
    },
    [dispatch, currentResume, updateResume]
  );

  /**
   * Handle input change with real-time validation and autosave
   */
  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    const updatedInfo = { ...personalInfo, [field]: value };
    setPersonalInfo(updatedInfo);

    // Real-time validation for specific fields
    let fieldError: string | undefined;
    switch (field) {
      case "email":
        fieldError = validateEmail(value);
        break;
      case "phone":
        fieldError = validatePhone(value);
        break;
      case "linkedin":
        fieldError = validateUrl(value, "LinkedIn");
        break;
      case "github":
        fieldError = validateUrl(value, "GitHub");
        break;
      case "portfolio":
        fieldError = validateUrl(value, "Portfolio");
        break;
      default:
        fieldError = undefined;
    }

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));

    // Trigger autosave
    debouncedSave(updatedInfo);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Add custom link
   */
  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: Math.random().toString(36).substr(2, 9),
      label: "",
      url: "",
    };
    setCustomLinks([...customLinks, newLink]);
  };

  /**
   * Remove custom link
   */
  const removeCustomLink = (id: string) => {
    setCustomLinks(customLinks.filter((link) => link.id !== id));
    // Clear any errors for this link
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors.customLinks) {
        delete newErrors.customLinks[id];
      }
      return newErrors;
    });
  };

  /**
   * Update custom link
   */
  const updateCustomLink = (
    id: string,
    field: keyof CustomLink,
    value: string
  ) => {
    setCustomLinks(
      customLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );

    // Validate URL if it's the url field
    if (field === "url") {
      const link = customLinks.find((l) => l.id === id);
      const label = link?.label || "Custom link";
      const urlError = validateUrl(value, label);

      setErrors((prev) => ({
        ...prev,
        customLinks: {
          ...prev.customLinks,
          [id]: urlError,
        },
      }));
    }
  };

  /**
   * Collapse/expand icon
   */


  return (
    <div className={`bg-white rounded-lg border border-gray-200 mb-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        {/* Title - Clickable to collapse/expand */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-1 text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          Personal Information
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          )}
        </button>

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

      {/* Form Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Full Name"
                value={personalInfo.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={errors.fullName}
                required
                placeholder="John Doe"
              />

              <Input
                label="Professional Title"
                value={personalInfo.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                error={errors.title}
                required
                placeholder="Software Engineer"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={personalInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                required
                placeholder="john.doe@email.com"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                required
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <Input
              label="Location"
              value={personalInfo.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              error={errors.location}
              required
              placeholder="San Francisco, CA"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
              Social Links
            </h4>

            <div className="space-y-4">
              <Input
                label="LinkedIn URL"
                type="url"
                value={personalInfo.linkedin || ""}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                error={errors.linkedin}
                placeholder="https://linkedin.com/in/johndoe"
                helperText="Optional - Your LinkedIn profile"
              />

              <Input
                label="GitHub URL"
                type="url"
                value={personalInfo.github || ""}
                onChange={(e) => handleInputChange("github", e.target.value)}
                error={errors.github}
                placeholder="https://github.com/johndoe"
                helperText="Optional - Your GitHub profile"
              />

              <Input
                label="Portfolio URL"
                type="url"
                value={personalInfo.portfolio || ""}
                onChange={(e) => handleInputChange("portfolio", e.target.value)}
                error={errors.portfolio}
                placeholder="https://johndoe.dev"
                helperText="Optional - Your personal website or portfolio"
              />
            </div>
          </div>

          {/* Custom Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
                Additional Links
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCustomLink}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Add Link
              </Button>
            </div>

            {customLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 space-y-3">
                  <Input
                    label="Link Label"
                    value={link.label}
                    onChange={(e) =>
                      updateCustomLink(link.id, "label", e.target.value)
                    }
                    placeholder="e.g., Blog, Twitter, Medium"
                  />
                  <Input
                    label="URL"
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateCustomLink(link.id, "url", e.target.value)
                    }
                    error={errors.customLinks?.[link.id]}
                    placeholder="https://example.com"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomLink(link.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            ))}

            {customLinks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No additional links added yet. Click "Add Link" to include more
                URLs.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoEditor;
