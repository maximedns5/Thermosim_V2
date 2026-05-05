// Types fondamentaux du moteur thermique ThermoSim
// Sources : EN ISO 10456, RE2020, EN ISO 7730

export interface Material {
  id: string;
  name: string;
  lambda: number;    // W/(m·K) — EN ISO 10456
  rho: number;       // kg/m³
  cp: number;        // J/(kg·K)
  mu: number;        // facteur résistance vapeur (sans unité)
  eps: number;       // émissivité ondes longues
  alpha_sol: number; // absorption solaire
  category: 'structure' | 'maconnerie' | 'bois' | 'isolant' | 'isolant_bio'
          | 'finition' | 'etancheite' | 'divers';
}

export interface Layer {
  material: string;  // id dans MATERIALS_DB
  thickness: number; // m
}

export interface Glazing {
  id: string;
  name: string;
  Ug: number;        // W/(m²·K) — vitrage seul
  Uw: number;        // W/(m²·K) — avec cadre standard
  g: number;         // facteur solaire (SHGC)
  TL: number;        // transmission lumineuse
  glazingType: 'simple' | 'double' | 'triple';
}

export interface Frame {
  id: string;
  name: string;
  Uf: number;        // W/(m²·K) — EN ISO 10077
  material: 'alu' | 'alu_rupt' | 'pvc' | 'bois' | 'bois_alu';
}

export interface ShadingDevice {
  id: string;
  name: string;
  Fc?: number;                 // facteur de correction fixe
  position: 'interieur' | 'exterieur' | 'aucun';
  profondeur_m?: number;       // brise-soleil horizontal
  facteur_ombrage_ete?: number;
  facteur_ombrage_hiver?: number;
}

export interface ThermalBridgeSpec {
  id: string;
  name: string;
  psi: number;       // W/(m·K) — EN ISO 10211
}

export interface AirtightnessLevel {
  id: string;
  name: string;
  n50: number;       // renouvellements d'air/h à 50 Pa
  Q4: number;        // m³/(h·m²) à 4 Pa
  description: string;
}

export interface VMCSpec {
  id: string;
  name: string;
  recup: number;        // efficacité échangeur (0–1)
  conso_W_m3h: number;  // W par m³/h de débit
}

export type EnergyVector =
  | 'electricite'
  | 'gaz_naturel'
  | 'fioul_domestique'
  | 'granules_bois'
  | 'bois_buches'
  | 'reseau_chaleur'
  | 'solaire';

export interface HeatingSystem {
  id: string;
  name: string;
  energy_vector: EnergyVector;
  eta_generation: number;   // 0–1 ou COP nominal pour PAC
  eta_distribution: number;
  eta_emission: number;
  eta_regulation: number;
  COP_nominal?: number;
  T_source_nominale?: number;
  T_depart_nominale?: number;
  T_bivalence?: number;
  inverter?: boolean;
  category: 'combustion' | 'pac' | 'electrique_direct' | 'biomasse' | 'reseau' | 'solaire';
}

export interface CoolingSystem {
  id: string;
  name: string;
  EER_nominal: number;
  energy_vector: EnergyVector;
  T_source_nominale?: number;
}

export interface ECSSystem {
  id: string;
  name: string;
  energy_vector: EnergyVector;
  COP_or_eta: number;
}

export interface InternalGainsProfile {
  id: string;
  usage: 'logement' | 'bureau' | 'mixte';
  gains_W_m2_occupancy: number[];  // 24 valeurs horaires (lun-ven)
  gains_W_m2_weekend: number[];
  occupancy_fraction: number[];    // 24h lun-ven
}

export interface EnergyVectorSpec {
  id: EnergyVector;
  name: string;
  factor_EP: number;   // kWhEP / kWhEF — RE2020
  factor_CO2: number;  // kgCO2eq / kWhEF — ADEME base carbone
  price_EUR_kWh: number; // France 2024
}

export interface ClimateHourly {
  T_ext:      Float32Array;  // °C, 8760 valeurs
  T_dewpoint: Float32Array;  // °C
  RH:         Float32Array;  // %
  GHI:        Float32Array;  // W/m² rayonnement global horizontal
  DNI:        Float32Array;  // W/m² direct normal
  DHI:        Float32Array;  // W/m² diffus horizontal
  IR_sky:     Float32Array;  // W/m² infrarouge ciel
  windSpeed:  Float32Array;  // m/s
  windDir:    Float32Array;  // degrés
  nebulosity: Float32Array;  // 0–1
}

