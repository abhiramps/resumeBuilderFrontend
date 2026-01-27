import { SectorConfig } from '../../types/sector.types';

export const generalSectorConfig: SectorConfig = {
  id: 'general',
  name: 'General / Other',
  labels: {
    project: 'Key Projects',
    projectTags: 'Key Attributes',
    skills: 'Skills',
    workExperience: 'Experience',
  },
  defaultSkills: [
    {
      category: 'Professional Skills',
      skills: ['Project Management', 'Team Leadership', 'Strategic Planning', 'Problem Solving', 'Communication'],
    },
    {
      category: 'Software',
      skills: ['Microsoft Office Suite', 'Google Workspace', 'Zoom', 'Slack', 'Asana', 'Salesforce'],
    },
    {
      category: 'Languages',
      skills: ['English', 'Spanish', 'French', 'Mandarin', 'German'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 10,
      maxLength: 40,
    },
  },
};
