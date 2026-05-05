// Store simulation — résultats mis en cache
import { create } from 'zustand';
import type { SteadyResult, AnnualResult } from '../engine/types';

interface SimulationStore {
  steadyResult: SteadyResult | null;
  annualResult: AnnualResult | null;
  progress: number;  // 0–1
  error: string | null;

  setSteadyResult: (r: SteadyResult) => void;
  setAnnualResult: (r: AnnualResult) => void;
  setProgress: (p: number) => void;
  setError: (e: string | null) => void;
  clearResults: () => void;
  clearAnnualResult: () => void;
}

export const useSimulationStore = create<SimulationStore>()((set) => ({
  steadyResult: null,
  annualResult: null,
  progress: 0,
  error: null,

  setSteadyResult: (r) => set({ steadyResult: r }),
  setAnnualResult: (r) => set({ annualResult: r }),
  setProgress: (p) => set({ progress: Math.max(0, Math.min(1, p)) }),
  setError: (e) => set({ error: e }),
  clearResults: () => set({ steadyResult: null, annualResult: null, progress: 0, error: null }),
  clearAnnualResult: () => set({ annualResult: null, progress: 0, error: null }),
}));
