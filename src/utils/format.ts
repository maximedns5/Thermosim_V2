// Formatage des valeurs numériques — chiffres tabulaires IBM Plex Mono

/**
 * Format un nombre entier avec séparateur milliers (espace fin).
 */
export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

/**
 * Format kWh/m²·an avec 0 décimale.
 */
export function fmtEP(value: number): string {
  return `${Math.round(value)} kWh/m²·an`;
}

/**
 * Format kg CO₂eq/m²·an avec 0 décimale.
 */
export function fmtCO2(value: number): string {
  return `${Math.round(value)} kg CO₂/m²·an`;
}

/**
 * Format €/an avec 0 décimale.
 */
export function fmtCost(value: number): string {
  return `${fmtInt(value)} €/an`;
}

/**
 * Format une température en °C avec 1 décimale.
 */
export function fmtTemp(value: number): string {
  return `${value.toFixed(1)} °C`;
}

/**
 * Format watts (puissance).
 */
export function fmtW(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)} kW`;
  }
  return `${Math.round(value)} W`;
}

/**
 * Format une surface en m².
 */
export function fmtArea(value: number): string {
  return `${value.toFixed(1)} m²`;
}

/**
 * Format un U-value en W/m²·K.
 */
export function fmtU(value: number): string {
  return `${value.toFixed(3)} W/m²·K`;
}

/**
 * Format un coefficient de performance.
 */
export function fmtCOP(value: number): string {
  return value.toFixed(2);
}

/**
 * Format un pourcentage.
 */
export function fmtPct(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)} %`;
}

/**
 * Format une durée en heures (ex: 1 234 h).
 */
export function fmtHours(value: number): string {
  return `${fmtInt(value)} h`;
}

/**
 * Clamp une valeur entre min et max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
