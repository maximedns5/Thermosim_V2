// Solveur stationnaire — pertes, besoins et DPE
// Sources : EN ISO 13790:2008, STD TH-BCE, RT2012

import { Wall } from '../models/wall';
import { Window } from '../models/window';
import { Ventilation } from '../models/ventilation';
import { HEATING_SYSTEMS, COOLING_SYSTEMS, ECS_SYSTEMS } from '../data/hvac';
import { dpeDouble, toEP, toCO2, toCost } from '../energy/dpe';
import type { BuildingConfig, SteadyResult } from '../types';

const HDD_BASE = 18; // °C base pour DJU/DJC

/** Degré-jours chauffage approx. depuis profil météo horaire */
function computeHDD(T_ext_arr: Float32Array, base = HDD_BASE): number {
  let sum = 0;
  for (let i = 0; i < T_ext_arr.length; i++) {
    sum += Math.max(0, base - T_ext_arr[i]);
  }
  return sum / 24; // °C·jours
}

export function solveSteady(config: BuildingConfig): SteadyResult {
  const { geometry, wallLayers, windows, roof, ventilation, hvac, terrain } = config;
  const totalHeight = geometry.floorHeight * geometry.nFloors;

  // -- Parois opaques --
  const wall = new Wall(wallLayers, 1);
  const U_wall = wall.U();
  // Gross facade areas per orientation (N+S = length face, E+W = width face)
  const A_facade_NS = geometry.length * totalHeight; // one N or S face
  const A_facade_EW = geometry.width  * totalHeight; // one E or W face
  const A_win_total =
    (windows.ratioNorth + windows.ratioSouth) * A_facade_NS +
    (windows.ratioEast  + windows.ratioWest)  * A_facade_EW;
  const A_walls_total =
    2 * A_facade_NS + 2 * A_facade_EW - A_win_total;

  // -- Fenêtres --
  const win = new Window(windows.glazingId, windows.frameId, 1.0);

  // -- Toiture --
  const A_roof = geometry.length * geometry.width;
  const U_roof = roof.insulation
    ? 1 / (0.10 + roof.insulation.thickness / 0.032 + 0.04)
    : 0.8;

  // -- Plancher bas (simplified : demi-résistance) --
  const A_floor = A_roof;
  const U_floor = 0.3; // W/(m²·K) valeur par défaut

  // -- Ventilation --
  const volume = geometry.length * geometry.width * totalHeight;
  const vent = new Ventilation(ventilation.vmcId, ventilation.n50, volume, ventilation.q_v_hygienique);

  // Température de conception (déperditions)
  const T_int = hvac.T_set_heat;
  const T_ext_design = config.climate?.design?.T_ext_min ?? -7; // °C

  const dT = T_int - T_ext_design;

  const Q_walls  = U_wall  * A_walls_total * dT;
  const Q_win    = win.Uw() * A_win_total  * dT;
  const Q_roof   = U_roof  * A_roof        * dT;
  const Q_floor  = U_floor * A_floor       * dT;
  const Q_vent   = vent.totalLoss(T_int, T_ext_design, config.climate?.design?.windSpeed ?? 3.0);
  const Q_total  = Q_walls + Q_win + Q_roof + Q_floor + Q_vent;

  // U global du bâtiment (W/(m²·K))
  const A_envelope = A_walls_total + A_win_total + A_roof + A_floor;
  const U_bldg = Q_total / (A_envelope * dT);

  // -- Besoins annuels (approx. DJU) --
  const T_arr = config.climate?.hourly?.T_ext;
  const HDD = T_arr ? computeHDD(T_arr) : 2500;
  // H = coefficients de pertes (W/K) = Q_total / dT
  // Besoins annuels = H × HDD × 24 h / 1000 kWh
  const needs_heating_kWh = (Q_total / dT) * HDD * 24 / 1000; // kWh/an brut

  // Efficacité chauffage
  const heatingSystem = HEATING_SYSTEMS[hvac.heatingId];
  const eta_heat = heatingSystem?.eta_generation ?? 0.9;
  const EF_heating = needs_heating_kWh / eta_heat;

  // ECS approximation (EN 15316) — surface totale chauffée
  const A_total_heated = A_floor * geometry.nFloors;
  const EF_ecs = 35 * A_total_heated / (ECS_SYSTEMS[hvac.ecsId]?.COP_or_eta ?? 0.9);

  const EF_total = EF_heating + EF_ecs;
  const EP_total = toEP(EF_total, heatingSystem?.energy_vector ?? 'gaz_naturel');
  const CO2_total = toCO2(EF_total, heatingSystem?.energy_vector ?? 'gaz_naturel');
  const cost_total = toCost(EF_total, heatingSystem?.energy_vector ?? 'gaz_naturel');

  const EP_m2 = EP_total / A_total_heated;
  const CO2_m2 = CO2_total / A_total_heated;
  const dpe = dpeDouble(EP_m2, CO2_m2);

  return {
    U_wall,
    U_window: win.Uw(),
    U_roof,
    U_floor,
    U_global: U_bldg,
    Q_design_W: Q_total,
    Q_walls_W: Q_walls,
    Q_windows_W: Q_win,
    Q_roof_W: Q_roof,
    Q_floor_W: Q_floor,
    Q_ventilation_W: Q_vent,
    needs_heating_kWh,
    EF_total_kWh: EF_total,
    EP_m2,
    CO2_m2,
    cost_eur: cost_total,
    dpe,
  };
}
