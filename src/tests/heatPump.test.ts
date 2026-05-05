// Tests HeatPump — modèle COP Carnot corrigé
import { describe, it, expect } from 'vitest';
import { HeatPump } from '../engine/models/heatPump';

// PAC air/eau nominale : COP 3.5 à 7°C source / 45°C départ
const hp = new HeatPump(3.5, 7, 45, -7, true);

describe('HeatPump', () => {
  it('COP nominal à conditions nominales ≈ COP_nominal', () => {
    const cop = hp.copAtConditions(7, 45);
    // Le modèle Carnot corrigé ± tolérance réaliste
    expect(cop).toBeGreaterThan(2.5);
    expect(cop).toBeLessThan(5.0);
  });

  it('COP diminue quand T_source baisse', () => {
    const copWarm = hp.copAtConditions(10, 45);
    const copCold = hp.copAtConditions(-10, 45);
    expect(copWarm).toBeGreaterThan(copCold);
  });

  it('COP diminue quand T_depart monte', () => {
    const copLow = hp.copAtConditions(7, 35);
    const copHigh = hp.copAtConditions(7, 55);
    expect(copLow).toBeGreaterThan(copHigh);
  });

  it('EER > 0 pour système réversible', () => {
    const eer = hp.EER(7, 45);
    expect(eer).toBeGreaterThan(0);
  });
});
