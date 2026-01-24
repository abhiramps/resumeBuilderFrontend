import { Skill, SkillCategory } from "../types/resume.types";

/**
 * Validation error interface for skills
 */
export interface SkillsValidationErrors {
  [categoryId: string]: {
    categoryName?: string;
    skills?: { [skillId: string]: string };
    general?: string;
  };
}

/**
 * Validation schema for skills
 */
export const SKILLS_VALIDATION_RULES = {
  categoryName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-&/]+$/,
    errorMessage: "Category name must be 2-50 characters and contain only letters, numbers, and basic punctuation",
  },
  skillName: {
    required: true,
    minLength: 1,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9\s\-.,()&/+#]+$/,
    errorMessage: "Skill name must be under 30 characters and ATS-friendly",
  },
  maxSkillsPerCategory: 20,
  maxCategories: 10,
} as const;

/**
 * Comprehensive skill suggestions database
 */
export const SKILL_SUGGESTIONS = {
  languages: [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
    "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "SQL",
    "HTML", "CSS", "Sass", "Less", "Bash", "PowerShell", "Perl", "Lua"
  ],
  databases: [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server",
    "Cassandra", "DynamoDB", "Firebase Firestore", "Supabase", "PlanetScale",
    "CockroachDB", "Neo4j", "InfluxDB", "Elasticsearch", "MariaDB", "CouchDB"
  ],
  backend: [
    "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot",
    "ASP.NET Core", "Laravel", "Ruby on Rails", "Phoenix", "Gin", "Echo",
    "Fiber", "Actix", "Rocket", "Koa.js", "Hapi.js", "Nest.js", "Strapi"
  ],
  frontend: [
    "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Gatsby",
    "Remix", "SvelteKit", "Alpine.js", "Lit", "Stencil", "Ember.js",
    "Backbone.js", "jQuery", "Bootstrap", "Tailwind CSS", "Material-UI",
    "Ant Design", "Chakra UI", "Bulma", "Foundation"
  ],
  cloud: [
    "AWS", "Google Cloud Platform", "Microsoft Azure", "Vercel", "Netlify",
    "Heroku", "DigitalOcean", "Linode", "Vultr", "Cloudflare", "Railway",
    "Render", "Fly.io", "PlanetScale", "Supabase", "Firebase", "Amplify"
  ],
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "Docker", "Kubernetes", "Jenkins",
    "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "Webpack", "Vite",
    "Rollup", "Parcel", "Babel", "ESLint", "Prettier", "Jest", "Cypress",
    "Playwright", "Selenium", "Postman", "Insomnia", "Figma", "Adobe XD"
  ],
  mobile: [
    "React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic",
    "Cordova", "Expo", "NativeScript", "Unity", "Unreal Engine", "PhoneGap"
  ],
  testing: [
    "Jest", "Mocha", "Chai", "Jasmine", "Cypress", "Playwright", "Selenium",
    "Testing Library", "Enzyme", "Vitest", "Storybook", "Chromatic",
    "Percy", "Appium", "Detox", "WebdriverIO", "Puppeteer"
  ],
  design: [
    "Figma", "Adobe XD", "Sketch", "InVision", "Zeplin", "Adobe Photoshop",
    "Adobe Illustrator", "Canva", "Framer", "Principle", "Marvel", "Balsamiq"
  ],
  other: [
    "GraphQL", "REST API", "WebSocket", "gRPC", "Microservices", "Serverless",
    "Machine Learning", "Artificial Intelligence", "Blockchain", "Web3",
    "IoT", "AR/VR", "PWA", "WebAssembly", "Electron", "Tauri"
  ]
};

/**
 * Predefined skill categories
 */
export const DEFAULT_SKILL_CATEGORIES = [
  "Languages",
  "Frontend Frameworks",
  "Backend Technologies", 
  "Databases",
  "Cloud & DevOps",
  "Tools & Software",
  "Mobile Development",
  "Testing",
  "Design Tools",
  "Other"
];

/**
 * Category templates for different roles
 */
