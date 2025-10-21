export type PresetTripKey =
  | 'Roos <-> Wash'
  | 'Roos <-> Kerp'
  | 'Wash <-> Roos'
  | 'Wash <-> Kerp'
  | 'Kerp <-> Roos'
  | 'Kerp <-> Wash';

type TripMileage = {
  oneWay: number;
  round: number;
};

export const PRESET_TRIPS: Record<PresetTripKey, TripMileage> = {
  'Roos <-> Wash': { oneWay: 2.2, round: 4.4 },
  'Roos <-> Kerp': { oneWay: 0.3, round: 0.6 },
  'Wash <-> Roos': { oneWay: 2.2, round: 4.4 },
  'Wash <-> Kerp': { oneWay: 2.0, round: 4.0 },
  'Kerp <-> Roos': { oneWay: 0.3, round: 0.6 },
  'Kerp <-> Wash': { oneWay: 2.0, round: 4.0 }
};
