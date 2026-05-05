// Conversions géométriques — mètres ↔ unités Three.js (1:1 par convention)
// et calculs de surface/volume utilitaires

/**
 * Dans cette application, 1 unité Three.js = 1 mètre.
 * Ces helpers existent pour la clarté du code et la maintenabilité.
 */

export const M_TO_THREE = 1;   // 1 m = 1 unité Three.js
export const THREE_TO_M = 1;

export function mToThree(meters: number): number {
  return meters * M_TO_THREE;
}

export function threeToM(units: number): number {
  return units * THREE_TO_M;
}

/**
 * Surface plancher totale (SDP) en m².
 */
export function floorArea(length: number, width: number, nFloors: number): number {
  return length * width * nFloors;
}

/**
 * Volume total brut en m³.
 */
export function grossVolume(length: number, width: number, floorHeight: number, nFloors: number): number {
  return length * width * floorHeight * nFloors;
}

/**
 * Hauteur totale en m.
 */
export function totalHeight(floorHeight: number, nFloors: number): number {
  return floorHeight * nFloors;
}

/**
 * Surface de façade brute (une orientation) en m².
 */
export function facadeArea(dimension: number, height: number): number {
  return dimension * height;
}

/**
 * Périmètre du bâtiment en m.
 */
export function perimeter(length: number, width: number): number {
  return 2 * (length + width);
}

/**
 * Rapport surface déperditive / volume (m⁻¹).
 */
export function compactnessRatio(
  length: number,
  width: number,
  floorHeight: number,
  nFloors: number,
): number {
  const A_dep = 2 * length * (floorHeight * nFloors)
              + 2 * width  * (floorHeight * nFloors)
              + 2 * length * width;   // sol + toiture
  const V = grossVolume(length, width, floorHeight, nFloors);
  return V > 0 ? A_dep / V : 0;
}

/**
 * Convertit un angle de rotation (deg) en vecteur de normale Nord.
 */
export function orientationToNormal(orientationDeg: number): [number, number, number] {
  const rad = (orientationDeg * Math.PI) / 180;
  return [Math.sin(rad), 0, Math.cos(rad)];
}
