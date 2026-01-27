import { SectorConfig } from '../../types/sector.types';

export const marketingSectorConfig: SectorConfig = {
  id: 'marketing',
  name: 'Marketing & Advertising',
  labels: {
    project: 'Campaigns / Portfolio',
    projectTags: 'Channels / Tools',
    skills: 'Marketing Skills',
    workExperience: 'Professional Experience',
  },
  defaultSkills: [
    {
      category: 'Digital Marketing',
      skills: ['SEO/SEM', 'Social Media Marketing', 'Email Marketing', 'Content Strategy', 'Google Analytics'],
    },
    {
      category: 'Tools',
      skills: ['HubSpot', 'Salesforce', 'Canva', 'Adobe Creative Cloud', 'Mailchimp', 'Hootsuite'],
    },
    {
      category: 'Analysis',
      skills: ['Market Research', 'A/B Testing', 'Data Analysis', 'ROI Tracking', 'Consumer Behavior'],
    },
    {
      category: 'Soft Skills',
      skills: ['Creativity', 'Communication', 'Project Management', 'Adaptability', 'Collaboration'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 12,
      maxLength: 40,
    },
  },
};
