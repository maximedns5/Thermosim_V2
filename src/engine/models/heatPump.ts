// Modèle pompe à chaleur — Carnot corrigé
// Sources : EN 14511, EN 14825, littérature Bernier/Lemort

export class HeatPump {
  /** Facteur qualité Carnot (calibré sur COP nominal) */
  private _eta_carnot: number;

  constructor(
    public readonly COP_nominal: number,
    public readonly T_source_nominale: number,  // °C
    public readonly T_depart_nominale: number,   // °C
    public readonly T_bivalence = -7,            // °C
    public readonly inverter = true,
  ) {
    const T_h = this.T_depart_nominale + 273.15;
    const T_c = this.T_source_nominale + 273.15;
    const COP_carnot_nom = T_h / (T_h - T_c);
    this._eta_carnot = this.COP_nominal / COP_carnot_nom;
  }

  get eta_carnot(): number { return this._eta_carnot; }

  /** COP aux conditions données */
  copAtConditions(T_source: number, T_depart: number): number {
    if (T_source <= this.T_bivalence) return 1.0; // appoint élec pur
    const T_h = T_depart + 273.15;
    const T_c = T_source + 273.15;
    if (T_h <= T_c) return 1.0; // impossible thermodynamiquement
    const COP_carnot = T_h / (T_h - T_c);
    return Math.max(1.0, this._eta_carnot * COP_carnot);
  }

  /** COP en charge partielle */
  copAtPartialLoad(COP_full: number, loadRatio: number): number {
    const lr = Math.max(0.1, Math.min(1.0, loadRatio));
    if (this.inverter) {
      // Inverter : meilleur COP à charge partielle (–10 % à 50 % charge)
      return COP_full * (1 + 0.1 * (1 - lr));
    }
    // On/off : dégradation à charge partielle
    return COP_full * (0.9 + 0.1 * lr);
  }

  /** Puissance électrique consommée pour fournir Q_kW thermiques (kW) */
  powerConsumed(Q_kW: number, T_source: number, T_depart: number, loadRatio = 1.0): number {
    const COP = this.copAtPartialLoad(this.copAtConditions(T_source, T_depart), loadRatio);
    return Q_kW / Math.max(COP, 1.0);
  }

  /** EER en mode refroidissement (approximé depuis COP) */
  EER(T_source: number, T_depart: number): number {
    const COP = this.copAtConditions(T_source, T_depart);
    return COP - 1; // EER = COP_froid = COP_chaud - 1 (conservation énergie)
  }
}
