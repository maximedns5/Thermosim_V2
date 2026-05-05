// Modèle fenêtre (vitrage + cadre + pont thermique intercalaire)
// Sources : EN ISO 10077-1:2017, certifications CEKAL/ACOTHERM

import { GLAZING_DB } from '../data/glazings';
import { FRAME_DB } from '../data/glazings';
import type { Glazing, Frame } from '../types';

export class Window {
  public readonly glazing: Glazing;
  public readonly frame: Frame;

  constructor(
    public readonly glazingId: string,
    public readonly frameId: string,
    public readonly area: number,       // m² total (vitrage + cadre)
    public readonly frameFraction = 0.20, // Af / (Ag + Af)
    public readonly psi_g = 0.06,       // W/(m·K) — pont thermique intercalaire
  ) {
    const g = GLAZING_DB[glazingId];
    const f = FRAME_DB[frameId];
    if (!g) throw new Error(`Vitrage inconnu : ${glazingId}`);
    if (!f) throw new Error(`Cadre inconnu : ${frameId}`);
    this.glazing = g;
    this.frame = f;
  }

  /** Surface vitrée nette (m²) */
  Ag(): number { return this.area * (1 - this.frameFraction); }

  /** Surface cadre (m²) */
  Af(): number { return this.area * this.frameFraction; }

  /** Périmètre intercalaire approximé (m) — pour carré équivalent */
  linearPerimeter(): number {
    return 4 * Math.sqrt(this.Ag());
  }

  /** Uw effectif EN ISO 10077 (W/(m²·K)) */
  Uw(): number {
    const Ag = this.Ag();
    const Af = this.Af();
    const lg = this.linearPerimeter();
    return (Ag * this.glazing.Uw + Af * this.frame.Uf + lg * this.psi_g) / (Ag + Af);
  }

  /** Apports solaires (W) — irradiance en W/m² sur le plan */
  solarGain(irradiance: number, shadingFc = 1.0): number {
    return this.glazing.g * this.Ag() * irradiance * shadingFc;
  }

  /** Déperditions (W) */
  heatLoss(T_int: number, T_ext: number): number {
    return this.Uw() * this.area * (T_int - T_ext);
  }
}
