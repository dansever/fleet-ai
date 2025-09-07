export interface BaseUomInfo {
  value: string;
  label: string;
}

export const BASE_UOM_OPTIONS = [
  { value: 'USG', label: 'USG' },
  { value: 'L', label: 'L' },
  { value: 'M3', label: 'm³' },
  { value: 'MT', label: 'MT' },
  { value: 'KG', label: 'KG' },
  { value: 'IMP_GAL', label: 'Imp. Gal' },
  { value: 'BBL', label: 'BBL (42 USG Barrel)' },
];
