// Store principal — configuration du bâtiment
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { BuildingConfig } from '../engine/types';
import type { ScenarioDefinition } from '../engine/data/scenarios';
import { loadClimate } from '../utils/loadClimate';

const DEFAULT_CONFIG: BuildingConfig = {
  geometry: {
    nFloors: 1,
    floorHeight: 2.70,
    length: 12,
    width: 8,
    orientation: 0,
  },
  wallLayers: [
    { material: 'enduit_platre',     thickness: 0.015 },
    { material: 'beton_arme',        thickness: 0.200 },
    { material: 'laine_de_verre_32', thickness: 0.100 },
    { material: 'enduit_ciment',     thickness: 0.015 },
  ],
  insulationPosition: 'ITI',
  windows: {
    glazingId: 'double_be_argon',
    frameId: 'pvc_3rail',
    shadingId: 'aucun',
    ratioNorth: 0.15,
    ratioSouth: 0.40,
    ratioEast: 0.15,
    ratioWest: 0.15,
  },
  roof: {
    type: 'flat_concrete',
    insulation: { material: 'polystyrene_expanse', thickness: 0.160 },
  },
  ventilation: {
    vmcId: 'vmc_df_haut_rdt',
    n50: 1.5,
    q_v_hygienique: 300,
  },
  hvac: {
    heatingId: 'pac_air_eau_inverter',
    coolingId: 'clim_reversible',
    ecsId: 'chauffe_eau_thermo',
    T_set_heat: 20,
    T_set_cool: 26,
  },
  terrain: {
    climateCity: 'paris',
    terrain: 'suburbain',
    albedo: 0.20,
    usage: 'logement',
  },
  internalGainsId: 'logement',
};

interface BuildingStore {
  config: BuildingConfig;
  setConfig: (config: BuildingConfig) => void;
  updateGeometry: (patch: Partial<BuildingConfig['geometry']>) => void;
  updateWindows: (patch: Partial<BuildingConfig['windows']>) => void;
  updateRoof: (patch: Partial<BuildingConfig['roof']>) => void;
  updateVentilation: (patch: Partial<BuildingConfig['ventilation']>) => void;
  updateHvac: (patch: Partial<BuildingConfig['hvac']>) => void;
  updateTerrain: (patch: Partial<BuildingConfig['terrain']>) => void;
  setWallLayers: (layers: BuildingConfig['wallLayers']) => void;
  applyScenario: (scenario: ScenarioDefinition) => void;
  loadClimateData: (city: string) => Promise<void>;
  reset: () => void;
}

export const useBuildingStore = create<BuildingStore>()(
  immer((set) => ({
    config: DEFAULT_CONFIG,

    setConfig: (config) => set((s) => { s.config = config; }),

    updateGeometry: (patch) =>
      set((s) => { Object.assign(s.config.geometry, patch); }),

    updateWindows: (patch) =>
      set((s) => { Object.assign(s.config.windows, patch); }),

    updateRoof: (patch) =>
      set((s) => { Object.assign(s.config.roof, patch); }),

    updateVentilation: (patch) =>
      set((s) => { Object.assign(s.config.ventilation, patch); }),

    updateHvac: (patch) =>
      set((s) => { Object.assign(s.config.hvac, patch); }),

    updateTerrain: (patch) =>
      set((s) => { Object.assign(s.config.terrain, patch); }),

    setWallLayers: (layers) =>
      set((s) => { s.config.wallLayers = layers; }),

    applyScenario: (scenario) =>
      set((s) => {
        Object.assign(s.config, scenario.config);
      }),

    loadClimateData: async (city) => {
      const climate = await loadClimate(city);
      set((s) => { s.config.climate = climate; });
    },

    reset: () => set((s) => { s.config = DEFAULT_CONFIG; }),
  })),
);

export { DEFAULT_CONFIG };
