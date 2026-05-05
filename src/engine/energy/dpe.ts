// Calcul DPE (diagnostic de performance énergétique)
// Sources : RE2020, Arrêté du 31 mars 2021, méthode 3CL-DPE v1.3

import { ENERGY_VECTORS, DPE_THRESHOLDS, DPE_CO2_THRESHOLDS } from '../data/energy';
import type { DpeLetter, EnergyVectorSpec } from '../types';

/** Énergie primaire totale kWhEP/m²/an → lettre DPE */
export function dpeFromEnergy(kWh_EP_m2: number): DpeLetter {
  if (kWh_EP_m2 <= DPE_THRESHOLDS.A) return 'A';
  if (kWh_EP_m2 <= DPE_THRESHOLDS.B) return 'B';
  if (kWh_EP_m2 <= DPE_THRESHOLDS.C) return 'C';
  if (kWh_EP_m2 <= DPE_THRESHOLDS.D) return 'D';
  if (kWh_EP_m2 <= DPE_THRESHOLDS.E) return 'E';
  if (kWh_EP_m2 <= DPE_THRESHOLDS.F) return 'F';
  return 'G';
}

/** Émissions CO₂ kgCO2eq/m²/an → lettre DPE GES */
export function dpeFromCO2(kgCO2_m2: number): DpeLetter {
  if (kgCO2_m2 <= DPE_CO2_THRESHOLDS.A) return 'A';
  if (kgCO2_m2 <= DPE_CO2_THRESHOLDS.B) return 'B';
  if (kgCO2_m2 <= DPE_CO2_THRESHOLDS.C) return 'C';
  if (kgCO2_m2 <= DPE_CO2_THRESHOLDS.D) return 'D';
  if (kgCO2_m2 <= DPE_CO2_THRESHOLDS.E) return 'E';
  if (kgCO2_m2 <= DPE_CO2_THRESHOLDS.F) return 'F';
  return 'G';
}

/** Double DPE (lettre retenue = pire des deux) */
export function dpeDouble(ep_kWh: number, co2_kg: number): DpeLetter {
  const letters: DpeLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const i_ep  = letters.indexOf(dpeFromEnergy(ep_kWh));
  const i_co2 = letters.indexOf(dpeFromCO2(co2_kg));
  return letters[Math.max(i_ep, i_co2)];
}

/** kWhEF → kWhEP selon vecteur énergétique */
export function toEP(kWh_EF: number, vectorId: string): number {
  const v: EnergyVectorSpec | undefined = ENERGY_VECTORS[vectorId];
  return kWh_EF * (v?.factor_EP ?? 1.0);
}

/** kWhEF → kgCO2eq selon vecteur énergétique */
export function toCO2(kWh_EF: number, vectorId: string): number {
  const v: EnergyVectorSpec | undefined = ENERGY_VECTORS[vectorId];
  return kWh_EF * (v?.factor_CO2 ?? 0.0);
}

/** kWhEF → €/an selon prix unitaire en €/kWh */
export function toCost(kWh_EF: number, vectorId: string): number {
  const v: EnergyVectorSpec | undefined = ENERGY_VECTORS[vectorId];
  return kWh_EF * (v?.price_EUR_kWh ?? 0.0);
}

/** Classe numérique pour gradients / affichages 0-6 */
export function dpeIndex(letter: DpeLetter): number {
  return { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6 }[letter];
}
