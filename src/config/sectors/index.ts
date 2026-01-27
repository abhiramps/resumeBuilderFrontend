import { Sector, SectorConfig } from '../../types/sector.types';
import { itSectorConfig } from './it.config';
import { financeSectorConfig } from './finance.config';
import { generalSectorConfig } from './general.config';
import { medicalSectorConfig } from './medical.config';
import { marketingSectorConfig } from './marketing.config';
import { salesSectorConfig } from './sales.config';
import { legalSectorConfig } from './legal.config';

export const SECTOR_CONFIGS: Record<Sector, SectorConfig> = {
  it: itSectorConfig,
  finance: financeSectorConfig,
  general: generalSectorConfig,
  medical: medicalSectorConfig,
  marketing: marketingSectorConfig,
  sales: salesSectorConfig,
  legal: legalSectorConfig,
};

export const getSectorConfig = (sector: Sector = 'it'): SectorConfig => {
  return SECTOR_CONFIGS[sector] || itSectorConfig; // Default to IT to maintain backward compatibility if something goes wrong
};

export const SUPPORTED_SECTORS: { id: Sector; name: string }[] = [
  { id: 'it', name: 'Software Engineering' },
  { id: 'finance', name: 'Banking & Finance' },
  { id: 'medical', name: 'Medical & Healthcare' },
  { id: 'marketing', name: 'Marketing & Advertising' },
  { id: 'sales', name: 'Sales & Business Dev' },
  { id: 'legal', name: 'Legal' },
  { id: 'general', name: 'General / Other' },
];
