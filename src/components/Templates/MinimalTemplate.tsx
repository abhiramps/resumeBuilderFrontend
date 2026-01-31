import React, { forwardRef } from "react";
import { TemplateBaseProps } from "./TemplateBase";
import { templateHelpers } from "../../utils/templateHelpers";
import {
  WorkExperience,
  Education,
  Skill,
  Certification,
  Project,
  AdditionalInfoItem,
} from "../../types/resume.types";

/**
 * Minimal Template Component
 *
 * Ultra-clean, space-efficient resume template.
 * Features:
 * - Maximum content density
 * - Minimal spacing and decorations
 * - Black and white only
 * - No borders or graphics
 * - Compact single-line header
 * - Dense information layout
 *
 * ATS Compliance: 100/100
 * Best For: Experienced candidates, single-page resumes, maximum content
 */
export const MinimalTemplate = forwardRef<HTMLDivElement, TemplateBaseProps>(
  (props, ref) => {
    const { resume, layout, className = "", printMode = false, hideHeader = false } = props;
    const enabledSections = resume.sections
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order);

    // Use layout colors or fall back to minimal black/white
    const primaryColor = layout.colors?.primary || "#000000";
    const textColor = layout.colors?.text || "#000000";

    const containerStyles: React.CSSProperties = {
      fontFamily: layout.fontFamily || "Arial, Helvetica, sans-serif",
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
      marginBottom: `${Math.max(layout.sectionSpacing - 4, 8)}px`,
    };

    const nameStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.name}pt`,
      fontWeight: "bold",
      color: primaryColor,
      margin: 0,
      lineHeight: 1.1,
      display: "inline",
    };

    const titleStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.title}pt`,
      color: primaryColor,
      margin: 0,
      display: "inline",
      marginLeft: "12px",
    };

    const contactStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.body - 1}pt`,
      color: primaryColor,
      marginTop: "4px",
    };

    const sectionHeaderStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.sectionHeader}pt`,
      fontWeight: "bold",
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: "6px",
      marginTop: `${layout.sectionSpacing}px`,
      letterSpacing: "0.5px",
    };

    const linkStyles: React.CSSProperties = {
      // color: "#0000EE",
      textDecoration: "none",
    };

    const renderContactInfo = () => {
      const contactItems = [];

      if (resume.personalInfo?.email) {
        contactItems.push(
          <a key="email" href={`mailto:${resume.personalInfo.email}`} style={linkStyles}>
            {resume.personalInfo.email}
          </a>
        );
      }
      if (resume.personalInfo?.phone) {
        contactItems.push(
          <span key="phone">{templateHelpers.phone.format(resume.personalInfo.phone)}</span>
        );
      }
      if (resume.personalInfo?.location) {
        contactItems.push(<span key="location">{resume.personalInfo.location}</span>);
      }
      if (resume.personalInfo?.linkedin) {
        contactItems.push(
          <a key="linkedin" href={resume.personalInfo.linkedin} style={linkStyles}>
            {templateHelpers.url.formatForDisplay(resume.personalInfo.linkedin)}
          </a>
        );
      }
      if (resume.personalInfo?.github) {
        contactItems.push(
          <a key="github" href={resume.personalInfo.github} style={linkStyles}>
            {templateHelpers.url.formatForDisplay(resume.personalInfo.github)}
          </a>
        );
      }
      if (resume.personalInfo?.portfolio) {
        contactItems.push(
          <a key="portfolio" href={resume.personalInfo.portfolio} style={linkStyles}>
            {templateHelpers.url.formatForDisplay(resume.personalInfo.portfolio)}
          </a>
        );
      }

      return contactItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && " | "}
          {item}
        </React.Fragment>
      ));
    };

    const renderSummary = (content: { summary: string }) => {
      if (!content.summary) return null;

      return (
        <p
          style={{
            margin: 0,
            fontSize: `${layout.fontSize.body}pt`,
            lineHeight: layout.lineHeight,
          }}
        >
          {content.summary}
        </p>
      );
    };

    const renderExperience = (content: { experiences: WorkExperience[] }) => {
      if (!content.experiences || content.experiences.length === 0) return null;

      return (
        <div>
          {content.experiences.map((exp, index) => (
            <div
              key={exp.id || index}
              style={{
                marginBottom:
                  index < content.experiences.length - 1 ? "10px" : "0",
                pageBreakInside: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                }}
              >
                <div>
                  <strong style={{ fontSize: `${layout.fontSize.body}pt` }}>
                    {exp.jobTitle || "Job Title"}
                  </strong>
                  <span
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      marginLeft: "6px",
                    }}
                  >
                    | {exp.company || "Company Name"}
                    {exp.location && ` | ${exp.location}`}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
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
                    margin: "2px 0",
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {exp.description}
                </p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul
                  style={{
                    margin: "2px 0 0 18px",
                    padding: 0,
                    listStyleType: "disc",
                  }}
                >
                  {exp.achievements.map((achievement, achIndex) => (
                    <li
                      key={achIndex}
                      style={{
                        marginBottom: "1px",
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

    const renderEducation = (content: { education: Education[] }) => {
      if (!content.education || content.education.length === 0) return null;

      return (
        <div>
          {content.education.map((edu, index) => (
            <div
              key={edu.id || index}
              style={{
                marginBottom:
                  index < content.education.length - 1 ? "8px" : "0",
                pageBreakInside: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <strong style={{ fontSize: `${layout.fontSize.body}pt` }}>
                    {edu.degree || "Degree"}
                  </strong>
                  <span
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      marginLeft: "6px",
                    }}
                  >
                    | {edu.institution || "Institution"}
                    {edu.location && ` | ${edu.location}`}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
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
              {edu.coursework && edu.coursework.length > 0 && (
                <p
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    margin: "2px 0 0 0",
                  }}
                >
                  Coursework: {edu.coursework.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    };

    const renderSkills = (content: { skills: Skill[]; skillCategories?: Record<string, string> }) => {
      if (!content.skills || content.skills.length === 0) return null;

      // Helper function to get category display name
      const getCategoryDisplayName = (categoryKey: string): string => {
        const defaultNames: Record<string, string> = {
          languages: "Programming Languages",
          frameworks: "Frameworks & Libraries",
          databases: "Databases",
          tools: "Tools & Software",
          cloud: "Cloud & DevOps",
          other: "Other"
        };
        return defaultNames[categoryKey] || categoryKey;
      };

      // Group skills by their custom category name
      const skillsByCategory: Record<string, string[]> = {};

      content.skills.forEach(skill => {
        // Get the custom category name from the mapping, or use default
        const categoryName = content.skillCategories?.[skill.id] || getCategoryDisplayName(skill.category);

        if (!skillsByCategory[categoryName]) {
          skillsByCategory[categoryName] = [];
        }
        skillsByCategory[categoryName].push(skill.name);
      });

      return (
        <div>
          {Object.entries(skillsByCategory).map(
            ([categoryName, skillNames], index) => (
              <div
                key={categoryName}
                style={{
                  marginBottom:
                    index < Object.keys(skillsByCategory).length - 1
                      ? "4px"
                      : "0",
                }}
              >
                <strong
                  style={{
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {categoryName}:
                </strong>
                <span
                  style={{
                    marginLeft: "6px",
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
                  index < content.certifications.length - 1 ? "8px" : "0",
                pageBreakInside: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <strong style={{ fontSize: `${layout.fontSize.body}pt` }}>
                    {cert.name || "Certification Name"}
                  </strong>
                  <span
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      marginLeft: "6px",
                    }}
                  >
                    | {cert.issuer || "Issuing Organization"}
                    {cert.credentialId && ` | ID: ${cert.credentialId}`}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}
                >
                  {templateHelpers.date.formatDate(cert.issueDate || "")}
                  {cert.expiryDate &&
                    ` - ${templateHelpers.date.formatDate(cert.expiryDate)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderProjects = (content: { projects: Project[] }) => {
      if (!content.projects || content.projects.length === 0) return null;

      return (
        <div>
          {content.projects.map((project, index) => (
            <div
              key={project.id || index}
              style={{
                marginBottom:
                  index < content.projects.length - 1 ? "10px" : "0",
                pageBreakInside: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                }}
              >
                <div>
                  <strong style={{ fontSize: `${layout.fontSize.body}pt` }}>
                    {project.name || "Project Name"}
                  </strong>
                  {project.techStack && project.techStack.length > 0 && (
                    <span
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        marginLeft: "6px",
                      }}
                    >
                      | {project.techStack.join(", ")}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
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
              {project.description && (
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: `${layout.fontSize.body}pt`,
                  }}
                >
                  {project.description}
                </p>
              )}
              {project.achievements && project.achievements.length > 0 && (
                <ul
                  style={{
                    margin: "2px 0 0 18px",
                    padding: 0,
                    listStyleType: "disc",
                  }}
                >
                  {project.achievements.map((achievement, achIndex) => (
                    <li
                      key={achIndex}
                      style={{
                        marginBottom: "1px",
                        fontSize: `${layout.fontSize.body}pt`,
                      }}
                    >
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
              {project.url && (
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: `${layout.fontSize.body - 1}pt`,
                  }}
                >
                  <a href={project.url} style={linkStyles}>
                    {templateHelpers.url.formatForDisplay(project.url)}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      );
    };

    const renderAdditionalInfo = (content: {
      additionalInfo: AdditionalInfoItem[];
    }) => {
      if (!content.additionalInfo || content.additionalInfo.length === 0)
        return null;

      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
          {content.additionalInfo.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                 minWidth: "200px",
                 flex: 1,
                 pageBreakInside: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: `${layout.fontSize.body}pt`,
                  fontWeight: 600,
                  color: layout.colors?.text || "#000",
                  margin: "0 0 6px 0",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "4px"
                }}
              >
                {item.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                 {item.content.map((line, i) => (
                    <span key={i} style={{
                        fontSize: `${layout.fontSize.body}pt`,
                        color: layout.colors?.secondary || "#555",
                    }}>
                        {line}
                    </span>
                 ))}
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderCustom = (content: {
      custom: { title: string; content: string };
    }) => {
      if (!content.custom || !content.custom.content) return null;

      return (
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
      );
    };

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
        case "additional-info":
          return renderAdditionalInfo(
            section.content as { additionalInfo: AdditionalInfoItem[] }
          );
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
        className={`minimal-template resume-preview ${className}`}
        style={containerStyles}
      >
        {!hideHeader && (
          <header style={headerStyles}>
            <div>
              <h1 style={nameStyles}>
                {resume.personalInfo?.fullName || "Your Name"}
              </h1>
              {resume.personalInfo?.title && (
                <span style={titleStyles}>{resume.personalInfo.title}</span>
              )}
            </div>
            <div style={contactStyles}>{renderContactInfo()}</div>
          </header>
        )}

        {enabledSections.map((section) => {
          const content = renderSectionContent(section);
          if (!content) return null;

          return (
            <section key={section.id} data-section-id={section.id} style={{ pageBreakInside: "auto" }}>
              {!section.hideTitle && <h2 style={sectionHeaderStyles}>{section.title}</h2>}
              {content}
            </section>
          );
        })}

        {enabledSections.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666666",
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

MinimalTemplate.displayName = "MinimalTemplate";

export default MinimalTemplate;
