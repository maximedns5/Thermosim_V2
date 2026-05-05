// Vecteurs énergie, facteurs EP et CO2
// Sources : RE2020 (arrêté 4 août 2021), ADEME base carbone v22.0 (2024)
// À ACTUALISER ANNÉE N si changements réglementaires

import type { EnergyVectorSpec } from '../types';

export const ENERGY_VECTORS: Record<string, EnergyVectorSpec> = {
  electricite:      { id: 'electricite',      name: 'Électricité',            factor_EP: 2.30, factor_CO2: 0.0599, price_EUR_kWh: 0.2276 },
  gaz_naturel:      { id: 'gaz_naturel',      name: 'Gaz naturel',            factor_EP: 1.00, factor_CO2: 0.2270, price_EUR_kWh: 0.1190 },
  fioul_domestique: { id: 'fioul_domestique', name: 'Fioul domestique',        factor_EP: 1.00, factor_CO2: 0.3246, price_EUR_kWh: 0.1400 },
  granules_bois:    { id: 'granules_bois',    name: 'Granulés bois',           factor_EP: 1.00, factor_CO2: 0.0297, price_EUR_kWh: 0.0700 },
  bois_buches:      { id: 'bois_buches',      name: 'Bois bûches',             factor_EP: 1.00, factor_CO2: 0.0297, price_EUR_kWh: 0.0450 },
  reseau_chaleur:   { id: 'reseau_chaleur',   name: 'Réseau de chaleur urbain', factor_EP: 0.77, factor_CO2: 0.1110, price_EUR_kWh: 0.0820 },
  solaire:          { id: 'solaire',          name: 'Solaire thermique',        factor_EP: 0.00, factor_CO2: 0.0000, price_EUR_kWh: 0.0000 },
};

// Seuils kWhEP/(m²·an) — arrêté 31 mars 2021
export const DPE_THRESHOLDS = { A: 70, B: 110, C: 180, D: 250, E: 330, F: 420, G: Infinity };

// Seuils kgCO2eq/(m²·an)
export const DPE_CO2_THRESHOLDS = { A: 6, B: 11, C: 30, D: 50, E: 70, F: 100, G: Infinity };