export interface ClimateDesign {
  T_ext_min: number;   // °C température extérieure de base (conception)
  T_ext_max: number;   // °C
  HDD: number;         // degrés-jours chauffage base 18°C
  CDD: number;         // degrés-jours refroidissement base 26°C
  zone: string;        // H1a, H1b, H2a, H2b, H2c, H2d, H3
  windSpeed: number;   // m/s moyen annuel
  albedo: number;
  lat: number;         // degrés N
  lon: number;         // degrés E
  altitude: number;    // m
  timezone: number;    // UTC offset (h)
}

export interface Climate {
  city: string;
  hourly: ClimateHourly;
  design: ClimateDesign;
}

export interface BuildingGeometry {
  nFloors: number;       // 1–20
  floorHeight: number;   // m, 2.40–3.50
  length: number;        // m N-S, 8–60
  width: number;         // m E-O, 5–30
  orientation: number;   // degrés (0 = façade principale au Sud)
}

export interface WindowSpec {
  glazingId: string;
  frameId: string;
  shadingId: string;
  ratioNorth: number;   // 0.05–0.80
  ratioSouth: number;
  ratioEast: number;
  ratioWest: number;
}

export interface RoofSpec {
  type: 'flat_concrete' | 'green' | 'inclined_tiles' | 'cool_roof';
  insulation: Layer;
}

export interface VentilationSpec {
  vmcId: string;
  n50: number;          // vol/h à 50 Pa (lié à étanchéité)
  q_v_hygienique: number; // m³/h total bâtiment
}

export interface HVACSpec {
  heatingId: string;
  coolingId: string | null;
  ecsId: string;
  T_set_heat: number;   // °C consigne chauffage
  T_set_cool: number;   // °C consigne clim
}

export interface TerrainSpec {
  climateCity: string;
  terrain: 'campagne' | 'suburbain' | 'urbain' | 'centre_ville';
  albedo: number;
  usage: 'logement' | 'bureau' | 'mixte';
}

export interface BuildingConfig {
  geometry: BuildingGeometry;
  wallLayers: Layer[];              // couches intérieur→extérieur
  insulationPosition: 'ITI' | 'ITE' | 'AUCUNE';
  windows: WindowSpec;
  roof: RoofSpec;
  ventilation: VentilationSpec;
  hvac: HVACSpec;
  terrain: TerrainSpec;
  climate?: Climate;
  internalGainsId?: string;         // clé dans INTERNAL_GAINS_PROFILES
}

export type DpeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface SteadyResult {
  U_wall: number;              // W/(m²·K)
  U_window: number;
  U_roof: number;
  U_floor: number;
  U_global: number;            // W/(m²·K) enveloppe globale
  Q_design_W: number;          // W déperditions totales conception
  Q_walls_W: number;
  Q_windows_W: number;
  Q_roof_W: number;
  Q_floor_W: number;
  Q_ventilation_W: number;
  needs_heating_kWh: number;   // kWh/an besoins bruts
  EF_total_kWh: number;        // kWh/an énergie finale
  EP_m2: number;               // kWhEP/(m²·an)
  CO2_m2: number;              // kgCO2eq/(m²·an)
  cost_eur: number;            // €/an
  dpe: DpeLetter;
}

export interface AnnualResult {
  // Séries horaires
  T_zone:     Float32Array;    // °C
  Q_heat:     Float32Array;    // W
  Q_cool:     Float32Array;    // W
  E_heat:     Float32Array;    // kWh/h électrique
  E_cool:     Float32Array;    // kWh/h électrique
  solar_gain: Float32Array;    // W apports solaires
  pmv:        Float32Array;    // PMV Fanger
  // Totaux annuels
  EF_heat_kWh: number;
  EF_cool_kWh: number;
  EF_fans_kWh: number;
  EF_ecs_kWh: number;
  EF_total_kWh: number;
  EP_m2: number;               // kWhEP/(m²·an)
  CO2_m2: number;              // kgCO2eq/(m²·an)
  cost_eur: number;            // €/an
  // Confort
  pmv_mean: number;
  comfort_pct: number;         // % heures PMV ∈ [-0.5, +0.5]
  overheating_h: number;       // h > 28°C
  undercooling_h: number;      // h < 17°C
}
