import { Resume, ResumeSection } from "../types/resume.types";

// Generate unique ID helper
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Default personal information
const defaultPersonalInfo = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
};

// Default layout settings
const defaultLayout = {
  pageMargins: {
    top: 1.0,
    right: 1.0,
    bottom: 1.0,
    left: 1.0,
  },
  sectionSpacing: 16,
  lineHeight: 1.4,
  fontSize: {
    name: 22,
    title: 12,
    sectionHeader: 12,
    body: 10,
  },
  fontFamily: "Arial",
  colors: {
    primary: "#2c3e50",
    secondary: "#555555",
    text: "#333333",
  },
};

// Default sections
const defaultSections: ResumeSection[] = [
  {
    id: generateId(),
    type: "summary",
    title: "Professional Summary",
    enabled: true,
    order: 0,
    content: {
      summary:
        "Experienced software engineer with expertise in full-stack development, cloud technologies, and agile methodologies. Passionate about building scalable applications and leading technical teams.",
    },
  },
  {
    id: generateId(),
    type: "skills",
    title: "Technical Skills",
    enabled: true,
    order: 2,
    content: {
      skills: [
        // Languages
        {
          id: generateId(),
          name: "JavaScript",
          category: "languages",
          level: "expert",
        },
        {
          id: generateId(),
          name: "TypeScript",
          category: "languages",
          level: "advanced",
        },
        {
          id: generateId(),
          name: "Python",
          category: "languages",
          level: "advanced",
        },
        {
          id: generateId(),
          name: "Java",
          category: "languages",
          level: "intermediate",
        },

        // Frameworks
        {
          id: generateId(),
          name: "React",
          category: "frameworks",
          level: "expert",
        },
        {
          id: generateId(),
          name: "Node.js",
          category: "frameworks",
          level: "advanced",
        },
        {
          id: generateId(),
          name: "Express.js",
          category: "frameworks",
          level: "advanced",
        },
        {
          id: generateId(),
          name: "Next.js",
          category: "frameworks",
          level: "intermediate",
        },

        // Databases
        {
          id: generateId(),
          name: "PostgreSQL",
          category: "databases",
          level: "advanced",
        },
        {
          id: generateId(),
          name: "MongoDB",
          category: "databases",
          level: "intermediate",
        },
        {
          id: generateId(),
          name: "Redis",
          category: "databases",
          level: "intermediate",
        },

        // Tools
        { id: generateId(), name: "Git", category: "tools", level: "expert" },
        {
          id: generateId(),
          name: "Docker",
          category: "tools",
          level: "advanced",
        },
        {
          id: generateId(),
          name: "AWS",
          category: "cloud",
          level: "intermediate",
        },
        {
          id: generateId(),
          name: "Kubernetes",
          category: "cloud",
          level: "beginner",
        },
      ],
    },
  },
  {
    id: generateId(),
    type: "experience",
    title: "Work Experience",
    enabled: true,
    order: 3,
    content: {
      experiences: [
        {
          id: generateId(),
          jobTitle: "Senior Software Engineer",
          company: "Tech Company Inc.",
          location: "San Francisco, CA",
          startDate: "2022-01",
          endDate: "2024-12",
          current: true,
          description:
            "Led development of microservices architecture and implemented CI/CD pipelines.",
          achievements: [
            "Improved system performance by 40% through optimization",
            "Mentored 3 junior developers",
            "Implemented automated testing reducing bugs by 60%",
          ],
        },
        {
          id: generateId(),
          jobTitle: "Software Engineer",
          company: "StartupXYZ",
          location: "Austin, TX",
          startDate: "2020-06",
          endDate: "2021-12",
          current: false,
          description:
            "Developed full-stack web applications using React, Node.js, and PostgreSQL.",
          achievements: [
            "Built customer-facing dashboard serving 10K+ users",
            "Reduced page load time by 50%",
            "Collaborated with design team on UX improvements",
          ],
        },
      ],
    },
  },
  {
    id: generateId(),
    type: "projects",
    title: "Projects",
    enabled: true,
    order: 4,
    content: {
      projects: [
        {
          id: generateId(),
          name: "E-commerce Platform",
          description:
            "Full-stack e-commerce solution with payment integration and inventory management.",
          techStack: ["React", "Node.js", "PostgreSQL", "Stripe API"],
          startDate: "2023-03",
          endDate: "2023-08",
          current: false,
          url: "https://example-ecommerce.com",
          githubUrl: "https://github.com/username/ecommerce-platform",
        },
        {
          id: generateId(),
          name: "Task Management App",
          description:
            "Collaborative task management tool with real-time updates and team collaboration features.",
          techStack: ["Vue.js", "Express.js", "MongoDB", "Socket.io"],
          startDate: "2022-09",
          endDate: "2023-01",
          current: false,
          githubUrl: "https://github.com/username/task-manager",
        },
      ],
    },
  },
  {
    id: generateId(),
    type: "education",
    title: "Education",
    enabled: true,
    order: 5,
    content: {
      education: [
        {
          id: generateId(),
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          location: "Boston, MA",
          startDate: "2016-09",
          endDate: "2020-05",
          gpa: "3.8/4.0",
          coursework: [
            "Data Structures and Algorithms",
            "Software Engineering",
            "Database Systems",
            "Computer Networks",
          ],
        },
      ],
    },
  },
  {
    id: generateId(),
    type: "certifications",
    title: "Certifications",
    enabled: true,
    order: 6,
    content: {
      certifications: [
        {
          id: generateId(),
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          issueDate: "2023-06",
          expiryDate: "2026-06",
          credentialId: "AWS-SAA-123456",
          url: "https://aws.amazon.com/verification",
        },
        {
          id: generateId(),
          name: "Certified Kubernetes Administrator",
          issuer: "Cloud Native Computing Foundation",
          issueDate: "2023-03",
          expiryDate: "2026-03",
          credentialId: "CKA-789012",
        },
      ],
    },
  },
  {
    id: generateId(),
    type: "additional-info",
    title: "Additional Information",
    enabled: true,
    order: 7,
    content: {
      additionalInfo: [
        {
          id: generateId(),
          title: "Languages",
          content: ["English (Native)", "Spanish (Professional)"],
        },
        {
          id: generateId(),
          title: "Volunteering",
          content: ["Mentor at Codebar", "Local Food Bank Volunteer"],
        },
      ],
    },
  },
];

// Create default resume
export const createDefaultResume = (): Resume => {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    personalInfo: defaultPersonalInfo,
    sections: defaultSections,
    layout: defaultLayout,
    template: "professional",
    createdAt: now,
    updatedAt: now,
  };
};

// Helper function to create empty resume
export const createEmptyResume = (): Resume => {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    personalInfo: defaultPersonalInfo,
    sections: [],
    layout: defaultLayout,
    template: "professional",
    createdAt: now,
    updatedAt: now,
  };
};

// Helper function to create resume from template
export const createResumeFromTemplate = (templateId: string): Resume => {
  const resume = createDefaultResume();
  return {
    ...resume,
    template: templateId as any,
    updatedAt: new Date().toISOString(),
  };
};

// Export default resume object as required by Task 3
export const DEFAULT_RESUME = createDefaultResume();

// Export default values for individual use
export { defaultPersonalInfo, defaultLayout, defaultSections };
