import { SectorConfig } from '../../types/sector.types';

export const medicalSectorConfig: SectorConfig = {
  id: 'medical',
  name: 'Medical & Healthcare',
  labels: {
    project: 'Clinical Rotations / Research',
    projectTags: 'Specialties / Techniques',
    skills: 'Clinical Skills',
    workExperience: 'Clinical Experience',
    jobTitle: 'Role / Specialty',
    company: 'Hospital / Clinic / Institution',
  },
  defaultSkills: [
    {
      category: 'Clinical Skills',
      skills: ['Patient Care', 'Vital Signs Monitoring', 'Phlebotomy', 'CPR/BLS Certified', 'EMR/EHR Systems'],
    },
    {
      category: 'Specialties',
      skills: ['Pediatrics', 'Geriatrics', 'Emergency Medicine', 'Surgery', 'Internal Medicine'],
    },
    {
      category: 'Certifications',
      skills: ['RN', 'CNA', 'EMT', 'ACLS', 'PALS'],
    },
    {
      category: 'Soft Skills',
      skills: ['Compassion', 'Communication', 'Teamwork', 'Critical Thinking', 'Stress Management'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 10,
      maxLength: 40,
    },
  },
};
