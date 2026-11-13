import { describe, expect, it } from 'vitest';
import {
  calculateRainfallIntensity,
  calculateRationalFlows,
  calculateTimeOfConcentration,
  computeSlopePercent
} from '../../src/core/hydrologyEngine';
import { DEFAULT_REAL_PROJECT } from '../../src/data/referenceProject';
import { Watershed } from '../../src/types/oasis';

describe('hydrologyEngine', () => {
  it('computes Kirpich, Passini, Giandotti and Bransby-Williams Tc with physical bounds', () => {
    const res = calculateTimeOfConcentration(2.4, 2.8, 84);
    expect(res.recommendedMethod).toBe('KIRPICH');
    expect(res.kirpichMin).toBeGreaterThanOrEqual(5);
    expect(res.passiniMin).toBeGreaterThanOrEqual(5);
    expect(res.giandottiMin).toBeGreaterThanOrEqual(5);
    expect(res.bransbyWilliamsMin).toBeGreaterThanOrEqual(5);
    expect(res.recommendedMin).toBe(res.kirpichMin);
  });

  it('selects PASSINI for medium watersheds (3..10 km²) and GIANDOTTI for large (>10 km²)', () => {
    const med = calculateTimeOfConcentration(6.0, 4.5, 90);
    expect(med.recommendedMethod).toBe('PASSINI');
    expect(med.recommendedMin).toBe(med.passiniMin);

    const large = calculateTimeOfConcentration(18.0, 8.0, 120);
    expect(large.recommendedMethod).toBe('GIANDOTTI');
    expect(large.recommendedMin).toBe(large.giandottiMin);
  });

  it('respects physical monotonicity: steeper slope yields shorter Kirpich Tc', () => {
    const gentleSlope = calculateTimeOfConcentration(2.0, 2.5, 20);
    const steepSlope = calculateTimeOfConcentration(2.0, 2.5, 120);
    expect(steepSlope.kirpichMin).toBeLessThan(gentleSlope.kirpichMin);
  });

  it('computes Montana IDF intensity I(t) = a * t^(-b) and clamps non-finite/tiny inputs', () => {
    // 10 * 25^(-0.5) = 10 / 5 = 2.0
    expect(calculateRainfallIntensity(25, 10, 0.5)).toBe(2);
    // Tc < 5 clamps to 5: 100 * 5^(-0.5) ~ 44.72
    expect(calculateRainfallIntensity(1, 100, 0.5)).toBeCloseTo(44.72, 2);
    expect(calculateRainfallIntensity(Number.NaN, 100, 0.5)).toBeCloseTo(44.72, 2);
  });

  it('computes consistent Q10 < Q25 < Q50 < Q100 via Rational method and clamps explicitTcMin >= 5', () => {
    const ws: Watershed = {
      id: 'ws-test',
      code: 'BV-T',
      name: 'Test Catchment',
      areaKm2: 2.0,
      lengthKm: 2.0,
      deltaH: 60,
      slopePercent: 3.0,
      runoffCoefficient: 0.65,
      soilType: 'Limon',
      vegetation: 'Mixte',
      color: '#00A3E0',
      coordinates: []
    };

    const res = calculateRationalFlows(ws, DEFAULT_REAL_PROJECT.settings.montanaParams, 2);
    expect(res.tcMin).toBe(5);
    expect(res.flowsM3s.q10).toBeLessThan(res.flowsM3s.q25);
    expect(res.flowsM3s.q25).toBeLessThan(res.flowsM3s.q50);
    expect(res.flowsM3s.q50).toBeLessThan(res.flowsM3s.q100);

    // Verify Q = C * I * A / 3.6
    const expectedQ25 = Number(((0.65 * res.intensityMmH.t25 * 2.0) / 3.6).toFixed(3));
    expect(res.flowsM3s.q25).toBe(expectedQ25);
  });

  it('computes slopePercent safely', () => {
    expect(computeSlopePercent(45, 1.5)).toBe(3);
    expect(computeSlopePercent(10, 0)).toBe(100);
  });
});
