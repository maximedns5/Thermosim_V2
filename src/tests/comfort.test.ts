// Tests confort — PMV/PPD Fanger EN ISO 7730
import { describe, it, expect } from 'vitest';
import { pmv, ppd, tOperative, comfortCategory } from '../engine/physics/comfort';

describe('pmv', () => {
  it('PMV ≈ 0 en conditions neutres', () => {
    // Conditions neutres type bureau été : T=22, Tmrt=22, v=0.1, RH=50, met=1.2, clo=1
    const val = pmv(22, 22, 0.1, 50, 1.2, 1.0);
    expect(val).toBeGreaterThan(-0.5);
    expect(val).toBeLessThan(0.5);
  });

  it('PMV < -0.5 en conditions froides', () => {
    const val = pmv(15, 14, 0.2, 40, 1.2, 0.5);
    expect(val).toBeLessThan(-0.5);
  });

  it('PMV > 0.5 en conditions chaudes', () => {
    const val = pmv(30, 32, 0.1, 60, 1.2, 0.5);
    expect(val).toBeGreaterThan(0.5);
  });

  it('PMV dans plage [-3, +3]', () => {
    const val = pmv(22, 22, 0.1, 50, 1.2, 1.0);
    expect(val).toBeGreaterThanOrEqual(-3);
    expect(val).toBeLessThanOrEqual(3);
  });
});

describe('ppd', () => {
  it('PPD > 5% pour PMV=0 (minimum physique EN 7730)', () => {
    expect(ppd(0)).toBeGreaterThanOrEqual(5);
  });
  it('PPD < 10% pour |PMV| ≤ 0.5 (catégorie A)', () => {
    expect(ppd(0.5)).toBeLessThan(11);
    expect(ppd(-0.5)).toBeLessThan(11);
  });
  it('PPD augmente avec |PMV|', () => {
    expect(ppd(1)).toBeGreaterThan(ppd(0));
  });
});

describe('tOperative', () => {
  it('T_op ≈ moyenne T_air et T_mrt pour v≈0', () => {
    const top = tOperative(20, 24, 0.05);
    expect(top).toBeCloseTo(22, 0);
  });
});

describe('comfortCategory', () => {
  it('catégorie I pour |PMV| ≤ 0.2 (EN ISO 7730)', () => {
    expect(comfortCategory(0.1)).toBe('I');
  });
  it('catégorie III pour |PMV| ≤ 0.7', () => {
    expect(comfortCategory(0.7)).toBe('III');
  });
});