export const CATEGORY_TEMPLATES = {
  "frontend-developer": {
    name: "Frontend Developer",
    description: "Essential skills for frontend development",
    categories: [
      {
        categoryName: "Languages",
        skills: ["JavaScript", "TypeScript", "HTML", "CSS"]
      },
      {
        categoryName: "Frontend Frameworks",
        skills: ["React", "Vue.js", "Angular", "Svelte"]
      },
      {
        categoryName: "Styling & UI",
        skills: ["Tailwind CSS", "Sass", "Bootstrap", "Material-UI"]
      },
      {
        categoryName: "Build Tools",
        skills: ["Webpack", "Vite", "Rollup", "Parcel"]
      },
      {
        categoryName: "Tools",
        skills: ["Git", "npm", "Yarn", "ESLint", "Prettier"]
      }
    ]
  },
  "backend-developer": {
    name: "Backend Developer",
    description: "Core skills for backend development",
    categories: [
      {
        categoryName: "Languages",
        skills: ["Python", "JavaScript", "Java", "Go", "C#"]
      },
      {
        categoryName: "Backend Frameworks",
        skills: ["Django", "Express.js", "Spring Boot", "Gin", "ASP.NET"]
      },
      {
        categoryName: "Databases",
        skills: ["PostgreSQL", "MongoDB", "Redis", "MySQL"]
      },
      {
        categoryName: "Cloud & DevOps",
        skills: ["AWS", "Docker", "Kubernetes", "Jenkins"]
      },
      {
        categoryName: "APIs & Integration",
        skills: ["REST API", "GraphQL", "gRPC", "WebSocket"]
      }
    ]
  },
  "fullstack-developer": {
    name: "Full-Stack Developer",
    description: "Comprehensive skills for full-stack development",
    categories: [
      {
        categoryName: "Languages",
        skills: ["JavaScript", "TypeScript", "Python", "SQL"]
      },
      {
        categoryName: "Frontend",
        skills: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"]
      },
      {
        categoryName: "Backend",
        skills: ["Node.js", "Express.js", "Django", "FastAPI"]
      },
      {
        categoryName: "Databases",
        skills: ["PostgreSQL", "MongoDB", "Redis"]
      },
      {
        categoryName: "DevOps & Tools",
        skills: ["Git", "Docker", "AWS", "Vercel"]
      }
    ]
  },
  "devops-engineer": {
    name: "DevOps Engineer",
    description: "Infrastructure and deployment skills",
    categories: [
      {
        categoryName: "Cloud Platforms",
        skills: ["AWS", "Google Cloud", "Azure", "DigitalOcean"]
      },
      {
        categoryName: "Containerization",
        skills: ["Docker", "Kubernetes", "Podman", "containerd"]
      },
      {
        categoryName: "CI/CD",
        skills: ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI"]
      },
      {
        categoryName: "Infrastructure as Code",
        skills: ["Terraform", "Ansible", "CloudFormation", "Pulumi"]
      },
      {
        categoryName: "Monitoring & Logging",
        skills: ["Prometheus", "Grafana", "ELK Stack", "Datadog"]
      }
    ]
  }
};

/**
 * Get all skill suggestions as a flat array
 */
export const getAllSkillSuggestions = (): string[] => {
  return Object.values(SKILL_SUGGESTIONS).flat();
};

/**
 * Filter skill suggestions based on input and category
 */
export const filterSkillSuggestions = (
  input: string, 
  category?: string, 
  existingSkills: string[] = []
): string[] => {
  if (!input.trim()) return [];
  
  const lowerInput = input.toLowerCase();
  let suggestions: string[] = [];

  // Get category-specific suggestions if category is provided
  if (category) {
    const categoryKey = getCategoryKey(category);
    if (categoryKey && SKILL_SUGGESTIONS[categoryKey as keyof typeof SKILL_SUGGESTIONS]) {
      suggestions = SKILL_SUGGESTIONS[categoryKey as keyof typeof SKILL_SUGGESTIONS];
    }
  }

  // If no category-specific suggestions, use all suggestions
  if (suggestions.length === 0) {
    suggestions = getAllSkillSuggestions();
  }
  
  return suggestions
    .filter(skill => 
      skill.toLowerCase().includes(lowerInput) && 
      !existingSkills.some(existing => existing.toLowerCase() === skill.toLowerCase())
    )
    .slice(0, 10); // Limit to 10 suggestions
};

/**
 * Map category name to suggestion key
 * Used only for finding relevant suggestions, not for data validation
 */
const getCategoryKey = (categoryName: string): string | null => {
  const normalized = categoryName.toLowerCase().trim();
  
  // Direct match check
  if (SKILL_SUGGESTIONS[normalized as keyof typeof SKILL_SUGGESTIONS]) {
    return normalized;
  }

  // Common aliases mapping
  const mapping: { [key: string]: string } = {
    "programming languages": "languages",
    "frontend frameworks": "frontend",
    "backend technologies": "backend", 
    "cloud & devops": "cloud",
    "devops": "cloud",
    "tools & software": "tools",
    "mobile development": "mobile",
    "design tools": "design",
  };

  // Check aliases
  if (mapping[normalized]) {
    return mapping[normalized];
  }

  // Loose partial matching
  if (normalized.includes("language")) return "languages";
  if (normalized.includes("database")) return "databases";
  if (normalized.includes("cloud")) return "cloud";
  if (normalized.includes("tool")) return "tools";
  if (normalized.includes("test")) return "testing";
  if (normalized.includes("design")) return "design";

  return null;
};

/**
    "testing": "testing",
    "design tools": "design",
    "design": "design",
    "other": "other"
  };

  return mapping[categoryName.toLowerCase()] || null;
};

/**
 * Validate category name
 */
export const validateCategoryName = (name: string): string | undefined => {
  const rules = SKILLS_VALIDATION_RULES.categoryName;
  
  if (!name.trim()) {
    return "Category name is required";
  }

  if (name.length < rules.minLength) {
    return `Category name must be at least ${rules.minLength} characters`;
  }

  if (name.length > rules.maxLength) {
    return `Category name must be under ${rules.maxLength} characters`;
  }

  if (!rules.pattern.test(name)) {
    return rules.errorMessage;
  }

  return undefined;
};

