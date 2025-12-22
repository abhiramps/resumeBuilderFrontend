import React, { forwardRef, memo } from "react";
import { TemplateBaseProps } from "./TemplateBase";
import { templateHelpers } from "../../utils/templateHelpers";
import {
  WorkExperience,
  Education,
  Skill,
  Certification,
  Project,
} from "../../types/resume.types";

/**
 * Classic Template Component
 *
 * Traditional, conservative resume template suitable for corporate environments.
 * Features:
 * - Times New Roman font (serif)
 * - Centered header with name and contact info
 * - Uppercase section headers with underline
 * - Traditional bullet points
 * - Single-column chronological layout
 * - Black text on white background
 *
 * ATS Compliance: 95/100
 * Best For: Traditional industries, conservative companies, senior roles
 */
const ClassicTemplateComponent = forwardRef<HTMLDivElement, TemplateBaseProps>(
  (props, ref) => {
    const { resume, layout, className = "", printMode = false } = props;
    // Get enabled sections in order
    const enabledSections = resume.sections
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order);

    // Use layout colors or fall back to classic black/white
    const primaryColor = layout.colors?.primary || "#000000";
    const secondaryColor = layout.colors?.secondary || "#333333";
    const textColor = layout.colors?.text || "#000000";

    // Classic template uses Times New Roman with conservative styling
    const containerStyles: React.CSSProperties = {
      fontFamily: layout.fontFamily || "Times New Roman, serif",
      fontSize: `${layout.fontSize.body}pt`,
      lineHeight: layout.lineHeight,
      color: textColor,
      backgroundColor: "white",
      width: printMode ? "100%" : "100%",
      maxWidth: printMode ? "none" : "8.5in",
      minHeight: printMode ? "auto" : "auto",
      // Print mode: no padding (wrapper provides margins)
      // Normal mode: apply user-defined padding
      padding: printMode
        ? 0
        : `${layout.pageMargins.top}in ${layout.pageMargins.right}in ${layout.pageMargins.bottom}in ${layout.pageMargins.left}in`,
      boxShadow: printMode ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    };

    const headerStyles: React.CSSProperties = {
      textAlign: "center",
      marginBottom: `${layout.sectionSpacing}px`,
      borderBottom: `2px solid ${primaryColor}`,
      paddingBottom: "12px",
    };

    const nameStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.name}pt`,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: "6px",
      lineHeight: 1.2,
      textTransform: "uppercase",
      letterSpacing: "1px",
    };

    const titleStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.title}pt`,
      color: secondaryColor,
      marginBottom: "8px",
      fontStyle: "italic",
    };

    const contactStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.body - 1}pt`,
      color: secondaryColor,
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "12px",
    };

    const sectionHeaderStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.sectionHeader}pt`,
      fontWeight: "bold",
      color: primaryColor,
      textTransform: "uppercase",
      borderBottom: `1px solid ${primaryColor}`,
      paddingBottom: "4px",
      marginBottom: "12px",
      marginTop: `${layout.sectionSpacing}px`,
      letterSpacing: "0.5px",
    };

    /**
     * Render contact information
     */
    const renderContactInfo = () => {
      const contactItems = [];

      if (resume.personalInfo?.email) {
        contactItems.push(resume.personalInfo.email);
      }
      if (resume.personalInfo?.phone) {
        contactItems.push(
          templateHelpers.phone.format(resume.personalInfo.phone)
        );
      }
      if (resume.personalInfo?.location) {
        contactItems.push(resume.personalInfo.location);
      }
      if (resume.personalInfo?.linkedin) {
        contactItems.push(
          templateHelpers.url.formatForDisplay(resume.personalInfo.linkedin)
        );
      }
      if (resume.personalInfo?.github) {
        contactItems.push(
          templateHelpers.url.formatForDisplay(resume.personalInfo.github)
        );
      }
      if (resume.personalInfo?.portfolio) {
        contactItems.push(
          templateHelpers.url.formatForDisplay(resume.personalInfo.portfolio)
        );
      }

      return contactItems.map((item, index) => <span key={index}>{item}</span>);
    };

    /**
     * Render summary section
     */
    const renderSummary = (content: { summary: string }) => {
      if (!content.summary) return null;

      return (
        <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: `${layout.fontSize.body}pt`,
              lineHeight: layout.lineHeight,
            }}
          >
            {content.summary}
          </p>
        </div>
      );
    };

    /**
     * Render experience section
     */
    const renderExperience = (content: { experiences: WorkExperience[] }) => {
      if (!content.experiences || content.experiences.length === 0) return null;

      return (
        <div>
          {content.experiences.map((exp, index) => (
            <div
              key={exp.id || index}
              style={{
                marginBottom:
                  index < content.experiences.length - 1 ? "16px" : "0",
                pageBreakInside: "avoid",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "4px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: `${layout.fontSize.body + 1}pt`,
                      fontWeight: "bold",
                      color: primaryColor,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {exp.jobTitle || "Job Title"}
                  </h3>
                  <p
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      fontStyle: "italic",
                      color: secondaryColor,
                      margin: "2px 0",
                    }}
                  >
                    {exp.company || "Company Name"}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: secondaryColor,
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}
                >
                  {templateHelpers.date.formatDateRange(
                    exp.startDate || "",
                    exp.endDate || "",
                    exp.current
                  )}
                </span>
              </div>
              {exp.description && (
                <p
                  style={{
                    margin: "4px 0",
                    textAlign: "justify",
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {exp.description}
                </p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul
                  style={{
                    margin: "4px 0 0 20px",
                    padding: 0,
                    listStyleType: "disc",
                  }}
                >
                  {exp.achievements.map((achievement, achIndex) => (
                    <li
                      key={achIndex}
                      style={{
                        marginBottom: "2px",
                        fontSize: `${layout.fontSize.body}pt`,
                      }}
                    >
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    };

    /**
     * Render education section
     */
    const renderEducation = (content: { education: Education[] }) => {
      if (!content.education || content.education.length === 0) return null;

      return (
        <div>
          {content.education.map((edu, index) => (
            <div
              key={edu.id || index}
              style={{
                marginBottom:
                  index < content.education.length - 1 ? "12px" : "0",
                pageBreakInside: "avoid",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: `${layout.fontSize.body + 1}pt`,
                      fontWeight: "bold",
                      color: primaryColor,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {edu.degree || "Degree"}
                  </h3>
                  <p
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      color: secondaryColor,
                      margin: "2px 0",
                    }}
                  >
                    {edu.institution || "Institution"}
                    {edu.location && ` • ${edu.location}`}
                  </p>
                  {edu.gpa && (
                    <p
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: secondaryColor,
                        margin: "2px 0",
                      }}
                    >
                      GPA: {edu.gpa}
                    </p>
                  )}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <p
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: secondaryColor,
                        margin: "2px 0",
                      }}
                    >
                      <strong>Relevant Coursework:</strong>{" "}
                      {edu.coursework.join(", ")}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: secondaryColor,
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}
                >
                  {templateHelpers.date.formatDateRange(
                    edu.startDate || "",
                    edu.endDate || ""
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    };

    /**
     * Render skills section
     */
    const renderSkills = (content: { skills: Skill[] }) => {
      if (!content.skills || content.skills.length === 0) return null;

      // Group skills by category
      const skillsByCategory = content.skills.reduce((acc, skill) => {
        const category = skill.category || "other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      }, {} as Record<string, string[]>);

      return (
        <div>
          {Object.entries(skillsByCategory).map(
            ([category, skillNames], index) => (
              <div
                key={category}
                style={{
                  marginBottom:
                    index < Object.keys(skillsByCategory).length - 1
                      ? "8px"
                      : "0",
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    color: primaryColor,
                    textTransform: "capitalize",
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {category.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {skillNames.join(", ")}
                </span>
              </div>
            )
          )}
        </div>
      );
    };

    /**
     * Render certifications section
     */
    const renderCertifications = (content: {
      certifications: Certification[];
    }) => {
      if (!content.certifications || content.certifications.length === 0)
        return null;

      return (
        <div>
          {content.certifications.map((cert, index) => (
            <div
              key={cert.id || index}
              style={{
                marginBottom:
                  index < content.certifications.length - 1 ? "12px" : "0",
                pageBreakInside: "avoid",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: `${layout.fontSize.body + 1}pt`,
                      fontWeight: "bold",
                      color: primaryColor,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {cert.name || "Certification Name"}
                  </h3>
                  <p
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      color: secondaryColor,
                      margin: "2px 0",
                    }}
                  >
                    {cert.issuer || "Issuing Organization"}
                  </p>
                  {cert.credentialId && (
                    <p
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: secondaryColor,
                        margin: "2px 0",
                      }}
                    >
                      Credential ID: {cert.credentialId}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right", marginLeft: "12px" }}>
                  <span
                    style={{
                      fontSize: `${layout.fontSize.body - 1}pt`,
                      color: secondaryColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {templateHelpers.date.formatDate(cert.issueDate || "")}
                  </span>
                  {cert.expiryDate && (
                    <div
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: secondaryColor,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Expires:{" "}
                      {templateHelpers.date.formatDate(cert.expiryDate)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    /**
     * Render projects section
     */
    const renderProjects = (content: { projects: Project[] }) => {
      if (!content.projects || content.projects.length === 0) return null;

      return (
        <div>
          {content.projects.map((project, index) => (
            <div
              key={project.id || index}
              style={{
                marginBottom:
                  index < content.projects.length - 1 ? "16px" : "0",
                pageBreakInside: "avoid",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "4px",
                }}
              >
                <h3
                  style={{
                    fontSize: `${layout.fontSize.body + 1}pt`,
                    fontWeight: "bold",
                    color: primaryColor,
                    margin: 0,
                    lineHeight: 1.2,
                    flex: 1,
                  }}
                >
                  {project.name || "Project Name"}
                </h3>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: secondaryColor,
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}
                >
                  {templateHelpers.date.formatDateRange(
                    project.startDate || "",
                    project.endDate || "",
                    project.current
                  )}
                </span>
              </div>
              {project.techStack && project.techStack.length > 0 && (
                <p
                  style={{
                    fontSize: `${layout.fontSize.body}pt`,
                    fontStyle: "italic",
                    color: secondaryColor,
                    margin: "2px 0",
                  }}
                >
                  <strong>Technologies:</strong> {project.techStack.join(", ")}
                </p>
              )}
              {project.description && (
                <p
                  style={{
                    margin: "4px 0",
                    textAlign: "justify",
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    };

    /**
     * Render custom section
     */
    const renderCustom = (content: {
      custom: { title: string; content: string };
    }) => {
      if (!content.custom || !content.custom.content) return null;

      return (
        <div>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: `${layout.fontSize.body}pt`,
              lineHeight: layout.lineHeight,
            }}
          >
            {content.custom.content}
          </p>
        </div>
      );
    };

    /**
     * Render section content based on type
     */
    const renderSectionContent = (section: (typeof resume.sections)[0]) => {
      switch (section.type) {
        case "summary":
          return renderSummary(section.content as { summary: string });
        case "experience":
          return renderExperience(
            section.content as { experiences: WorkExperience[] }
          );
        case "education":
          return renderEducation(section.content as { education: Education[] });
        case "skills":
          return renderSkills(section.content as { skills: Skill[] });
        case "certifications":
          return renderCertifications(
            section.content as { certifications: Certification[] }
          );
        case "projects":
          return renderProjects(section.content as { projects: Project[] });
        case "custom":
          return renderCustom(
            section.content as { custom: { title: string; content: string } }
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={`classic-template resume-preview ${className}`}
        style={containerStyles}
      >
        {/* Header Section */}
        <header style={headerStyles}>
          <h1 style={nameStyles}>
            {resume.personalInfo?.fullName || "Your Name"}
          </h1>

          {resume.personalInfo?.title && (
            <p style={titleStyles}>{resume.personalInfo.title}</p>
          )}

          <div style={contactStyles}>{renderContactInfo()}</div>
        </header>

        {/* Resume Sections */}
        {enabledSections.map((section) => {
          const content = renderSectionContent(section);
          if (!content) return null;

          return (
            <section key={section.id} style={{ pageBreakInside: "avoid" }}>
              <h2 style={sectionHeaderStyles}>{section.title}</h2>
              {content}
            </section>
          );
        })}

        {/* Empty state */}
        {enabledSections.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: secondaryColor,
              fontStyle: "italic",
            }}
          >
            <p>
              No sections enabled. Enable sections from the sidebar to see your
              resume content.
            </p>
          </div>
        )}
      </div>
    );
  }
);

ClassicTemplateComponent.displayName = "ClassicTemplate";

// Memoize the template to prevent unnecessary re-renders
export const ClassicTemplate = memo(ClassicTemplateComponent);

export default ClassicTemplate;
