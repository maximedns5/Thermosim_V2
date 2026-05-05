// Web Worker — simulation thermique dynamique
// Utilise Comlink pour interface propre
import { expose } from 'comlink';
import { solveSteady } from '../engine/solver/steady';
import { solveDynamic } from '../engine/solver/dynamic';
import type { BuildingConfig, SteadyResult, AnnualResult } from '../engine/types';

const api = {
  async runSteady(config: BuildingConfig): Promise<SteadyResult> {
    return solveSteady(config);
  },

  async runDynamic(
    config: BuildingConfig,
    onProgress: (pct: number) => void,
  ): Promise<AnnualResult> {
    return solveDynamic(config, onProgress);
  },
};

expose(api);
