// Physique du ciel — température radiante et rayonnement IR
// Sources : Swinbank (1963), Brunt (1940), EN ISO 13786

const SIGMA = 5.670374419e-8; // W/(m²·K⁴) — constante Stefan-Boltzmann
const EPSILON_SKY = 0.97;     // émissivité ciel par défaut

/**
 * Température de ciel (K) — formule de Swinbank (1963)
 * T_sky = 0.0552 × T_air^1.5
 */
export function T_ciel_Swinbank(T_air_K: number): number {
  return 0.0552 * Math.pow(T_air_K, 1.5);
}

/**
 * Température de ciel corrigée par la nébulosité (0=ciel clair, 1=couvert)
 * Modèle Brunt corrigé : T_sky ≈ T_air × (0.74 + 0.06·sqrt(e)) + nuages
 */
export function T_ciel(
  T_air_C: number,
  nebulosity: number,  // fraction 0-1
  T_dew_C: number,
): number {
  const T_air_K = T_air_C + 273.15;
  const T_dew_K = T_dew_C + 273.15;
  // pression vapeur saturante au point de rosée
  const e_hPa = 6.1078 * Math.exp(17.27 * T_dew_C / (T_dew_C + 237.3));
  // ε_ciel par Brunt
  const eps_clear = 0.74 + 0.06 * Math.sqrt(e_hPa / 10);
  // correction nuages (Kimball 1982)
  const eps_sky = eps_clear * (1 + 0.22 * nebulosity * nebulosity);
  const T_sky_clear_K = Math.pow(eps_sky * T_air_K ** 4, 0.25);
  return Math.min(T_sky_clear_K, T_air_K) - 273.15;
}

/** Flux IR descendant du ciel (W/m²) */
export function IR_ciel(T_sky_C: number, epsilon = EPSILON_SKY): number {
  const T_K = T_sky_C + 273.15;
  return epsilon * SIGMA * T_K ** 4;
}

/** Refroidissement radiatif d'une surface (W/m²) vers le ciel */
export function radiativeCooling(
  T_surface_C: number,
  T_sky_C: number,
  epsilon = 0.9,
): number {
  const T_s = T_surface_C + 273.15;
  const T_k = T_sky_C + 273.15;
  return epsilon * SIGMA * (T_s ** 4 - T_k ** 4);
}
