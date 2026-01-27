import { SectorConfig } from '../../types/sector.types';

export const financeSectorConfig: SectorConfig = {
  id: 'finance',
  name: 'Banking & Finance',
  labels: {
    project: 'Deal Sheet / Transactions',
    projectTags: 'Transaction Details',
    skills: 'Core Competencies',
    workExperience: 'Professional Experience',
    jobTitle: 'Role / Position',
    company: 'Firm / Institution',
  },
  defaultSkills: [
    {
      category: 'Financial Modeling',
      skills: ['DCF Analysis', 'LBO Modeling', 'M&A Modeling', 'Comparable Company Analysis', 'Precedent Transactions'],
    },
    {
      category: 'Analysis & Research',
      skills: ['Due Diligence', 'Valuation', 'Financial Statement Analysis', 'Market Research', 'Forecasting'],
    },
    {
      category: 'Software & Tools',
      skills: ['Excel (Advanced)', 'PowerPoint', 'Bloomberg Terminal', 'Capital IQ', 'FactSet', 'Reuters Eikon'],
    },
    {
      category: 'Regulations',
      skills: ['GAAP', 'IFRS', 'SEC Filings', 'Sarbanes-Oxley (SOX)', 'Basel III'],
    },
    {
      category: 'Soft Skills',
      skills: ['Client Relationship Management', 'Negotiation', 'Presentation Skills', 'Strategic Planning'],
    },
  ],
  validation: {
    projectTags: {
      maxItems: 8,
      maxLength: 50, // Longer length to accommodate transaction sizes/types
    },
  },
};
