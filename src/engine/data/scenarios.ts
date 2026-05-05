// Scénarios préchargés pour ThermoSim
// Chaque scénario représente une configuration bâtiment typique

import type { BuildingConfig } from '../types';

export interface ScenarioDefinition {
  id: string;
  name: string;
  hint: string;
  config: Partial<BuildingConfig>;
}

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  passoire_energetique: {
    id: 'passoire_energetique',
    name: 'Energy sieve',
    hint: '60s-70s, electric heaters',
    config: {
      wallLayers: [
        { material: 'enduit_platre', thickness: 0.015 },
        { material: 'beton_arme',    thickness: 0.200 },
        { material: 'enduit_ciment', thickness: 0.020 },
      ],
      insulationPosition: 'AUCUNE',
      windows: {
        glazingId: 'simple_4mm',
        frameId: 'alu_standard',
        shadingId: 'aucun',
        ratioNorth: 0.15,
        ratioSouth: 0.30,
        ratioEast:  0.15,
        ratioWest:  0.15,
      },
      roof: {
        type: 'flat_concrete',
        insulation: { material: 'polystyrene_expanse', thickness: 0.040 },
      },
      ventilation: {
        vmcId: 'aucune',
        n50: 15.0,
        q_v_hygienique: 0,
      },
      hvac: {
        heatingId: 'convecteurs_electriques',
        coolingId: null,
        ecsId: 'ballon_electrique',
        T_set_heat: 20,
        T_set_cool: 28,
      },
    },
  },

  renovation_basique: {
    id: 'renovation_basique',
    name: 'Basic renovation',
    hint: 'ITI 80 mm + double glazing',
    config: {
      wallLayers: [
        { material: 'plaque_platre_ba13',  thickness: 0.013 },
        { material: 'laine_de_verre_32',   thickness: 0.080 },
        { material: 'beton_arme',          thickness: 0.200 },
        { material: 'enduit_ciment',       thickness: 0.020 },
      ],
      insulationPosition: 'ITI',
      windows: {
        glazingId: 'double_4_16_4_air',
        frameId: 'pvc_2rail',
        shadingId: 'aucun',
        ratioNorth: 0.18,
        ratioSouth: 0.38,
        ratioEast:  0.18,
        ratioWest:  0.18,
      },
      roof: {
        type: 'flat_concrete',
        insulation: { material: 'polystyrene_expanse', thickness: 0.100 },
      },
      ventilation: {
        vmcId: 'vmc_sf_a',
        n50: 5.0,
        q_v_hygienique: 200,
      },
      hvac: {
        heatingId: 'chaudiere_gaz_basse_temp',
        coolingId: null,
        ecsId: 'gaz_instantane',
        T_set_heat: 20,
        T_set_cool: 28,
      },
    },
  },

  renovation_performante: {
    id: 'renovation_performante',
    name: 'High-performance renovation',
    hint: 'ITE 160 mm + low-e argon + HP',
    config: {
      wallLayers: [
        { material: 'enduit_platre',       thickness: 0.015 },
        { material: 'beton_arme',          thickness: 0.200 },
        { material: 'laine_de_roche_34',   thickness: 0.160 },
        { material: 'enduit_ciment',       thickness: 0.010 },
      ],
      insulationPosition: 'ITE',
      windows: {
        glazingId: 'double_be_argon',
        frameId: 'pvc_3rail',
        shadingId: 'store_ext_clair',
        ratioNorth: 0.20,
        ratioSouth: 0.45,
        ratioEast:  0.20,
        ratioWest:  0.20,
      },
      roof: {
        type: 'flat_concrete',
        insulation: { material: 'laine_de_roche_36', thickness: 0.200 },
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
    },
  },

  passif: {
    id: 'passif',
    name: 'Passive house',
    hint: 'ITE 300 mm + triple low-e + geo HP',
    config: {
      wallLayers: [
        { material: 'plaque_platre_ba13',  thickness: 0.013 },
        { material: 'beton_arme',          thickness: 0.200 },
        { material: 'polystyrene_expanse', thickness: 0.300 },
        { material: 'enduit_ciment',       thickness: 0.010 },
      ],
      insulationPosition: 'ITE',
      windows: {
        glazingId: 'triple_be_argon',
        frameId: 'bois_alu',
        shadingId: 'brise_soleil_h_1_0',
        ratioNorth: 0.15,
        ratioSouth: 0.55,
        ratioEast:  0.15,
        ratioWest:  0.15,
      },
      roof: {
        type: 'green',
        insulation: { material: 'polyurethane', thickness: 0.300 },
      },
      ventilation: {
        vmcId: 'vmc_df_passif',
        n50: 0.6,
        q_v_hygienique: 350,
      },
      hvac: {
        heatingId: 'pac_geothermique',
        coolingId: null,
        ecsId: 'chauffe_eau_thermo',
        T_set_heat: 20,
        T_set_cool: 26,
      },
    },
  },

  tout_gaz_condensation: {
    id: 'tout_gaz_condensation',
    name: 'All-gas condensation',
    hint: 'New build RT2012 condensing gas',
    config: {
      wallLayers: [
        { material: 'plaque_platre_ba13',  thickness: 0.013 },
        { material: 'laine_de_verre_32',   thickness: 0.120 },
        { material: 'beton_arme',          thickness: 0.200 },
        { material: 'enduit_ciment',       thickness: 0.010 },
      ],
      insulationPosition: 'ITI',
      windows: {
        glazingId: 'double_be_argon',
        frameId: 'pvc_3rail',
        shadingId: 'aucun',
        ratioNorth: 0.20,
        ratioSouth: 0.40,
        ratioEast:  0.20,
        ratioWest:  0.20,
      },
      roof: {
        type: 'flat_concrete',
        insulation: { material: 'polystyrene_expanse', thickness: 0.180 },
      },
      ventilation: {
        vmcId: 'vmc_sf_b',
        n50: 3.0,
        q_v_hygienique: 250,
      },
      hvac: {
        heatingId: 'chaudiere_gaz_condensation',
        coolingId: null,
        ecsId: 'gaz_condensation',
        T_set_heat: 20,
        T_set_cool: 28,
      },
    },
  },
};
