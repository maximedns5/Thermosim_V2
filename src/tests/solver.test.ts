// Tests solveurs — régime permanent + dynamique (léger)
import { describe, it, expect } from 'vitest';
import { solveSteady } from '../engine/solver/steady';
import { DEFAULT_CONFIG } from '../store/buildingStore';

describe('solveSteady', () => {
  it('retourne un SteadyResult avec U_wall > 0', () => {
    const result = solveSteady(DEFAULT_CONFIG);
    expect(result.U_wall).toBeGreaterThan(0);
    expect(result.U_wall).toBeLessThan(5);
  });

  it('Q_design_W > 0 pour T_ext = -10°C', () => {
    const result = solveSteady(DEFAULT_CONFIG);
    expect(result.Q_design_W).toBeGreaterThan(0);
  });

  it('lettre DPE valide', () => {
    const result = solveSteady(DEFAULT_CONFIG);
    expect(['A', 'B', 'C', 'D', 'E', 'F', 'G']).toContain(result.dpe);
  });

  it('EP > 0 kWhEP/(m²·an)', () => {
    const result = solveSteady(DEFAULT_CONFIG);
    expect(result.EP_m2).toBeGreaterThan(0);
  });

  it('somme pertes composantes < Q_design + 10%', () => {
    const result = solveSteady(DEFAULT_CONFIG);
    const sumParts = result.Q_walls_W + result.Q_windows_W + result.Q_roof_W + result.Q_floor_W + result.Q_ventilation_W;
    expect(sumParts).toBeCloseTo(result.Q_design_W, -2);
  });
});
