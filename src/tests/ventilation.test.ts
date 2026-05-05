// Tests Ventilation
import { describe, it, expect } from 'vitest';
import { Ventilation } from '../engine/models/ventilation';

const VMC_ID = 'vmc_df_standard';
const N50 = 1.0;
const Q_HYG = 150;
const VOLUME = 250;

describe('Ventilation', () => {
  it('débit infiltration positif', () => {
    const v = new Ventilation(VMC_ID, N50, VOLUME, Q_HYG);
    const flow = v.infiltrationFlow(3);
    expect(flow).toBeGreaterThanOrEqual(0);
  });

  it('pertes mécaniques positives si VMC actif', () => {
    const v = new Ventilation(VMC_ID, N50, VOLUME, Q_HYG);
    const loss = v.mechanicalLoss(20, 0);
    expect(loss).toBeGreaterThan(0);
  });

  it('n50 élevé = plus d\'infiltrations', () => {
    const vLeaky = new Ventilation(VMC_ID, 10, VOLUME, Q_HYG);
    const vTight = new Ventilation(VMC_ID, 0.6, VOLUME, Q_HYG);
    expect(vLeaky.infiltrationFlow(4)).toBeGreaterThan(vTight.infiltrationFlow(4));
  });

  it('consommation ventilateur > 0 pour VMC double flux', () => {
    const v = new Ventilation(VMC_ID, N50, VOLUME, Q_HYG);
    expect(v.fanConsumption()).toBeGreaterThan(0);
  });
});
