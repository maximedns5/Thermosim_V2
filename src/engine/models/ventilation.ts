// Modèle ventilation + infiltrations
// Sources : EN ISO 13789, RE2020, guide RAGE

const RHO_AIR = 1.225;  // kg/m³
const CP_AIR  = 1005.0; // J/(kg·K)

import { VMC_TYPES } from '../data/hvac';
import type { VMCSpec } from '../types';

export class Ventilation {
  public readonly vmc: VMCSpec;

  constructor(
    public readonly vmcId: string,
    public readonly n50: number,          // vol/h à 50 Pa (mesure blower door)
    public readonly volume: number,       // m³ bâtiment
    public readonly q_v_hygienique: number, // m³/h débit mécanique total
  ) {
    const v = VMC_TYPES[vmcId];
    if (!v) throw new Error(`VMC inconnue : ${vmcId}`);
    this.vmc = v;
  }

  /** Débit d'infiltrations (m³/s) en fonction de la vitesse du vent (m/s) */
  infiltrationFlow(windSpeed: number): number {
    // q_infil = (n50/20) × V/3600 × (1 + 0.1·V_vent)
    // Facteur 20 : convention EN ISO 13789 pour passage 50 Pa → conditions réelles
    return (this.n50 / 20) * (this.volume / 3600) * (1 + 0.1 * windSpeed);
  }

  /** Pertes par ventilation mécanique (W) */
  mechanicalLoss(T_int: number, T_ext: number): number {
    if (this.q_v_hygienique <= 0) return 0;
    const q_m3s = this.q_v_hygienique / 3600; // m³/s
    return RHO_AIR * CP_AIR * q_m3s * (T_int - T_ext) * (1 - this.vmc.recup);
  }

  /** Pertes par infiltrations naturelles (W) */
  infiltrationLoss(T_int: number, T_ext: number, windSpeed: number): number {
    const q = this.infiltrationFlow(windSpeed);
    return RHO_AIR * CP_AIR * q * (T_int - T_ext);
  }

  /** Pertes totales ventilation + infiltrations (W) */
  totalLoss(T_int: number, T_ext: number, windSpeed: number): number {
    return this.mechanicalLoss(T_int, T_ext) + this.infiltrationLoss(T_int, T_ext, windSpeed);
  }

  /** Consommation ventilateurs (W) */
  fanConsumption(): number {
    if (this.q_v_hygienique <= 0) return 0;
    return this.vmc.conso_W_m3h * this.q_v_hygienique;
  }

  /** Débit d'air neuf total (m³/h) */
  totalAirflow(windSpeed: number): number {
    return this.q_v_hygienique + this.infiltrationFlow(windSpeed) * 3600;
  }
}