/**
 * Validate skill name
 */
export const validateSkillName = (name: string): string | undefined => {
  const rules = SKILLS_VALIDATION_RULES.skillName;
  
  if (!name.trim()) {
    return "Skill name is required";
  }

  if (name.length > rules.maxLength) {
    return `Skill name must be under ${rules.maxLength} characters`;
  }

  if (!rules.pattern.test(name)) {
    return rules.errorMessage;
  }

  return undefined;
};

/**
 * Validate skill category
 */
export const validateSkillCategory = (category: SkillCategory): SkillsValidationErrors[string] => {
  const errors: SkillsValidationErrors[string] = {};

  // Validate category name
  const categoryNameError = validateCategoryName(category.categoryName);
  if (categoryNameError) {
    errors.categoryName = categoryNameError;
  }

  // Validate skills
  const skillErrors: { [skillId: string]: string } = {};
  category.skills.forEach((skill) => {
    const skillNameError = validateSkillName(skill.name);
    if (skillNameError) {
      skillErrors[skill.id] = skillNameError;
    }
  });

  if (Object.keys(skillErrors).length > 0) {
    errors.skills = skillErrors;
  }

  // Check skill count
  if (category.skills.length > SKILLS_VALIDATION_RULES.maxSkillsPerCategory) {
    errors.general = `Maximum ${SKILLS_VALIDATION_RULES.maxSkillsPerCategory} skills allowed per category`;
  }

  return errors;
};

/**
 * Check if category has validation errors
 */
export const hasValidationErrors = (errors: SkillsValidationErrors[string]): boolean => {
  return !!(errors.categoryName || errors.general || (errors.skills && Object.keys(errors.skills).length > 0));
};

/**
 * ATS compliance checker for skills
 */
export const checkSkillsATSCompliance = (categories: SkillCategory[]): {
  isCompliant: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for problematic characters
  const problematicChars = /[^\w\s\-.,()&/+#]/g;
  
  categories.forEach((category) => {
    if (problematicChars.test(category.categoryName)) {
      issues.push(`Category "${category.categoryName}" contains characters that may not be ATS-friendly`);
    }

    category.skills.forEach((skill) => {
      if (problematicChars.test(skill.name)) {
        issues.push(`Skill "${skill.name}" contains characters that may not be ATS-friendly`);
      }
    });
  });

  // Check for missing categories
  if (categories.length === 0) {
    issues.push("No skill categories defined");
  }

  // Check for empty categories
  const emptyCategories = categories.filter(cat => cat.skills.length === 0);
  if (emptyCategories.length > 0) {
    suggestions.push(`Consider adding skills to empty categories: ${emptyCategories.map(cat => cat.categoryName).join(", ")}`);
  }

  // Check for recommended categories
  const hasLanguages = categories.some(cat => cat.categoryName.toLowerCase().includes("language"));
  const hasFrameworks = categories.some(cat => 
    cat.categoryName.toLowerCase().includes("framework") || 
    cat.categoryName.toLowerCase().includes("frontend") ||
    cat.categoryName.toLowerCase().includes("backend")
  );

  if (!hasLanguages) {
    suggestions.push("Consider adding a programming languages category");
  }

  if (!hasFrameworks) {
    suggestions.push("Consider adding framework or technology categories");
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    suggestions,
  };
};

/**
 * Convert flat skills array to categorized structure
 */
export const convertSkillsToCategories = (skills: Skill[]): SkillCategory[] => {
  const categoryMap = new Map<string, Skill[]>();

  // Group skills by category
  skills.forEach(skill => {
    const categoryName = skill.category || "Other";
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    categoryMap.get(categoryName)!.push(skill);
  });

  // Convert to SkillCategory array
  return Array.from(categoryMap.entries()).map(([categoryName, categorySkills]) => ({
    categoryName,
    skills: categorySkills
  }));
};

/**
 * Convert category key to display name
 */
/**
 * Convert category key to display name
 * @deprecated Valid for dynamic categories where key === name
 */
export const getCategoryDisplayName = (category: string): string => {
  return category;
};

/**
 * Generate unique ID for skills and categories
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Parse comma-separated skills input
 */
export const parseSkillsInput = (input: string): string[] => {
  return input
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
    .filter((skill, index, array) => array.indexOf(skill) === index); // Remove duplicates
};

/**
 * Get popular skills for a category
 */
export const getPopularSkillsForCategory = (categoryName: string): string[] => {
  const categoryKey = getCategoryKey(categoryName);
  if (categoryKey && SKILL_SUGGESTIONS[categoryKey as keyof typeof SKILL_SUGGESTIONS]) {
    return SKILL_SUGGESTIONS[categoryKey as keyof typeof SKILL_SUGGESTIONS].slice(0, 8);
  }
  return [];
};