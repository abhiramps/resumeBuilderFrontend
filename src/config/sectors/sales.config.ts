import { SectorConfig } from '../../types/sector.types';

export const salesSectorConfig: SectorConfig = {
  id: 'sales',
  name: 'Sales & Business Development',
  labels: {
    project: 'Key Achievements / Deals',
    projectTags: 'Product Lines / Metrics',
    skills: 'Sales Skills',
    workExperience: 'Professional Experience',
  },
  defaultSkills: [
    {
      category: 'Sales Techniques',
      skills: ['Prospecting', 'Cold Calling', 'Lead Generation', 'Consultative Selling', 'Closing'],
    },
    {
      category: 'Account Management',
      skills: ['CRM Management', 'Relationship Building', 'Account Planning', 'Upselling', 'Contract Negotiation'],
    },
    {
      category: 'Tools',
      skills: ['Salesforce', 'HubSpot', 'LinkedIn Sales Navigator', 'ZoomInfo', 'Pipedrive'],
    },
    {
      category: 'Soft Skills',
      skills: ['Resilience', 'Communication', 'Active Listening', 'Persuasion', 'Time Management'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 10,
      maxLength: 40,
    },
  },
};
