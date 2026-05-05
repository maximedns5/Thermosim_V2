// API Comlink pour le Web Worker simulation
import { wrap } from 'comlink';
import type { Remote } from 'comlink';
import type { BuildingConfig, SteadyResult, AnnualResult } from '../engine/types';

interface SimWorkerAPI {
  runSteady(config: BuildingConfig): Promise<SteadyResult>;
  runDynamic(config: BuildingConfig, onProgress: (pct: number) => void): Promise<AnnualResult>;
}

let workerInstance: Worker | null = null;
let apiInstance: Remote<SimWorkerAPI> | null = null;

export function getSimWorker(): Remote<SimWorkerAPI> {
  if (!apiInstance) {
    workerInstance = new Worker(new URL('./simulation.worker.ts', import.meta.url), { type: 'module' });
    apiInstance = wrap<SimWorkerAPI>(workerInstance);
  }
  return apiInstance;
}

export function terminateSimWorker(): void {
  workerInstance?.terminate();
  workerInstance = null;
  apiInstance = null;
}
