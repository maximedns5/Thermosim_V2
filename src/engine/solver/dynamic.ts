// Solveur dynamique 8760h — RK4 mono-zone
// Hypothèse : modèle RC 2R1C (ISO 13790 annexe C)

import { Wall } from '../models/wall';
import { Window } from '../models/window';
import { Ventilation } from '../models/ventilation';
import { HeatPump } from '../models/heatPump';
import { HEATING_SYSTEMS, ECS_SYSTEMS } from '../data/hvac';
import { solarPosition, irradianceOnPlane } from '../physics/solar';
import { RseDynamic } from '../physics/wind';
import { pmv, tOperative } from '../physics/comfort';
import { toEP, toCO2, toCost } from '../energy/dpe';
import { INTERNAL_GAINS_PROFILES } from '../data/gains';
import type { BuildingConfig, AnnualResult } from '../types';

const HOURS = 8760;

/** Modèle RC : dT/dt = (Q_in - Q_loss) / C_th */
function deriv(
  T: number,
  Q_in: number,
  Q_loss_per_K: number,
  T_ext: number,
  C_th: number,
): number {
  return (Q_in - Q_loss_per_K * (T - T_ext)) / C_th;
}

export async function solveDynamic(
  config: BuildingConfig,
  onProgress?: (pct: number) => void,
): Promise<AnnualResult> {
  const { geometry, wallLayers, windows, roof, ventilation, hvac, climate, terrain } = config;

  if (!climate?.hourly) throw new Error('Données climatiques horaires manquantes');
  const { T_ext, GHI, DNI, DHI, windSpeed, nebulosity } = climate.hourly;

  // Geometry
  const totalHeight = geometry.floorHeight * geometry.nFloors;
  const A_floor  = geometry.length * geometry.width;
  const A_roof   = A_floor;
  const volume   = A_floor * totalHeight;
  const A_win_N  = windows.ratioNorth  * geometry.length * totalHeight;
  const A_win_S  = windows.ratioSouth  * geometry.length * totalHeight;
  const A_win_E  = windows.ratioEast   * geometry.width  * totalHeight;
  const A_win_W  = windows.ratioWest   * geometry.width  * totalHeight;
  const A_wall = 2 * geometry.length * totalHeight
               + 2 * geometry.width  * totalHeight
               - A_win_N - A_win_S - A_win_E - A_win_W;

  // Models
  const wall = new Wall(wallLayers, A_wall);
  const winN = new Window(windows.glazingId, windows.frameId, A_win_N);
  const winS = new Window(windows.glazingId, windows.frameId, A_win_S);
  const winE = new Window(windows.glazingId, windows.frameId, A_win_E);
  const winW = new Window(windows.glazingId, windows.frameId, A_win_W);
  const vent = new Ventilation(ventilation.vmcId, ventilation.n50, volume, ventilation.q_v_hygienique);

  // Thermal capacity
  const C_th = wall.thermalCapacity() + 100_000 * A_floor; // +100 kJ/(m²·K) mobilier

  // Heating / cooling
  const heatSys = HEATING_SYSTEMS[hvac.heatingId];
  const heatPump = heatSys?.category === 'pac'
    ? new HeatPump(heatSys.COP_nominal ?? 3.0, heatSys.T_source_nominale ?? 7, heatSys.T_depart_nominale ?? 45, heatSys.T_bivalence ?? -7, heatSys.inverter)
    : null;

  // Internal gains profile
  const gainsProfile = INTERNAL_GAINS_PROFILES[config.internalGainsId ?? 'logement'];
  const lat = climate.design?.lat ?? 48.9;
  const lon = climate.design?.lon ?? 2.3;
  const tz  = climate.design?.timezone ?? 1;

  // Output arrays
  const T_zone     = new Float32Array(HOURS);
  const Q_heat     = new Float32Array(HOURS);
  const Q_cool     = new Float32Array(HOURS);
  const E_heat     = new Float32Array(HOURS);
  const E_cool     = new Float32Array(HOURS);
  const pmv_arr    = new Float32Array(HOURS);
  const solar_gain = new Float32Array(HOURS);

  let T = hvac.T_set_heat;
  const T_set_h = hvac.T_set_heat;
  const T_set_c = hvac.T_set_cool ?? 26;
  const dt = 3600; // 1 h en secondes

  for (let h = 0; h < HOURS; h++) {
    if (h % 876 === 0) onProgress?.(h / HOURS);

    const Te = T_ext[h];
    const Vw = windSpeed[h];
    const doy = Math.floor(h / 24) + 1;
    const hour = h % 24;
    const isWeekend = Math.floor(h / 24) % 7 >= 5;

    // Solaire
    const pos = solarPosition(lat, lon, doy, hour, tz);
    const Fc = 1.0; // shading simplifié
    const Qsol_N = irradianceOnPlane(DNI[h], DHI[h], pos.cosIncidence.N) * winN.solarGain(1, Fc);
    const Qsol_S = irradianceOnPlane(DNI[h], DHI[h], pos.cosIncidence.S) * winS.solarGain(1, Fc);
    const Qsol_E = irradianceOnPlane(DNI[h], DHI[h], pos.cosIncidence.E) * winE.solarGain(1, Fc);
    const Qsol_W = irradianceOnPlane(DNI[h], DHI[h], pos.cosIncidence.W) * winW.solarGain(1, Fc);
    const Qsol = Qsol_N + Qsol_S + Qsol_E + Qsol_W;
    solar_gain[h] = Qsol;

    // Apports internes (W/m²)
    const gains_W_m2 = isWeekend
      ? (gainsProfile.gains_W_m2_weekend[hour] ?? 2.0)
      : (gainsProfile.gains_W_m2_occupancy[hour] ?? 2.0);
    const Qi = gains_W_m2 * A_floor;

    // Déperditions par K
    const Rse = RseDynamic(Vw);
    const Hloss =
      wall.U(0.13, Rse) * A_wall +
      winN.Uw() * A_win_N + winS.Uw() * A_win_S + winE.Uw() * A_win_E + winW.Uw() * A_win_W +
      0.3 * A_floor + // plancher
      1 / (0.04 + (roof.insulation?.thickness ?? 0.2) / 0.032 + 0.13) * A_roof +
      vent.totalLoss(T, Te, Vw) / Math.max(T - Te, 0.01);

    // Régulation
    let Qhvac = 0;
    let E_h = 0, E_c = 0;
    const Q_need = Hloss * (T_set_h - Te);

    if (T < T_set_h - 0.5) {
      Qhvac = Math.min(Q_need * 1.5, Q_need + C_th * (T_set_h - T) / dt);
      if (heatPump) {
        const cop = heatPump.copAtConditions(Te, heatSys?.T_depart_nominale ?? 45);
        E_h = Math.max(0, Qhvac) / Math.max(cop, 1) / 1000;
      } else {
        const eta = (heatSys?.eta_generation ?? 0.9) * (heatSys?.eta_emission ?? 0.95);
        E_h = Math.max(0, Qhvac) / eta / 1000;
      }
    } else if (T > T_set_c + 0.5 && hvac.coolingId) {
      Qhvac = -Hloss * (T - T_set_c);
      E_c = Math.abs(Qhvac) / 3.0 / 1000; // EER=3 approx
    }

    // Intégration Euler (RK4 simplifié — dt=1h = quasi-stationnaire)
    const dT_dt = (Qsol + Qi + Qhvac - Hloss * (T - Te)) / C_th;
    T += dT_dt * dt;
    T = Math.max(-30, Math.min(60, T));

    T_zone[h]  = T;
    Q_heat[h]  = Math.max(0, Qhvac);
    Q_cool[h]  = Math.min(0, Qhvac);
    E_heat[h]  = E_h;
    E_cool[h]  = E_c;

    // PMV (simplifié : T_mrt ≈ T_zone)
    const occ = gainsProfile.occupancy_fraction[hour] ?? 0.5;
    if (occ > 0.1) {
      pmv_arr[h] = pmv(T, T, 0.1, 50);
    }
  }

  onProgress?.(1.0);

  // Agrégation annuelle
  const sum = (arr: Float32Array) => arr.reduce((a, b) => a + b, 0);
  const EF_heat_kWh = sum(E_heat);
  const EF_cool_kWh = sum(E_cool);
  const EF_fans_kWh = (vent.fanConsumption() * HOURS) / 1000;
  const EF_ecs_kWh  = 35 * A_floor / (ECS_SYSTEMS[hvac.ecsId]?.COP_or_eta ?? 0.9);
  const EF_total    = EF_heat_kWh + EF_cool_kWh + EF_fans_kWh + EF_ecs_kWh;

  const vectorId = HEATING_SYSTEMS[hvac.heatingId]?.energy_vector ?? 'gaz_naturel';
  const EP_m2  = toEP(EF_total, vectorId) / A_floor;
  const CO2_m2 = toCO2(EF_total, vectorId) / A_floor;
  const cost_eur = toCost(EF_total, vectorId);

  // PMV stats
  const pmv_values = Array.from(pmv_arr).filter(v => v !== 0);
  const pmv_mean = pmv_values.length > 0 ? pmv_values.reduce((a, b) => a + b, 0) / pmv_values.length : 0;
  const comfort_pct = pmv_values.filter(v => Math.abs(v) <= 0.5).length / Math.max(pmv_values.length, 1) * 100;

  // Heures de dépassement
  const overheating_h = Array.from(T_zone).filter(t => t > 28).length;
  const undercooling_h = Array.from(T_zone).filter(t => t < 17).length;

  return {
    T_zone, Q_heat, Q_cool, E_heat, E_cool, solar_gain, pmv: pmv_arr,
    EF_heat_kWh, EF_cool_kWh, EF_fans_kWh, EF_ecs_kWh, EF_total_kWh: EF_total,
    EP_m2, CO2_m2, cost_eur,
    pmv_mean, comfort_pct, overheating_h, undercooling_h,
  };
}
