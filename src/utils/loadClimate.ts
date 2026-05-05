// Utilitaire de chargement et conversion des données climatiques TMY
import type { Climate, ClimateHourly, ClimateDesign } from '../engine/types';

interface HourRaw {
  T_ext: number;
  GHI: number;
  DNI: number;
  DHI: number;
  windSpeed: number;
  windDir: number;
  nebulosity: number;
  RH: number;
}

interface ClimateJSON {
  city?: string;
  country?: string;
  design: {
    lat: number;
    lon: number;
    timezone: number;
    T_ext_min: number;
    T_ext_max: number;
    HDD: number;
    CDD: number;
    windSpeed: number;
  };
  // Some files use 'hourly', others use 'hours' — both accepted
  hourly?: HourRaw[];
  hours?: HourRaw[];
}

/** Point de rosée — formule de Magnus */
function dewPoint(T: number, RH: number): number {
  const a = 17.625, b = 243.04;
  const rh = Math.max(1, Math.min(100, RH));
  const alpha = Math.log(rh / 100) + (a * T) / (b + T);
  return (b * alpha) / (a - alpha);
}

/** Rayonnement IR ciel — Swinbank + correction nuageuse */
function irSky(T_ext: number, nebulosity: number): number {
  const sigma = 5.67e-8;
  const T_K = T_ext + 273.15;
  const eps_clear = 0.787 + 0.764 * Math.log((T_K) / 273);
  const eps = Math.min(1, eps_clear * (1 + 0.0224 * nebulosity - 0.0035 * nebulosity ** 2 + 0.00028 * nebulosity ** 3));
  return eps * sigma * T_K ** 4;
}

const ZONES: Record<string, string> = {
  strasbourg: 'H1a',
  paris:      'H1b',
  brest:      'H1c',
  lyon:       'H2a',
  bordeaux:   'H2b',
  marseille:  'H3',
  clermont:   'H2d',
  perpignan:  'H3',
};

const ALTITUDES: Record<string, number> = {
  paris:      35,
  strasbourg: 150,
  bordeaux:   16,
  lyon:       170,
  marseille:  27,
  brest:      99,
  clermont:   329,
  perpignan:  42,
};

/**
 * Charge et convertit un fichier climat JSON.
 * Effectue un import() dynamique pour ne charger que la ville nécessaire.
 */
export async function loadClimate(city: string): Promise<Climate> {
  // Dynamic import — Vite code-splits automatiquement
  const raw = await import(`../engine/data/climates/${city}.json`) as { default: ClimateJSON };
  const data = raw.default;
  // Accept both 'hourly' and 'hours' key variants across city JSON files
  const rawHourly: HourRaw[] = data.hourly ?? data.hours ?? [];
  const n = rawHourly.length; // 8760

  const T_ext      = new Float32Array(n);
  const T_dewpoint = new Float32Array(n);
  const RH         = new Float32Array(n);
  const GHI        = new Float32Array(n);
  const DNI        = new Float32Array(n);
  const DHI        = new Float32Array(n);
  const IR_sky     = new Float32Array(n);
  const windSpeed  = new Float32Array(n);
  const windDir    = new Float32Array(n);
  const nebulosity = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const h = rawHourly[i];
    T_ext[i]      = h.T_ext;
    RH[i]         = h.RH;
    GHI[i]        = h.GHI;
    DNI[i]        = h.DNI;
    DHI[i]        = h.DHI;
    windSpeed[i]  = h.windSpeed;
    windDir[i]    = h.windDir;
    nebulosity[i] = h.nebulosity;
    T_dewpoint[i] = dewPoint(h.T_ext, h.RH);
    IR_sky[i]     = irSky(h.T_ext, h.nebulosity);
  }

  const hourly: ClimateHourly = {
    T_ext, T_dewpoint, RH, GHI, DNI, DHI, IR_sky, windSpeed, windDir, nebulosity,
  };

  const design: ClimateDesign = {
    T_ext_min: data.design.T_ext_min,
    T_ext_max: data.design.T_ext_max,
    HDD:       data.design.HDD,
    CDD:       data.design.CDD,
    zone:      ZONES[city] ?? 'H1b',
    windSpeed: data.design.windSpeed,
    albedo:    0.20,
    lat:       data.design.lat,
    lon:       data.design.lon,
    altitude:  ALTITUDES[city] ?? 50,
    timezone:  data.design.timezone,
  };

  return { city: data.city ?? city, hourly, design };
}
