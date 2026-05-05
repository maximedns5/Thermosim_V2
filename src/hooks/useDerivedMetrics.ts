// Métriques dérivées depuis le résultat stationnaire
import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { useBuildingStore } from '../store/buildingStore';
import { Wall } from '../engine/models/wall';
import { Window } from '../engine/models/window';
import { dpeIndex } from '../engine/energy/dpe';
import type { DpeLetter } from '../engine/types';

export interface DerivedMetrics {
  U_wall: number;
  R_wall: number;
  Uw_window: number;
  U_global: number;
  Q_design_W: number;
  EP_m2: number;
  CO2_m2: number;
  cost_eur: number;
  dpe: DpeLetter;
  dpe_index: number;  // 0-6
  wall_thickness_cm: number;
}

export function useDerivedMetrics(): DerivedMetrics {
  const config = useBuildingStore((s) => s.config);
  const steadyResult = useSimulationStore((s) => s.steadyResult);

  return useMemo(() => {
    const wall = new Wall(config.wallLayers, 1);
    const win = new Window(config.windows.glazingId, config.windows.frameId, 1);

    if (steadyResult) {
      return {
        U_wall: steadyResult.U_wall,
        R_wall: 1 / Math.max(steadyResult.U_wall, 0.001),
        Uw_window: steadyResult.U_window,
        U_global: steadyResult.U_global,
        Q_design_W: steadyResult.Q_design_W,
        EP_m2: steadyResult.EP_m2,
        CO2_m2: steadyResult.CO2_m2,
        cost_eur: steadyResult.cost_eur,
        dpe: steadyResult.dpe,
        dpe_index: dpeIndex(steadyResult.dpe),
        wall_thickness_cm: wall.thickness() * 100,
      };
    }

    // Fallback calculé directement
    const U_w = wall.U();
    const Uw = win.Uw();
    return {
      U_wall: U_w,
      R_wall: 1 / Math.max(U_w, 0.001),
      Uw_window: Uw,
      U_global: (U_w + Uw) / 2,
      Q_design_W: 0,
      EP_m2: 0,
      CO2_m2: 0,
      cost_eur: 0,
      dpe: 'D',
      dpe_index: 3,
      wall_thickness_cm: wall.thickness() * 100,
    };
  }, [config, steadyResult]);
}
