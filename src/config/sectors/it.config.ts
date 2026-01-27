import { SectorConfig } from '../../types/sector.types';

export const itSectorConfig: SectorConfig = {
  id: 'it',
  name: 'Software Engineering',
  labels: {
    project: 'Projects',
    projectTags: 'Tech Stack',
    skills: 'Technical Skills',
    workExperience: 'Work Experience',
  },
  defaultSkills: [
    {
      category: 'Languages',
      skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
    },
    {
      category: 'Frameworks',
      skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'Express.js', 'Node.js', 'Spring Boot'],
    },
    {
      category: 'Databases',
      skills: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'DynamoDB'],
    },
    {
      category: 'Tools',
      skills: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 15,
      maxLength: 30,
    },
  },
};
