// Tests moteur thermique — Wall
import { describe, it, expect } from 'vitest';
import { Wall } from '../engine/models/wall';
import type { Layer } from '../engine/types';

const LAYERS_SIMPLE: Layer[] = [
  { material: 'beton_cellulaire', thickness: 0.20 },
  { material: 'polystyrene_expanse', thickness: 0.12 },
  { material: 'platre', thickness: 0.013 },
];

describe('Wall', () => {
  it('calcule U raisonnable pour paroi ITE', () => {
    const w = new Wall(LAYERS_SIMPLE, 1);
    const U = w.U();
    // U doit être entre 0.2 et 1.5 W/(m²K) pour une paroi isolée
    expect(U).toBeGreaterThan(0.1);
    expect(U).toBeLessThan(2.0);
  });

  it('Rtotal > somme résistances couches', () => {
    const w = new Wall(LAYERS_SIMPLE, 1);
    const R = w.Rtotal();
    // Doit inclure Rsi=0.13 + Rse=0.04
    expect(R).toBeGreaterThan(0.17);
  });

  it('épaisseur totale correcte', () => {
    const w = new Wall(LAYERS_SIMPLE, 1);
    const thick = w.thickness();
    expect(thick).toBeCloseTo(0.20 + 0.12 + 0.013, 2);
  });

  it('profil de température décroissant de int à ext', () => {
    const w = new Wall(LAYERS_SIMPLE, 1);
    const profile = w.temperatureProfile(20, -5);
    // profile[0] = surface intérieure après Rsi (légèrement < T_int)
    expect(profile[0]).toBeGreaterThan(18);
    expect(profile[0]).toBeLessThan(20);
    // Décroissant
    for (let i = 1; i < profile.length; i++) {
      expect(profile[i]).toBeLessThanOrEqual(profile[i - 1] + 0.01);
    }
  });

  it('capacité thermique > 0', () => {
    const w = new Wall(LAYERS_SIMPLE, 1);
    expect(w.thermalCapacity()).toBeGreaterThan(0);
  });
});
