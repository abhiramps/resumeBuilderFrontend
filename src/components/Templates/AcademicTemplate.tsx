import React, { forwardRef } from "react";
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
 * Academic Template Component
 *
 * Professional academic-style resume template inspired by LaTeX resume.cls
 * Features:
 * - Clean, traditional academic layout
 * - Centered header with name and contact info
 * - Section headers with underlines
 * - Table-based skills layout
 * - Optimized for single-page resumes
 * - Professional typography matching LaTeX output
 *
 * ATS Compliance: 100/100
 * Best For: Academic positions, research roles, FAANG applications
 */
export const AcademicTemplate = forwardRef<HTMLDivElement, TemplateBaseProps>(
    (props, ref) => {
        const { resume, layout, className = "", printMode = false } = props;
        const enabledSections = resume.sections
            .filter((section) => section.enabled)
            .sort((a, b) => a.order - b.order);

        // LaTeX-inspired colors
        const primaryColor = layout.colors?.primary || "#000000";
        const textColor = layout.colors?.text || "#000000";
        const linkColor = "#0000EE"; // Blue links like in LaTeX

        const containerStyles: React.CSSProperties = {
            fontFamily: layout.fontFamily || "Times New Roman, serif",
            fontSize: `${layout.fontSize.body}pt`,
            lineHeight: layout.lineHeight,
            color: textColor,
            backgroundColor: "white",
            width: printMode ? "100%" : "100%",
            maxWidth: printMode ? "none" : "8.5in",
            minHeight: printMode ? "auto" : "11in",
            padding: printMode
                ? 0
                : `${layout.pageMargins.top}in ${layout.pageMargins.right}in ${layout.pageMargins.bottom}in ${layout.pageMargins.left}in`,
            boxShadow: printMode ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        };

        const headerStyles: React.CSSProperties = {
            textAlign: "center",
            marginBottom: "12px",
        };

        const nameStyles: React.CSSProperties = {
            fontSize: `${layout.fontSize.name + 2}pt`,
            fontWeight: "bold",
            color: primaryColor,
            margin: "0 0 6px 0",
            lineHeight: 1.2,
            letterSpacing: "2px",
            textTransform: "uppercase",
        };

        const contactStyles: React.CSSProperties = {
            fontSize: `${layout.fontSize.body - 1}pt`,
            color: textColor,
            margin: "2px 0",
            lineHeight: 1.5,
        };

        const linkStyles: React.CSSProperties = {
            color: linkColor,
            textDecoration: "none",
        };

        const sectionHeaderStyles: React.CSSProperties = {
            fontSize: `${layout.fontSize.sectionHeader}pt`,
            fontWeight: "bold",
            color: primaryColor,
            textTransform: "uppercase",
            marginBottom: "6px",
            marginTop: `${layout.sectionSpacing - 2}px`,
            letterSpacing: "0.5px",
            borderBottom: `1px solid ${primaryColor}`,
            paddingBottom: "1px",
        };

        const renderContactInfo = () => {
            const line1Parts = [];
            const line2Parts = [];

            // First line: phone and location
            if (resume.personalInfo?.phone) {
                line1Parts.push(templateHelpers.phone.format(resume.personalInfo.phone));
            }
            if (resume.personalInfo?.location) {
                line1Parts.push(resume.personalInfo.location);
            }

            // Second line: email, linkedin, portfolio (as links)
            if (resume.personalInfo?.email) {
                line2Parts.push(
                    <a key="email" href={`mailto:${resume.personalInfo.email}`} style={linkStyles}>
                        {resume.personalInfo.email}
                    </a>
                );
            }
            if (resume.personalInfo?.linkedin) {
                line2Parts.push(
                    <a key="linkedin" href={resume.personalInfo.linkedin} style={linkStyles}>
                        {templateHelpers.url.formatForDisplay(resume.personalInfo.linkedin)}
                    </a>
                );
            }
            if (resume.personalInfo?.portfolio) {
                line2Parts.push(
                    <a key="portfolio" href={resume.personalInfo.portfolio} style={linkStyles}>
                        {templateHelpers.url.formatForDisplay(resume.personalInfo.portfolio)}
                    </a>
                );
            }
            if (resume.personalInfo?.github) {
                line2Parts.push(
                    <a key="github" href={resume.personalInfo.github} style={linkStyles}>
                        {templateHelpers.url.formatForDisplay(resume.personalInfo.github)}
                    </a>
                );
            }

            return (
                <>
                    {line1Parts.length > 0 && (
                        <div style={contactStyles}>
                            {line1Parts.map((part, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && " ⋄ "}
                                    {part}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    {line2Parts.length > 0 && (
                        <div style={contactStyles}>
                            {line2Parts.map((part, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && " ⋄ "}
                                    {part}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </>
            );
        };

        const renderSummary = (content: { summary: string }) => {
            if (!content.summary) return null;

            return (
                <div
                    style={{
                        fontSize: `${layout.fontSize.body}pt`,
                        lineHeight: layout.lineHeight,
                        marginBottom: "4px",
                    }}
                >
                    {content.summary}
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
                                marginBottom: index < content.education.length - 1 ? "10px" : "0",
                                pageBreakInside: "avoid",
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
                                    <strong style={{ fontSize: `${layout.fontSize.body}pt`, fontWeight: "bold" }}>
                                        {edu.degree || "Degree"}
                                    </strong>
                                    <span style={{ fontSize: `${layout.fontSize.body}pt` }}>
                                        , {edu.institution || "Institution"}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontSize: `${layout.fontSize.body}pt`,
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
                                <div style={{ fontSize: `${layout.fontSize.body}pt`, marginTop: "2px" }}>
                                    Relevant Coursework: {edu.coursework.join(", ")}.
                                </div>
                            )}
                            {edu.gpa && (
                                <div style={{ fontSize: `${layout.fontSize.body}pt`, marginTop: "2px" }}>
                                    GPA: {edu.gpa}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        };

        const renderSkills = (content: { skills: Skill[] }) => {
            if (!content.skills || content.skills.length === 0) return null;

            const skillsByCategory = content.skills.reduce((acc, skill) => {
                const category = skill.category || "other";
                if (!acc[category]) acc[category] = [];
                acc[category].push(skill.name);
                return acc;
            }, {} as Record<string, string[]>);

            return (
                <div style={{ marginLeft: "0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", borderSpacing: 0 }}>
                        <tbody>
                            {Object.entries(skillsByCategory).map(([category, skillNames]) => (
                                <tr key={category}>
                                    <td
                                        style={{
                                            fontSize: `${layout.fontSize.body}pt`,
                                            fontWeight: "bold",
                                            paddingRight: "48px",
                                            verticalAlign: "top",
                                            paddingBottom: "2px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {category.replace(/([A-Z])/g, " $1").trim()}
                                    </td>
                                    <td
                                        style={{
                                            fontSize: `${layout.fontSize.body}pt`,
                                            paddingBottom: "2px",
                                        }}
                                    >
                                        {skillNames.join(", ")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                                marginBottom: index < content.experiences.length - 1 ? "12px" : "0",
                                pageBreakInside: "avoid",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "baseline",
                                    marginBottom: "1px",
                                }}
                            >
                                <div>
                                    <strong style={{ fontSize: `${layout.fontSize.body}pt`, fontWeight: "bold" }}>
                                        {exp.jobTitle || "Job Title"}
                                    </strong>
                                </div>
                                <span
                                    style={{
                                        fontSize: `${layout.fontSize.body}pt`,
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
                            <div
                                style={{
                                    fontSize: `${layout.fontSize.body}pt`,
                                    fontStyle: "italic",
                                    marginBottom: "3px",
                                }}
                            >
                                {exp.company || "Company Name"}
                                {exp.location && (
                                    <span style={{ marginLeft: "0", fontStyle: "italic" }}>
                                        {" "}<em>{exp.location}</em>
                                    </span>
                                )}
                            </div>
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
                                                marginBottom: "2px",
                                                fontSize: `${layout.fontSize.body}pt`,
                                                lineHeight: layout.lineHeight,
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

        const renderProjects = (content: { projects: Project[] }) => {
            if (!content.projects || content.projects.length === 0) return null;

            return (
                <div>
                    <ul
                        style={{
                            margin: "0 0 0 18px",
                            padding: 0,
                            listStyleType: "disc",
                        }}
                    >
                        {content.projects.map((project, index) => (
                            <li
                                key={project.id || index}
                                style={{
                                    marginBottom: index < content.projects.length - 1 ? "6px" : "0",
                                    pageBreakInside: "avoid",
                                    fontSize: `${layout.fontSize.body}pt`,
                                    lineHeight: layout.lineHeight,
                                }}
                            >
                                <strong style={{ fontWeight: "bold" }}>
                                    {project.name || "Project Name"}.
                                </strong>{" "}
                                {project.description && <span>{project.description}</span>}
                                {project.url && (
                                    <span>
                                        {" "}(
                                        <a href={project.url} style={linkStyles}>
                                            Try it here
                                        </a>
                                        )
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        };

        const renderCertifications = (content: { certifications: Certification[] }) => {
            if (!content.certifications || content.certifications.length === 0) return null;

            return (
                <div>
                    {content.certifications.map((cert, index) => (
                        <div
                            key={cert.id || index}
                            style={{
                                marginBottom: index < content.certifications.length - 1 ? "8px" : "0",
                                pageBreakInside: "avoid",
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
                                    <strong style={{ fontSize: `${layout.fontSize.body}pt`, fontWeight: "bold" }}>
                                        {cert.name || "Certification Name"}
                                    </strong>
                                    <span style={{ fontSize: `${layout.fontSize.body}pt` }}>
                                        , {cert.issuer || "Issuing Organization"}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontSize: `${layout.fontSize.body}pt`,
                                        whiteSpace: "nowrap",
                                        marginLeft: "12px",
                                    }}
                                >
                                    {templateHelpers.date.formatDate(cert.issueDate || "")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        };

        const renderCustom = (content: { custom: { title: string; content: string } }) => {
            if (!content.custom || !content.custom.content) return null;

            // Split content by lines and render as bullet points
            const lines = content.custom.content.split("\n").filter(line => line.trim());

            return (
                <div>
                    <ul
                        style={{
                            margin: "0 0 0 18px",
                            padding: 0,
                            listStyleType: "disc",
                        }}
                    >
                        {lines.map((line, index) => (
                            <li
                                key={index}
                                style={{
                                    marginBottom: "4px",
                                    fontSize: `${layout.fontSize.body}pt`,
                                    lineHeight: layout.lineHeight,
                                }}
                            >
                                {line.trim()}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        };

        const renderSectionContent = (section: (typeof resume.sections)[0]) => {
            switch (section.type) {
                case "summary":
                    return renderSummary(section.content as { summary: string });
                case "experience":
                    return renderExperience(section.content as { experiences: WorkExperience[] });
                case "education":
                    return renderEducation(section.content as { education: Education[] });
                case "skills":
                    return renderSkills(section.content as { skills: Skill[] });
                case "certifications":
                    return renderCertifications(section.content as { certifications: Certification[] });
                case "projects":
                    return renderProjects(section.content as { projects: Project[] });
                case "custom":
                    return renderCustom(section.content as { custom: { title: string; content: string } });
                default:
                    return null;
            }
        };

        return (
            <div
                ref={ref}
                className={`academic-template resume-preview ${className}`}
                style={containerStyles}
            >
                <header style={headerStyles}>
                    <h1 style={nameStyles}>
                        {resume.personalInfo?.fullName || "FIRSTNAME LASTNAME"}
                    </h1>
                    {renderContactInfo()}
                </header>

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

                {enabledSections.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "#666666",
                        }}
                    >
                        <p>
                            No sections enabled. Enable sections from the sidebar to see your resume content.
                        </p>
                    </div>
                )}
            </div>
        );
    }
);

AcademicTemplate.displayName = "AcademicTemplate";

export default AcademicTemplate;
