import { Project } from "../types/resume.types";

/**
 * Validation error interface for project entries
 */
export interface ProjectValidationErrors {
  name?: string;
  description?: string;
  techStack?: string;
  url?: string;
  githubUrl?: string;
  dateRange?: string;
  achievements?: string;
}

/**
 * Validation schema for project fields
 */
export const PROJECT_VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-.,()&/]+$/,
    errorMessage: "Project name must be 2-100 characters and contain only letters, numbers, and basic punctuation",
  },
  description: {
    required: false,
    maxLength: 300,
    pattern: /^[a-zA-Z0-9\s\-.,()&/%$#@!?:;'"]+$/,
    errorMessage: "Description must be under 300 characters and ATS-friendly",
  },
  techStack: {
    maxItems: 15,
    itemMaxLength: 30,
    pattern: /^[a-zA-Z0-9\s\-.,()&/+#]+$/,
    errorMessage: "Each technology must be under 30 characters and ATS-friendly",
  },
  url: {
    required: false,
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    errorMessage: "Please enter a valid URL starting with http:// or https://",
  },
  githubUrl: {
    required: false,
    pattern: /^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_\.]+\/?$/,
    errorMessage: "Please enter a valid GitHub repository URL (https://github.com/username/repository)",
  },
  achievements: {
    maxItems: 10,
    itemMaxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-.,()&/%$#@!?:;'"]+$/,
    errorMessage: "Each achievement must be under 200 characters and ATS-friendly",
  },
} as const;

/**
 * Tech stack suggestions categorized by type
 */
export const TECH_STACK_SUGGESTIONS = {
  languages: [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
    "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "HTML", "CSS"
  ],
  frameworks: [
    "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "Express.js",
    "Node.js", "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Rails",
    "FastAPI", "Gatsby", "Remix", "SvelteKit"
  ],
  databases: [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server",
    "Cassandra", "DynamoDB", "Firebase", "Supabase", "PlanetScale", "CockroachDB"
  ],
  tools: [
    "Git", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "GitLab CI",
    "Webpack", "Vite", "Babel", "ESLint", "Prettier", "Jest", "Cypress",
    "Terraform", "Ansible", "Nginx", "Apache"
  ],
  cloud: [
    "AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Heroku", "DigitalOcean",
    "Cloudflare", "Firebase", "Supabase", "Railway", "Render"
  ],
  mobile: [
    "React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic", "Cordova",
    "Expo", "NativeScript"
  ],
  testing: [
    "Jest", "Cypress", "Selenium", "Playwright", "Testing Library", "Mocha",
    "Chai", "Jasmine", "PHPUnit", "JUnit", "Vitest", "Storybook"
  ],
  other: [
    "GraphQL", "REST API", "WebSocket", "PWA", "Microservices", "Serverless",
    "Machine Learning", "AI", "Blockchain", "IoT", "WebRTC", "Socket.io"
  ]
};

/**
 * Get all tech stack suggestions as a flat array
 */
export const getAllTechStackSuggestions = (): string[] => {
  return Object.values(TECH_STACK_SUGGESTIONS).flat();
};

/**
 * Filter tech stack suggestions based on input
 */
export const filterTechStackSuggestions = (input: string, existingTags: string[] = []): string[] => {
  if (!input.trim()) return [];

  const allSuggestions = getAllTechStackSuggestions();
  const lowerInput = input.toLowerCase();

  return allSuggestions
    .filter(tech =>
      tech.toLowerCase().includes(lowerInput) &&
      !existingTags.some(existing => existing.toLowerCase() === tech.toLowerCase())
    )
    .slice(0, 10); // Limit to 10 suggestions
};

/**
 * Validate a single field value
 */
