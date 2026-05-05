// Niveaux d'étanchéité à l'air et types VMC
// Sources : RT2012, RE2020, Passivhaus Institut, norme EN 13829

import type { AirtightnessLevel, ShadingDevice } from '../types';

export const AIRTIGHTNESS_LEVELS: Record<string, AirtightnessLevel> = {
  // n50 : renouvellements d'air/h sous 50 Pa (EN 13829)
  tres_permeable:   { id: 'tres_permeable',   name: 'Very leaky (pre-1960s)',        n50: 15.0, Q4: 2.50, description: 'Old buildings without special care' },
  permeable:        { id: 'permeable',         name: 'Leaky (pre-2000)',              n50: 10.0, Q4: 1.50, description: 'Old buildings, retrofitted' },
  standard:         { id: 'standard',          name: 'Standard (RT2012)',             n50:  3.0, Q4: 0.60, description: 'New build RT2012 multi-family' },
  bonne:            { id: 'bonne',             name: 'Good (E+C- label)',             n50:  1.5, Q4: 0.30, description: 'High-performance new build' },
  tres_bonne:       { id: 'tres_bonne',        name: 'Very good (BBC)',               n50:  0.8, Q4: 0.15, description: 'BBC Effinergie, label A' },
  passivhaus:       { id: 'passivhaus',        name: 'Passivhaus (≤ 0.6 ACH@50Pa)',  n50:  0.6, Q4: 0.10, description: 'Passivhaus certified, careful workmanship' },
};

export const SHADING_DEVICES: Record<string, ShadingDevice> = {
  aucun:              { id: 'aucun',              name: 'No shading',                       position: 'aucun',      Fc: 1.00 },
  store_int_clair:    { id: 'store_int_clair',    name: 'Light interior blind',             position: 'interieur',  Fc: 0.75 },
  store_int_sombre:   { id: 'store_int_sombre',   name: 'Dark interior blind',              position: 'interieur',  Fc: 0.65 },
  store_ext_clair:    { id: 'store_ext_clair',    name: 'Light exterior blind',             position: 'exterieur',  Fc: 0.25 },
  store_ext_sombre:   { id: 'store_ext_sombre',   name: 'Dark exterior blind',              position: 'exterieur',  Fc: 0.15 },
  volet_roulant:      { id: 'volet_roulant',      name: 'Rolling shutter',                  position: 'exterieur',  Fc: 0.10 },
  brise_soleil_h_0_5: { id: 'brise_soleil_h_0_5', name: 'Horizontal brise-soleil 0.5 m',   position: 'exterieur',  profondeur_m: 0.5,  facteur_ombrage_ete: 0.45, facteur_ombrage_hiver: 0.20 },
  brise_soleil_h_1_0: { id: 'brise_soleil_h_1_0', name: 'Horizontal brise-soleil 1.0 m',   position: 'exterieur',  profondeur_m: 1.0,  facteur_ombrage_ete: 0.65, facteur_ombrage_hiver: 0.30 },
  pergola:            { id: 'pergola',             name: 'Pergola / loggia',                position: 'exterieur',  Fc: 0.30 },
};
