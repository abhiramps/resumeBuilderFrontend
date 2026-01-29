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
 * Modern Template Component
 *
 * Clean, contemporary resume template with visual accents.
 * Features:
 * - Sans-serif font (Arial/Helvetica)
 * - Left-aligned header with accent bar
 * - Subtle use of accent colors
 * - Grid-based skills layout
 * - Contemporary bullet styles
 * - Good whitespace usage
 *
 * ATS Compliance: 92/100
 * Best For: Tech companies, startups, creative roles, modern industries
 */
export const ModernTemplate = forwardRef<HTMLDivElement, TemplateBaseProps>(
  (props, ref) => {
    const { resume, layout, className = "", printMode = false, style, hideHeader = false } = props;

    const enabledSections = resume.sections
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order);

    const accentColor = layout.colors?.primary || "#3b82f6";

    const containerStyles: React.CSSProperties = {
      fontFamily: layout.fontFamily || "Arial, Helvetica, sans-serif",
      fontSize: `${layout.fontSize.body}pt`,
      lineHeight: layout.lineHeight,
      color: layout.colors?.text || "#1f2937",
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
      ...style,
    };

    const headerStyles: React.CSSProperties = {
      borderLeft: `4px solid ${accentColor}`,
      paddingLeft: "16px",
      marginBottom: `${layout.sectionSpacing + 8}px`,
    };

    const nameStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.name}pt`,
      fontWeight: "bold",
      color: accentColor,
      marginBottom: "4px",
      lineHeight: 1.2,
    };

    const titleStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.title}pt`,
      color: layout.colors?.secondary || "#6b7280",
      marginBottom: "8px",
      fontWeight: 500,
    };

    const contactStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.body - 1}pt`,
      color: layout.colors?.secondary || "#6b7280",
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
    };

    const sectionHeaderStyles: React.CSSProperties = {
      fontSize: `${layout.fontSize.sectionHeader}pt`,
      fontWeight: "bold",
      color: accentColor,
      borderBottom: `2px solid ${accentColor}`,
      paddingBottom: "6px",
      marginBottom: "14px",
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
        <React.Fragment key={index}>{item}</React.Fragment>
      ));
    };

    const renderSummary = (content: { summary: string }) => {
      if (!content.summary) return null;

      return (
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "12px 16px",
            borderRadius: "4px",
            borderLeft: `3px solid ${accentColor}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: `${layout.fontSize.body}pt`,
              lineHeight: layout.lineHeight,
              color: layout.colors?.text || "#1f2937",
            }}
          >
            {content.summary}
          </p>
        </div>
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
                  index < content.experiences.length - 1 ? "18px" : "0",
                pageBreakInside: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "6px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: `${layout.fontSize.body + 1}pt`,
                      fontWeight: "bold",
                      color: layout.colors?.text || "#1f2937",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {exp.jobTitle || "Job Title"}
                  </h3>
                  <p
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      fontWeight: 600,
                      color: accentColor,
                      margin: "2px 0",
                    }}
                  >
                    {exp.company || "Company Name"}
                    {exp.location && (
                      <span
                        style={{
                          fontWeight: "normal",
                          color: layout.colors?.secondary || "#6b7280",
                          marginLeft: "8px",
                        }}
                      >
                        • {exp.location}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: layout.colors?.secondary || "#6b7280",
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                    fontWeight: 500,
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
                    margin: "6px 0",
                    fontSize: `${layout.fontSize.body}pt`,
                    color: layout.colors?.text || "#1f2937",
                  }}
                >
                  {exp.description}
                </p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul
                  style={{
                    margin: "6px 0 0 20px",
                    padding: 0,
                    listStyleType: "none",
                  }}
                >
                  {exp.achievements.map((achievement, achIndex) => (
                    <li
                      key={achIndex}
                      style={{
                        marginBottom: "4px",
                        fontSize: `${layout.fontSize.body}pt`,
                        paddingLeft: "12px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          color: accentColor,
                          fontWeight: "bold",
                        }}
                      >
                        ▸
                      </span>
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
                  index < content.education.length - 1 ? "14px" : "0",
                pageBreakInside: "auto",
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
                      color: layout.colors?.text || "#1f2937",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {edu.degree || "Degree"}
                  </h3>
                  <p
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      color: accentColor,
                      fontWeight: 600,
                      margin: "2px 0",
                    }}
                  >
                    {edu.institution || "Institution"}
                    {edu.location && (
                      <span
                        style={{
                          fontWeight: "normal",
                          color: layout.colors?.secondary || "#6b7280",
                          marginLeft: "8px",
                        }}
                      >
                        • {edu.location}
                      </span>
                    )}
                  </p>
                  {edu.gpa && (
                    <p
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: layout.colors?.secondary || "#6b7280",
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
                        color: layout.colors?.secondary || "#6b7280",
                        margin: "4px 0 0 0",
                      }}
                    >
                      <strong>Coursework:</strong> {edu.coursework.join(", ")}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: layout.colors?.secondary || "#6b7280",
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                    fontWeight: 500,
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {Object.entries(skillsByCategory).map(([categoryName, skillNames]) => (
            <div key={categoryName}>
              <h4
                style={{
                  fontSize: `${layout.fontSize.body}pt`,
                  fontWeight: "bold",
                  color: accentColor,
                  margin: "0 0 6px 0",
                }}
              >
                {categoryName}
              </h4>
              <div
                style={{
                  fontSize: `${layout.fontSize.body - 1}pt`,
                  color: layout.colors?.text || "#1f2937",
                  lineHeight: 1.6,
                }}
              >
                {skillNames.join(" • ")}
              </div>
            </div>
          ))}
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
                  index < content.certifications.length - 1 ? "14px" : "0",
                pageBreakInside: "auto",
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
                      color: layout.colors?.text || "#1f2937",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {cert.name || "Certification Name"}
                  </h3>
                  <p
                    style={{
                      fontSize: `${layout.fontSize.body}pt`,
                      color: accentColor,
                      fontWeight: 600,
                      margin: "2px 0",
                    }}
                  >
                    {cert.issuer || "Issuing Organization"}
                  </p>
                  {cert.credentialId && (
                    <p
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: layout.colors?.secondary || "#6b7280",
                        margin: "2px 0",
                      }}
                    >
                      ID: {cert.credentialId}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right", marginLeft: "12px" }}>
                  <span
                    style={{
                      fontSize: `${layout.fontSize.body - 1}pt`,
                      color: layout.colors?.secondary || "#6b7280",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                    }}
                  >
                    {templateHelpers.date.formatDate(cert.issueDate || "")}
                  </span>
                  {cert.expiryDate && (
                    <div
                      style={{
                        fontSize: `${layout.fontSize.body - 1}pt`,
                        color: layout.colors?.secondary || "#6b7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Exp: {templateHelpers.date.formatDate(cert.expiryDate)}
                    </div>
                  )}
                </div>
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
                  index < content.projects.length - 1 ? "18px" : "0",
                pageBreakInside: "auto",
                backgroundColor: "#f9fafb",
                padding: "12px",
                borderRadius: "4px",
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "6px",
                }}
              >
                <h3
                  style={{
                    fontSize: `${layout.fontSize.body + 1}pt`,
                    fontWeight: "bold",
                    color: layout.colors?.text || "#1f2937",
                    margin: 0,
                    lineHeight: 1.3,
                    flex: 1,
                  }}
                >
                  {project.name || "Project Name"}
                </h3>
                <span
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: layout.colors?.secondary || "#6b7280",
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                    fontWeight: 500,
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
                <div
                  style={{
                    fontSize: `${layout.fontSize.body - 1}pt`,
                    color: accentColor,
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {project.techStack.join(" • ")}
                </div>
              )}
              {project.description && (
                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: `${layout.fontSize.body}pt`,
                    color: layout.colors?.text || "#1f2937",
                    lineHeight: layout.lineHeight,
                  }}
                >
                  {project.description}
                </p>
              )}
              {project.achievements && project.achievements.length > 0 && (
                <ul
                  style={{
                    margin: "6px 0 0 20px",
                    padding: 0,
                    listStyleType: "none",
                  }}
                >
                  {project.achievements.map((achievement, achIndex) => (
                    <li
                      key={achIndex}
                      style={{
                        marginBottom: "4px",
                        fontSize: `${layout.fontSize.body}pt`,
                        paddingLeft: "12px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          color: accentColor,
                          fontWeight: "bold",
                        }}
                      >
                        ▸
                      </span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
              {project.url && (
                <p
                  style={{
                    margin: "6px 0 0 0",
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {content.additionalInfo.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                 marginBottom: "8px",
                 pageBreakInside: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: `${layout.fontSize.body}pt`,
                  fontWeight: "bold",
                  color: accentColor,
                  margin: "0 0 4px 0",
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                 {item.content.map((line, i) => (
                    <li key={i} style={{
                        fontSize: `${layout.fontSize.body}pt`,
                        color: layout.colors?.text || "#1f2937",
                        marginBottom: "2px",
                        whiteSpace: "pre-wrap"
                    }}>
                        {line}
                    </li>
                 ))}
              </ul>
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
        <div>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: `${layout.fontSize.body}pt`,
              lineHeight: layout.lineHeight,
              color: layout.colors?.text || "#1f2937",
            }}
          >
            {content.custom.content}
          </p>
        </div>
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
        className={`modern-template resume-preview ${className}`}
        style={containerStyles}
      >
        {!hideHeader && (
          <header style={headerStyles}>
            <h1 style={nameStyles}>
              {resume.personalInfo?.fullName || "Your Name"}
            </h1>

            {resume.personalInfo?.title && (
              <p style={titleStyles}>{resume.personalInfo.title}</p>
            )}

            <div style={contactStyles}>{renderContactInfo()}</div>
          </header>
        )}

        {enabledSections.map((section) => {
          const content = renderSectionContent(section);
          if (!content) return null;

          return (
            <section key={section.id} data-section-id={section.id} style={{ pageBreakInside: "auto" }}>
              <h2 style={sectionHeaderStyles}>{section.title}</h2>
              {content}
            </section>
          );
        })}

        {enabledSections.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: layout.colors?.secondary || "#6b7280",
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

ModernTemplate.displayName = "ModernTemplate";

export default ModernTemplate;
