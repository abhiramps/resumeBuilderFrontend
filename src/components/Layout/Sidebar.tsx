import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  FileText, 
  Briefcase, 
  FolderGit2, 
  Cpu, 
  GraduationCap, 
  Award, 
  Layers, 
  Wand2 
} from "lucide-react";
import { useResume } from "../../contexts/ResumeContext";
import { SummaryEditor, ExperienceEditor, ProjectsEditor, SkillsEditor, EducationEditor, CertificationsEditor, SectionManager, KeywordOptimizer } from "../Editor";

interface SidebarProps {
  isCollapsed: boolean;
  onExpand?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onExpand }) => {
  const { resume, dispatch } = useResume();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["sectionManager", "personalInfo", "keywordOptimizer"])
  );

  const toggleSection = (sectionId: string) => {
    if (isCollapsed && onExpand) {
      onExpand();
      // If expanding from collapsed state, ensure the clicked section opens
      setExpandedSections((prev) => {
        const newSet = new Set(prev);
        newSet.add(sectionId);
        return newSet;
      });
      return;
    }

    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.has(sectionId);

  return (
    <div className={`h-full flex flex-col overflow-y-auto custom-scrollbar transition-all duration-300 ${isCollapsed ? "items-center" : ""}`}>
      {/* Keyword Optimizer - Collapsible */}
      <div className="border-b border-gray-200 w-full">
        {isCollapsed ? (
          <div className="p-4 flex justify-center cursor-pointer hover:bg-gray-100" onClick={onExpand} title="Keyword Optimizer">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
        ) : (
          <div className="px-4 py-4">
            <KeywordOptimizer />
          </div>
        )}
      </div>

      {/* Section Manager - Collapsible */}
      <div className="border-b border-gray-200 w-full">
        <button
          onClick={() => toggleSection("sectionManager")}
          className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
          title={isCollapsed ? "Section Manager" : ""}
        >
          <div className="flex items-center">
            <Layers className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
            {!isCollapsed && <h3 className="text-sm font-semibold text-gray-900">Section Manager</h3>}
          </div>
          {!isCollapsed && (
            isSectionExpanded("sectionManager") ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )
          )}
        </button>
        {!isCollapsed && isSectionExpanded("sectionManager") && (
          <div className="px-4 pb-4 bg-gray-50/50">
            <SectionManager />
          </div>
        )}
      </div>

      {/* Section Editors */}
      <div className="flex-1 w-full">
        {/* Personal Information Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("personalInfo")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Personal Information" : ""}
          >
            <div className="flex items-center">
              <User className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Personal Information</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("personalInfo") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("personalInfo") && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={resume.personalInfo?.fullName || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_PERSONAL_INFO",
                      payload: { fullName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={resume.personalInfo?.title || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_PERSONAL_INFO",
                      payload: { title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-all duration-200"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={resume.personalInfo?.email || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_PERSONAL_INFO",
                      payload: { email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={resume.personalInfo?.phone || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_PERSONAL_INFO",
                      payload: { phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-all duration-200"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={resume.personalInfo?.location || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_PERSONAL_INFO",
                      payload: { location: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-all duration-200"
                  placeholder="City, State"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("summary")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Professional Summary" : ""}
          >
            <div className="flex items-center">
              <FileText className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Professional Summary</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("summary") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("summary") && (
            <div className="px-4 pb-4">
              <SummaryEditor />
            </div>
          )}
        </div>

        {/* Experience Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("experience")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Work Experience" : ""}
          >
            <div className="flex items-center">
              <Briefcase className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Work Experience</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("experience") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("experience") && (
            <div className="px-4 pb-4">
              <ExperienceEditor />
            </div>
          )}
        </div>

        {/* Projects Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("projects")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Projects" : ""}
          >
            <div className="flex items-center">
              <FolderGit2 className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Projects</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("projects") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("projects") && (
            <div className="px-4 pb-4">
              <ProjectsEditor />
            </div>
          )}
        </div>

        {/* Skills Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("skills")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Technical Skills" : ""}
          >
            <div className="flex items-center">
              <Cpu className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Technical Skills</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("skills") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("skills") && (
            <div className="px-4 pb-4">
              <SkillsEditor />
            </div>
          )}
        </div>

        {/* Education Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("education")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Education" : ""}
          >
            <div className="flex items-center">
              <GraduationCap className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Education</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("education") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("education") && (
            <div className="px-4 pb-4">
              <EducationEditor />
            </div>
          )}
        </div>

        {/* Certifications Editor - Collapsible */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("certifications")}
            className={`w-full p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} hover:bg-gray-100 transition-colors`}
            title={isCollapsed ? "Certifications" : ""}
          >
            <div className="flex items-center">
              <Award className={`w-5 h-5 ${isCollapsed ? "text-gray-600" : "text-primary mr-3"}`} />
              {!isCollapsed && <h4 className="text-sm font-semibold text-gray-900">Certifications</h4>}
            </div>
            {!isCollapsed && (
              isSectionExpanded("certifications") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>
          {!isCollapsed && isSectionExpanded("certifications") && (
            <div className="px-4 pb-4">
              <CertificationsEditor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
