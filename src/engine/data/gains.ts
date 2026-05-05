// Profils d'apports internes
// Sources : RE2020 / STD TH-BCE, EN ISO 13790

import type { InternalGainsProfile } from '../types';

// Profil horaire logement : éclairage + équipements + occupants (W/m²)
const LOGEMENT_WEEKDAY = [
  0.5, 0.4, 0.4, 0.4, 0.5, 1.2,  // 0-5h
  2.0, 3.5, 2.5, 1.0, 1.0, 1.2,  // 6-11h
  1.5, 1.0, 1.0, 1.0, 1.2, 2.5,  // 12-17h
  4.0, 5.0, 4.5, 3.5, 2.0, 1.0,  // 18-23h
];
const LOGEMENT_WEEKEND = [
  0.8, 0.6, 0.6, 0.6, 0.7, 0.8,  // 0-5h
  1.5, 2.5, 3.5, 3.5, 3.0, 3.0,  // 6-11h
  3.5, 3.0, 2.5, 2.5, 3.0, 4.0,  // 12-17h
  5.0, 5.5, 5.0, 4.0, 2.5, 1.5,  // 18-23h
];
const LOGEMENT_OCC = [
  0.9, 0.9, 0.9, 0.9, 0.9, 0.7,
  0.5, 0.2, 0.1, 0.1, 0.1, 0.2,
  0.3, 0.1, 0.1, 0.1, 0.2, 0.4,
  0.7, 0.9, 0.9, 0.9, 0.9, 0.9,
];

// Profil horaire bureau (W/m²)
const BUREAU_WEEKDAY = [
  0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
  0.5, 2.0, 8.0, 8.0, 8.0, 7.0,
  6.0, 8.0, 8.0, 8.0, 7.0, 4.0,
  1.0, 0.5, 0.3, 0.2, 0.2, 0.2,
];
const BUREAU_WEEKEND = [
  0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
  0.2, 0.2, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, 0.5, 0.5, 0.5, 0.3,
  0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
];
const BUREAU_OCC = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.1, 0.8, 0.95, 0.95, 0.85,
  0.7, 0.85, 0.95, 0.95, 0.9, 0.6,
  0.1, 0.0, 0.0, 0.0, 0.0, 0.0,
];

export const INTERNAL_GAINS_PROFILES: Record<string, InternalGainsProfile> = {
  logement: {
    id: 'logement',
    usage: 'logement',
    gains_W_m2_occupancy: LOGEMENT_WEEKDAY,
    gains_W_m2_weekend: LOGEMENT_WEEKEND,
    occupancy_fraction: LOGEMENT_OCC,
  },
  bureau: {
    id: 'bureau',
    usage: 'bureau',
    gains_W_m2_occupancy: BUREAU_WEEKDAY,
    gains_W_m2_weekend: BUREAU_WEEKEND,
    occupancy_fraction: BUREAU_OCC,
  },
  mixte: {
    id: 'mixte',
    usage: 'mixte',
    gains_W_m2_occupancy: LOGEMENT_WEEKDAY.map((v, i) => (v + BUREAU_WEEKDAY[i]) / 2),
    gains_W_m2_weekend: LOGEMENT_WEEKEND.map((v, i) => (v + BUREAU_WEEKEND[i]) / 2),
    occupancy_fraction: LOGEMENT_OCC.map((v, i) => (v + BUREAU_OCC[i]) / 2),
  },
};
