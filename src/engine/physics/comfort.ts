// Confort thermique — PMV/PPD (Fanger)
// Sources : EN ISO 7730:2005, ASHRAE 55

/**
 * PMV — Predicted Mean Vote (-3 à +3)
 * Fanger 1970, normalisé EN ISO 7730:2005
 * @param T_a    Température air (°C)
 * @param T_mrt  Température moyenne radiante (°C)
 * @param v_air  Vitesse de l'air (m/s)
 * @param RH     Humidité relative (%)
 * @param met    Métabolisme (met, 1 met = 58.15 W/m²)
 * @param clo    Isolation vestimentaire (clo, 1 clo = 0.155 m²·K/W)
 */
export function pmv(
  T_a: number,
  T_mrt: number,
  v_air: number,
  RH: number,
  met = 1.2,
  clo = 0.5,
): number {
  const M = met * 58.15;    // W/m² surface peau
  const Icl = clo * 0.155;  // m²·K/W

  // Pression partielle vapeur (Pa)
  const pa = RH / 100 * 1000 * Math.exp(16.6536 - 4030.183 / (T_a + 235));

  const fcl = clo > 0.5 ? 1.05 + 0.645 * Icl : 1.00 + 1.290 * Icl;

  // Température de surface habillement (itération point fixe avec sous-relaxation 0.5)
  let Tcl = T_a + (35.5 - T_a) / (3.5 + fcl * (0.1 + Icl));
  for (let iter = 0; iter < 150; iter++) {
    const hc = v_air > 0.22 * Math.pow(Math.abs(Tcl - T_a), 0.25)
      ? 12.1 * Math.sqrt(v_air)
      : 2.38 * Math.pow(Math.abs(Tcl - T_a), 0.25);
    const Tcl_new = 35.7 - 0.028 * M
      - Icl * (3.96e-8 * fcl * (Math.pow(Tcl + 273, 4) - Math.pow(T_mrt + 273, 4))
              + fcl * hc * (Tcl - T_a));
    const dTcl = Tcl_new - Tcl;
    if (Math.abs(dTcl) < 0.001) break;
    Tcl += 0.5 * dTcl;  // sous-relaxation pour convergence
  }
  const hc = v_air > 0.22 * Math.pow(Math.abs(Tcl - T_a), 0.25)
    ? 12.1 * Math.sqrt(v_air)
    : 2.38 * Math.pow(Math.abs(Tcl - T_a), 0.25);

  const L = M - 3.05e-3 * (5733 - 6.99 * M - pa)
    - (M > 58.15 ? 0.42 * (M - 58.15) : 0)
    - 1.7e-5 * M * (5867 - pa)
    - 0.0014 * M * (34 - T_a)
    - 3.96e-8 * fcl * (Math.pow(Tcl + 273, 4) - Math.pow(T_mrt + 273, 4))
    - fcl * hc * (Tcl - T_a);

  return (0.303 * Math.exp(-0.036 * M) + 0.028) * L;
}

/** PPD — Predicted Percentage of Dissatisfied (%) */
export function ppd(pmvVal: number): number {
  return 100 - 95 * Math.exp(-0.03353 * pmvVal ** 4 - 0.2179 * pmvVal ** 2);
}

/** Température opérative (°C) */
export function tOperative(T_a: number, T_mrt: number, v_air = 0.1): number {
  const A = v_air < 0.2 ? 0.5 : v_air < 0.6 ? 0.6 : 0.7;
  return A * T_a + (1 - A) * T_mrt;
}

/** Catégorie de confort EN ISO 7730 (I, II, III, IV) */
export function comfortCategory(pmvVal: number): 'I' | 'II' | 'III' | 'IV' {
  const abs = Math.abs(pmvVal);
  if (abs <= 0.2) return 'I';
  if (abs <= 0.5) return 'II';
  if (abs <= 0.7) return 'III';
  return 'IV';
}
