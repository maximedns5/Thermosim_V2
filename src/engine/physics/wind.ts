// Physique du vent — profil de hauteur et Rse dynamique
// Sources : EN ISO 6946:2017, EN ISO 15927, ASCE 7

export const TERRAIN_ALPHA: Record<string, number> = {
  campagne:     0.14,
  suburbain:    0.22,
  urbain:       0.30,
  centre_ville: 0.33,
};

/**
 * Vitesse du vent à la hauteur h (m) en fonction de la mesure météo à z_ref=10 m
 * Loi puissance EN ISO 15927
 */
export function windAtHeight(
  V_meteo: number,
  h: number,
  terrain: keyof typeof TERRAIN_ALPHA,
  z_ref = 10,
): number {
  const alpha = TERRAIN_ALPHA[terrain] ?? 0.22;
  return V_meteo * Math.pow(Math.max(h, 0.1) / z_ref, alpha);
}

/**
 * Rse dynamique (m²·K/W) selon EN ISO 6946
 * h_conv = 4 + 4·V  (W/(m²·K))
 * h_rad  = ε·σ·4·T³ (simplifié ≈ ε·5.0 à T≈20°C)
 */
export function RseDynamic(windSpeed: number, emissivity = 0.9): number {
  const h_conv = 4 + 4 * windSpeed;
  const h_rad  = emissivity * 5.0;
  return 1 / (h_conv + h_rad);
}

/**
 * Température ressentie (wind chill canadien)
 * Valable pour T < 10°C et V_km_h ≥ 4.8 km/h
 */
export function windChill(T_C: number, V_m_s: number): number {
  const V_km_h = V_m_s * 3.6;
  if (T_C >= 10 || V_km_h < 4.8) return T_C;
  const V16 = Math.pow(V_km_h, 0.16);
  return 13.12 + 0.6215 * T_C - 11.37 * V16 + 0.3965 * T_C * V16;
}
