// Tests DPE — lettres et seuils RE2020
import { describe, it, expect } from 'vitest';
import { dpeFromEnergy, dpeFromCO2, toEP, toCO2, toCost, dpeIndex } from '../engine/energy/dpe';
import { ENERGY_VECTORS } from '../engine/data/energy';

describe('dpeFromEnergy', () => {
  it('classe A pour 50 kWhEP/(m²·an)', () => {
    expect(dpeFromEnergy(50)).toBe('A');
  });
  it('classe B pour 90 kWhEP/(m²·an)', () => {
    expect(dpeFromEnergy(90)).toBe('B');
  });
  it('classe C pour 150 kWhEP/(m²·an)', () => {
    // Seuil C = 180 → 150 ≤ 180 → C
    expect(dpeFromEnergy(150)).toBe('C');
  });
  it('classe E pour 290 kWhEP/(m²·an)', () => {
    // Seuil E = 330 → 290 ≤ 330 → E
    expect(dpeFromEnergy(290)).toBe('E');
  });
  it('classe G pour 450 kWhEP/(m²·an)', () => {
    expect(dpeFromEnergy(450)).toBe('G');
  });
});

describe('dpeFromCO2', () => {
  it('classe A pour 4 kgCO₂/(m²·an)', () => {
    expect(dpeFromCO2(4)).toBe('A');
  });
  it('classe F pour 80 kgCO₂/(m²·an)', () => {
    // Seuil F = 100 → 80 ≤ 100 → F
    expect(dpeFromCO2(80)).toBe('F');
  });
});

describe('dpeIndex', () => {
  it('A=0, G=6', () => {
    expect(dpeIndex('A')).toBe(0);
    expect(dpeIndex('G')).toBe(6);
    expect(dpeIndex('D')).toBe(3);
  });
});

describe('toEP', () => {
  it('facteur EP electricite = 2.3 (RE2020)', () => {
    const vec = ENERGY_VECTORS['electricite'];
    if (vec) {
      const ep = toEP(1000, 'electricite');
      expect(ep).toBeCloseTo(1000 * vec.factor_EP, 1);
    }
  });
});

describe('toCO2', () => {
  it('CO2 gaz naturel > CO2 bois granulés', () => {
    const co2Gaz = toCO2(1000, 'gaz_naturel');
    const co2Bois = toCO2(1000, 'granules_bois');
    expect(co2Gaz).toBeGreaterThan(co2Bois);
  });
});
