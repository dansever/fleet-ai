export interface BaseUomInfo {
  value: string;
  label: string;
}

export const BASE_UOM_OPTIONS = [
  { value: 'USG', label: 'USG' },
  { value: 'L', label: 'Liters' },
  { value: 'M3', label: 'm³' },
  { value: 'MT', label: 'Metric Tonnes' },
  { value: 'KG', label: 'Kilograms' },
  { value: 'IMP_GAL', label: 'Imperial Gallons' },
  { value: 'BBL', label: 'BBL (42 USG Barrel)' },
];