export const validateField = (
  field: keyof typeof PROJECT_VALIDATION_RULES,
  value: string
): string | undefined => {
  const rules = PROJECT_VALIDATION_RULES[field];

  if (!value.trim()) {
    if ('required' in rules && rules.required) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    return undefined;
  }

  if ('minLength' in rules && rules.minLength && value.length < rules.minLength) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
  }

  if ('maxLength' in rules && rules.maxLength && value.length > rules.maxLength) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be under ${rules.maxLength} characters`;
  }

  if ('pattern' in rules && rules.pattern && !rules.pattern.test(value)) {
    return rules.errorMessage;
  }

  return undefined;
};

/**
 * Validate tech stack array
 */
export const validateTechStack = (techStack: string[]): string | undefined => {
  const rules = PROJECT_VALIDATION_RULES.techStack;

  if (techStack.length > rules.maxItems) {
    return `Maximum ${rules.maxItems} technologies allowed`;
  }

  for (const tech of techStack) {
    if (tech.trim()) {
      if (tech.length > rules.itemMaxLength) {
        return `"${tech}" is too long (max ${rules.itemMaxLength} characters)`;
      }
      if (!rules.pattern.test(tech)) {
        return `"${tech}" contains invalid characters`;
      }
    }
  }

  return undefined;
};

/**
 * Validate achievements array
 */
export const validateAchievements = (achievements: string[]): string | undefined => {
  const rules = PROJECT_VALIDATION_RULES.achievements;

  if (achievements.length > rules.maxItems) {
    return `Maximum ${rules.maxItems} achievements allowed`;
  }

  for (const achievement of achievements) {
    if (achievement.trim()) {
      if (achievement.length > rules.itemMaxLength) {
        return `Achievement is too long (max ${rules.itemMaxLength} characters)`;
      }
      if (!rules.pattern.test(achievement)) {
        return `Achievement contains invalid characters`;
      }
    }
  }

  return undefined;
};

/**
 * Validate URL format
 */
export const validateURL = (url: string, type: 'project' | 'github'): string | undefined => {
  if (!url.trim()) return undefined; // Empty URLs are allowed for optional fields

  const rules = type === 'github' ? PROJECT_VALIDATION_RULES.githubUrl : PROJECT_VALIDATION_RULES.url;

  if (!rules.pattern.test(url)) {
    return rules.errorMessage;
  }

  return undefined;
};

/**
 * Validate date format (YYYY-MM)
 */
export const validateDateFormat = (date: string): boolean => {
  if (!date) return true; // Empty dates are allowed for optional fields
  const dateRegex = /^\d{4}-\d{2}$/;
  return dateRegex.test(date);
};

/**
 * Validate date range (start date should be before end date)
 */
export const validateDateRange = (startDate: string, endDate: string, current: boolean): string | undefined => {
  if (startDate && !validateDateFormat(startDate)) {
    return "Invalid start date format";
  }

  if (!current && endDate) {
    if (!validateDateFormat(endDate)) {
      return "Invalid end date format";
    }

    if (startDate) {
      const start = new Date(startDate + "-01");
      const end = new Date(endDate + "-01");

      if (start >= end) {
        return "End date must be after start date";
      }
    }
  }

  return undefined;
};

/**
 * Validate entire project entry
 */
export const validateProject = (project: Project): ProjectValidationErrors => {
  const errors: ProjectValidationErrors = {};

  // Validate basic fields
  const nameError = validateField("name", project.name);
  if (nameError) errors.name = nameError;

  const descriptionError = validateField("description", project.description);
  if (descriptionError) errors.description = descriptionError;

  // Validate tech stack
  const techStackError = validateTechStack(project.techStack || []);
  if (techStackError) errors.techStack = techStackError;

  // Validate achievements
  const achievementsError = validateAchievements(project.achievements || []);
  if (achievementsError) errors.achievements = achievementsError;

  // Validate URLs
  const urlError = validateURL(project.url || "", "project");
  if (urlError) errors.url = urlError;

  const githubUrlError = validateURL(project.githubUrl || "", "github");
  if (githubUrlError) errors.githubUrl = githubUrlError;

  // Validate date range
  const dateRangeError = validateDateRange(project.startDate || '', project.endDate || '', project.current);
  if (dateRangeError) errors.dateRange = dateRangeError;

  return errors;
};

/**
 * Check if project has any validation errors
 */
export const hasValidationErrors = (errors: ProjectValidationErrors): boolean => {
  return Object.values(errors).some(error => error !== undefined);
};

/**
 * Get validation error count
 */
export const getValidationErrorCount = (errors: ProjectValidationErrors): number => {
  return Object.values(errors).filter(error => error !== undefined).length;
};

/**
 * ATS compliance checker for project content
 */
export const checkATSCompliance = (project: Project): {
  isCompliant: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for problematic characters
  const problematicChars = /[^\w\s\-.,()&/%$#@!?:;'"]/g;

  if (problematicChars.test(project.name)) {
    issues.push("Project name contains characters that may not be ATS-friendly");
  }

  if (problematicChars.test(project.description)) {
    issues.push("Description contains characters that may not be ATS-friendly");
  }

  (project.techStack || []).forEach((tech) => {
    if (problematicChars.test(tech)) {
      issues.push(`Technology "${tech}" contains characters that may not be ATS-friendly`);
    }
  });

  (project.achievements || []).forEach((achievement) => {
    if (problematicChars.test(achievement)) {
      issues.push("Achievement contains characters that may not be ATS-friendly");
    }
  });

  // Check for missing key information
  if (!project.name.trim()) {
    issues.push("Missing project name");
  }

  if (!project.description.trim()) {
    suggestions.push("Consider adding a project description to provide context");
  }

  const techStack = project.techStack || [];

  if (techStack.length === 0) {
    suggestions.push("Consider adding technologies used in this project");
  }

  if (techStack.length < 3) {
    suggestions.push("Adding 3-5 key technologies is recommended for better visibility");
  }

  if (!project.url && !project.githubUrl) {
    suggestions.push("Consider adding a project URL or GitHub repository link");
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    suggestions,
  };
};

/**
 * Generate project summary for display
 */
export const generateProjectSummary = (project: Project): string => {
  const parts: string[] = [];

  if (project.name) parts.push(project.name);

  const techStack = project.techStack || [];
  if (techStack.length > 0) {
    const techDisplay = techStack.slice(0, 3).join(", ");
    const remaining = techStack.length - 3;
    parts.push(`(${techDisplay}${remaining > 0 ? ` +${remaining} more` : ""})`);
  }

  if (project.startDate) {
    const startDate = new Date(project.startDate + "-01");
    const startStr = startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    if (project.current) {
      parts.push(`• ${startStr} - Present`);
    } else if (project.endDate) {
      const endDate = new Date(project.endDate + "-01");
      const endStr = endDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      parts.push(`• ${startStr} - ${endStr}`);
    }
  }

  return parts.join(" ");
};

/**
 * Calculate project duration in months
 */
export const calculateProjectDuration = (project: Project): number => {
  if (!project.startDate) return 0;

  const start = new Date(project.startDate + "-01");
  const end = project.current || !project.endDate
    ? new Date()
    : new Date(project.endDate + "-01");

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month

  return diffMonths;
};

/**
 * Format project duration for display
 */
export const formatProjectDuration = (project: Project): string => {
  const months = calculateProjectDuration(project);

  if (months === 0) return "";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} month${months === 1 ? "" : "s"}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  } else {
    return `${years} year${years === 1 ? "" : "s"}, ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`;
  }
};