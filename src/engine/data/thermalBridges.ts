// Ponts thermiques linéiques ψ (psi)
// Sources : EN ISO 10211:2017, Guide RAGE ponts thermiques, RT2012/RE2020

import type { ThermalBridgeSpec } from '../types';

export const THERMAL_BRIDGES: Record<string, ThermalBridgeSpec> = {
  // Liaisons mur/plancher bas
  refend_plancher:       { id: 'refend_plancher',       name: 'Refend / plancher intermédiaire',  psi: 0.60 },
  facade_plancher_iti:   { id: 'facade_plancher_iti',   name: 'Façade / plancher (ITI)',           psi: 0.55 },
  facade_plancher_ite:   { id: 'facade_plancher_ite',   name: 'Façade / plancher (ITE)',           psi: 0.10 },

  // Liaisons mur/fenêtre
  tableau_iti:           { id: 'tableau_iti',           name: 'Tableau fenêtre (ITI)',             psi: 0.25 },
  tableau_ite:           { id: 'tableau_ite',           name: 'Tableau fenêtre (ITE)',             psi: 0.05 },
  seuil_porte:           { id: 'seuil_porte',           name: 'Seuil de porte',                    psi: 0.40 },

  // Angle
  angle_sortant_iti:     { id: 'angle_sortant_iti',     name: 'Angle sortant (ITI)',               psi: 0.10 },
  angle_sortant_ite:     { id: 'angle_sortant_ite',     name: 'Angle sortant (ITE)',               psi: 0.05 },
  angle_rentrant:        { id: 'angle_rentrant',        name: 'Angle rentrant',                    psi: -0.05 },

  // Toiture/acrotère
  acrotere_iti:          { id: 'acrotere_iti',          name: 'Acrotère toiture terrasse (ITI)',   psi: 0.50 },
  acrotere_ite:          { id: 'acrotere_ite',          name: 'Acrotère toiture terrasse (ITE)',   psi: 0.15 },
  rive_toiture_inclinee: { id: 'rive_toiture_inclinee', name: 'Rive toiture inclinée',             psi: 0.30 },

  // Passif / haute performance
  passive_house_psi:     { id: 'passive_house_psi',     name: 'Détail passif (ψ ≈ 0)',            psi: 0.01 },
};
