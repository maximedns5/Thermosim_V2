// Modèle paroi multicouche
// Sources : EN ISO 6946:2017, EN ISO 10456

import { MATERIALS_DB } from '../data/materials';
import type { Layer } from '../types';

const RSI_DEFAULT = 0.13; // m²·K/W — EN ISO 6946 paroi verticale intérieure
const RSE_DEFAULT = 0.04; // m²·K/W — EN ISO 6946 paroi extérieure

export class Wall {
  constructor(
    public readonly layers: Layer[],
    public readonly area: number,  // m²
  ) {}

  /** Résistance thermique totale (m²·K/W) */
  Rtotal(Rsi = RSI_DEFAULT, Rse = RSE_DEFAULT): number {
    const Rlayers = this.layers.reduce((acc, l) => {
      const m = MATERIALS_DB[l.material];
      if (!m) throw new Error(`Matériau inconnu : ${l.material}`);
      return acc + l.thickness / m.lambda;
    }, 0);
    return Rsi + Rlayers + Rse;
  }

  /** Coefficient U (W/(m²·K)) */
  U(Rsi = RSI_DEFAULT, Rse = RSE_DEFAULT): number {
    return 1 / this.Rtotal(Rsi, Rse);
  }

  /** Déperditions Q (W) */
  heatLoss(T_int: number, T_ext: number, Rsi = RSI_DEFAULT, Rse = RSE_DEFAULT): number {
    return this.U(Rsi, Rse) * this.area * (T_int - T_ext);
  }

  /** Capacité thermique (J/K) */
  thermalCapacity(): number {
    return this.layers.reduce((acc, l) => {
      const m = MATERIALS_DB[l.material];
      if (!m) return acc;
      return acc + m.rho * m.cp * l.thickness * this.area;
    }, 0);
  }

  /** Profil T(x) à chaque interface (de l'intérieur vers l'extérieur) */
  temperatureProfile(T_int: number, T_ext: number, Rsi = RSI_DEFAULT, Rse = RSE_DEFAULT): number[] {
    const R = this.Rtotal(Rsi, Rse);
    const flux_m2 = (T_int - T_ext) / R;
    const profile: number[] = [T_int - flux_m2 * Rsi];
    for (const l of this.layers) {
      const m = MATERIALS_DB[l.material];
      if (!m) continue;
      const dR = l.thickness / m.lambda;
      profile.push(profile[profile.length - 1] - flux_m2 * dR);
    }
    return profile;
  }

  /** Épaisseur totale (m) */
  thickness(): number {
    return this.layers.reduce((acc, l) => acc + l.thickness, 0);
  }

  /** Inertie thermique = temps de déphasage approximatif (h) */
  phaseShift(): number {
    const C_total = this.thermalCapacity() / this.area; // J/(m²·K)
    const R_total = this.Rtotal() - 0.13 - 0.04;       // couches seules
    // Approximation Beuken : φ ≈ sqrt(C·R) / (2·π) × ... simplifiée
    return Math.sqrt(C_total * R_total) / 3600;
  }
}
