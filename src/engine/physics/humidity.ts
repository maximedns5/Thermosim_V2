// Physique de l'humidité — condensation, Glaser
// Sources : EN ISO 13788:2012, EN ISO 13793

const SIGMA = 5.670374419e-8;

/** Pression de vapeur saturante (Pa) — formule de Magnus */
export function psat(T_C: number): number {
  if (T_C >= 0) {
    // Au-dessus de 0°C — Alduchov & Eskridge (1996)
    return 611.2 * Math.exp(17.67 * T_C / (T_C + 243.5));
  } else {
    // En dessous de 0°C (glace)
    return 611.2 * Math.exp(22.46 * T_C / (T_C + 272.62));
  }
}

/** Température de rosée (°C) depuis T et HR */
export function dewPoint(T_C: number, RH: number): number {
  const alpha = Math.log(RH / 100 * Math.exp(17.67 * T_C / (T_C + 243.5)));
  return 243.5 * alpha / (17.67 - alpha);
}

/**
 * Facteur fRsi — risque de condensation superficielle
 * EN ISO 13788 : fRsi = (T_surface - T_ext) / (T_int - T_ext)
 * Requis ≥ 0.70 pour HR_int=50%, T_ext=-5°C selon EN ISO 13788
 */
export function fRsi(T_surface: number, T_int: number, T_ext: number): number {
  const dT = T_int - T_ext;
  if (Math.abs(dT) < 0.01) return 1;
  return (T_surface - T_ext) / dT;
}

export interface GlaserLayer {
  name: string;
  thickness: number;    // m
  lambda: number;       // W/(m·K)
  mu: number;           // facteur de résistance à la vapeur
  T_in: number;         // °C côté chaud
  T_out: number;        // °C côté froid
  pv_in: number;        // Pa pression vapeur côté intérieur
  pv_out: number;       // Pa pression vapeur côté extérieur
  psat_in: number;      // Pa pression saturante côté chaud
  psat_out: number;     // Pa pression saturante côté froid
  condensation: boolean;
}

/**
 * Méthode de Glaser (EN ISO 13788)
 * Retourne le profil de pression vapeur et de condensation pour chaque couche
 */
export function glaser(
  layers: Array<{ name: string; thickness: number; lambda: number; mu: number }>,
  T_int: number,
  T_ext: number,
  RH_int: number,  // %
  RH_ext: number,  // %
  Rsi = 0.13,
  Rse = 0.04,
): GlaserLayer[] {
  const N = layers.length;

  // Profil de température (aux interfaces)
  const R_total = Rsi + layers.reduce((s, l) => s + l.thickness / l.lambda, 0) + Rse;
  const flux = (T_int - T_ext) / R_total;
  const T_interfaces: number[] = [T_int - flux * Rsi];
  for (const l of layers) T_interfaces.push(T_interfaces[T_interfaces.length - 1] - flux * l.thickness / l.lambda);

  // Profil de pression vapeur (linéaire en résistance vapeur)
  const Sd_total = Rsi * 0 + layers.reduce((s, l) => s + l.thickness * l.mu, 0) + Rse * 0;
  const pv_int = (RH_int / 100) * psat(T_int);
  const pv_ext = (RH_ext / 100) * psat(T_ext);
  const pv_flux = (pv_int - pv_ext) / (Sd_total || 1);

  const pv_interfaces: number[] = [pv_int];
  for (const l of layers) pv_interfaces.push(pv_interfaces[pv_interfaces.length - 1] - pv_flux * l.thickness * l.mu);

  return layers.map((l, i) => ({
    name: l.name,
    thickness: l.thickness,
    lambda: l.lambda,
    mu: l.mu,
    T_in:  T_interfaces[i],
    T_out: T_interfaces[i + 1],
    pv_in:  pv_interfaces[i],
    pv_out: pv_interfaces[i + 1],
    psat_in:  psat(T_interfaces[i]),
    psat_out: psat(T_interfaces[i + 1]),
    condensation: pv_interfaces[i] > psat(T_interfaces[i]) || pv_interfaces[i + 1] > psat(T_interfaces[i + 1]),
  }));
}
