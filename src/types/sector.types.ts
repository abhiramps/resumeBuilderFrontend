

export type Sector = 'it' | 'finance' | 'medical' | 'marketing' | 'sales' | 'legal' | 'general';

export interface SectorLabels {
    project: string; // e.g., "Projects", "Deal Sheet", "Campaigns"
    projectTags: string; // e.g., "Tech Stack", "Transaction Details", "Tools"
    skills: string; // e.g., "Technical Skills", "Core Competencies", "Key Skills"
    workExperience: string; // e.g., "Professional Experience", "Work History"
    jobTitle?: string; // e.g. "Role", "Position"
    company?: string; // e.g. "Firm", "Hospital", "Agency"
}

export interface SectorValidationRules {
    projectTags: {
        maxItems: number;
        maxLength: number;
    };
}

export interface SectorConfig {
    id: Sector;
    name: string;
    labels: SectorLabels;
    defaultSkills: {
        category: string;
        skills: string[];
    }[];
    validation: SectorValidationRules;
}
