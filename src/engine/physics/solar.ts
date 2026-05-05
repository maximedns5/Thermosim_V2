// Physique solaire — position, irradiance par façade
// Sources : NREL SPA simplifié, EN ISO 52010-1:2017, Perez model

const DEG = Math.PI / 180;

/** Déclinaison solaire (rad) — Spencer 1971 */
function solarDeclination(dayOfYear: number): number {
  const B = (360 / 365) * (dayOfYear - 1) * DEG;
  return DEG * (0.3963723 - 22.9132745 * Math.cos(B) + 4.0254304 * Math.sin(B)
    - 0.387205 * Math.cos(2 * B) + 0.051967 * Math.sin(2 * B)
    - 0.154527 * Math.cos(3 * B) + 0.084798 * Math.sin(3 * B));
}

/** Équation du temps (min) — Spencer */
function equationOfTime(dayOfYear: number): number {
  const B = (360 / 365) * (dayOfYear - 1) * DEG;
  return 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
    - 0.014615 * Math.cos(2 * B) - 0.04089 * Math.sin(2 * B));
}

export interface SolarPosition {
  elevation: number;   // degrés au-dessus de l'horizon
  azimuth: number;     // degrés depuis le nord (0=N, 90=E, 180=S, 270=W)
  hourAngle: number;   // degrés
  cosIncidence: Record<string, number>; // par façade (N, S, E, W, H)
}

/** Position solaire à latitude lat (degrés N), longitude lon (degrés E) */
export function solarPosition(
  lat: number,
  lon: number,
  dayOfYear: number,
  hourLocal: number,  // heure solaire locale (0-23)
  timezone: number,   // décalage UTC en heures
): SolarPosition {
  const decl = solarDeclination(dayOfYear);
  const EoT = equationOfTime(dayOfYear);
  const solarNoon = 12 - EoT / 60 - (lon - timezone * 15) / 15;
  const omega = (hourLocal - solarNoon) * 15 * DEG; // angle horaire
  const latR = lat * DEG;
  const sinElev = Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(omega);
  const elev = Math.asin(Math.max(-1, Math.min(1, sinElev)));
  const cosAz = (Math.sin(decl) - Math.sin(elev) * Math.sin(latR)) / (Math.cos(elev) * Math.cos(latR) + 1e-9);
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) / DEG;
  if (Math.sin(omega) > 0) az = 360 - az;

  const elevDeg = elev / DEG;
  const cosZ = Math.cos((90 - elevDeg) * DEG); // cosinus de l'angle zénithal

  // Cosinus d'incidence par façade
  const azimuthRad = az * DEG;
  const tilt = 90 * DEG; // murs verticaux
  const cosIncidence: Record<string, number> = {
    H: Math.max(0, cosZ), // horizontal
    S: Math.max(0, Math.cos(elev) * Math.cos(azimuthRad - 180 * DEG) * Math.sin(tilt) + Math.sin(elev) * Math.cos(tilt)),
    N: Math.max(0, Math.cos(elev) * Math.cos(azimuthRad - 0)         * Math.sin(tilt) + Math.sin(elev) * Math.cos(tilt)),
    E: Math.max(0, Math.cos(elev) * Math.cos(azimuthRad - 90 * DEG)  * Math.sin(tilt) + Math.sin(elev) * Math.cos(tilt)),
    W: Math.max(0, Math.cos(elev) * Math.cos(azimuthRad - 270 * DEG) * Math.sin(tilt) + Math.sin(elev) * Math.cos(tilt)),
  };

  return { elevation: elevDeg, azimuth: az, hourAngle: omega / DEG, cosIncidence };
}

/** Irradiance sur un plan incliné (W/m²) — modèle isotrope simple */
export function irradianceOnPlane(
  I_direct: number,   // DNI (W/m²)
  I_diffuse: number,  // DHI (W/m²)
  cosIncidence: number,
  tiltDeg = 90,       // degrés : 0=horizontal, 90=vertical
): number {
  const rho_ground = 0.20; // albédo sol standard
  const tilt = tiltDeg * DEG;
  const direct = Math.max(0, I_direct * cosIncidence);
  const diffuse = I_diffuse * (1 + Math.cos(tilt)) / 2;
  const reflected = (I_direct + I_diffuse) * rho_ground * (1 - Math.cos(tilt)) / 2;
  return direct + diffuse + reflected;
}
