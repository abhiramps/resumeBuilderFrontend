import { SectorConfig } from '../../types/sector.types';

export const legalSectorConfig: SectorConfig = {
  id: 'legal',
  name: 'Legal',
  labels: {
    project: 'Representative Matters / Cases',
    projectTags: 'Practice Areas',
    skills: 'Legal Skills',
    workExperience: 'Legal Experience',
    jobTitle: 'Role / Position',
    company: 'Law Firm / Organization',
  },
  defaultSkills: [
    {
      category: 'Legal Expertise',
      skills: ['Litigation', 'Contract Law', 'Corporate Law', 'Intellectual Property', 'Legal Research'],
    },
    {
      category: 'Documentation',
      skills: ['Drafting', 'Brief Writing', 'Legal Memoranda', 'Due Diligence', 'Case Management'],
    },
    {
      category: 'Tools',
      skills: ['Westlaw', 'LexisNexis', 'Clio', 'Microsoft Office', 'eDiscovery Software'],
    },
    {
      category: 'Soft Skills',
      skills: ['Negotiation', 'Oral Advocacy', 'Critical Thinking', 'Attention to Detail', 'Client Counseling'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 8,
      maxLength: 60,
    },
  },
};
