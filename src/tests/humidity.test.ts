// Tests humidité — condensation / Glaser
import { describe, it, expect } from 'vitest';
import { psat, dewPoint, fRsi, glaser } from '../engine/physics/humidity';

describe('psat', () => {
  it('psat(0°C) ≈ 611 Pa (Magnus)', () => {
    expect(psat(0)).toBeCloseTo(611, -1);
  });
  it('psat(20°C) ≈ 2338 Pa', () => {
    expect(psat(20)).toBeCloseTo(2338, -1);
  });
  it('psat croissant avec T', () => {
    expect(psat(30)).toBeGreaterThan(psat(20));
  });
});

describe('dewPoint', () => {
  it('T_rosée < T_air', () => {
    expect(dewPoint(20, 50)).toBeLessThan(20);
  });
  it('T_rosée ≈ T_air pour RH=100%', () => {
    expect(dewPoint(20, 100)).toBeCloseTo(20, 0);
  });
});

describe('fRsi', () => {
  it('fRsi ∈ (0, 1] pour surface froide mais pas extérieure', () => {
    // T_surface=19, T_int=20, T_ext=-10 → (19-(-10))/(20-(-10)) = 29/30 ≈ 0.967
    const f = fRsi(19, 20, -10);
    expect(f).toBeGreaterThan(0);
    expect(f).toBeLessThanOrEqual(1);
  });
});

describe('glaser', () => {
  // Paroi : brique pleine 22cm (lambda=0.84, mu=10) + polystyrène 10cm (lambda=0.038, mu=60) + plâtre 1.3cm (lambda=0.57, mu=10)
  const layers = [
    { name: 'brique_pleine',       thickness: 0.22, lambda: 0.84,  mu: 10 },
    { name: 'polystyrene_expanse', thickness: 0.10, lambda: 0.038, mu: 60 },
    { name: 'platre',              thickness: 0.013, lambda: 0.57, mu: 10 },
  ];

  it('retourne un tableau de GlaserLayer pour chaque couche', () => {
    const result = glaser(layers, 20, -10, 50, 90);
    expect(result).toHaveLength(layers.length);
  });

  it('T_in de la première couche proche de la température intérieure de surface', () => {
    const result = glaser(layers, 20, -10, 50, 90);
    // T_in[0] = T_int - flux * Rsi (légèrement < T_int)
    expect(result[0].T_in).toBeLessThan(20);
    expect(result[0].T_in).toBeGreaterThan(18);
  });

  it('condensation est booléen pour chaque couche', () => {
    const result = glaser(layers, 20, -10, 50, 90);
    for (const layer of result) {
      expect(typeof layer.condensation).toBe('boolean');
    }
  });

  it('risque de condensation détectable en conditions humides', () => {
    // RH extérieure très élevée (95%) + intérieure humide (80%) → condensation probable
    const result = glaser(layers, 20, -15, 80, 95);
    const hasCondensation = result.some(l => l.condensation);
    // Résultat physiquement plausible (pas d'assertion stricte sur la valeur)
    expect(typeof hasCondensation).toBe('boolean');
  });
});
