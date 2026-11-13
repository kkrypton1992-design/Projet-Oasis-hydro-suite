import { describe, expect, it } from 'vitest';
import {
  calculateHydraulicBehavior,
  MATERIAL_STRICKLER_DEFAULTS,
  recommendOptimalStructure
} from '../../src/core/hydraulicEngine';
import { getDefaultSettings } from '../../src/core/projectEngine';
import { HydraulicStructure } from '../../src/types/oasis';

const baseSettings = getDefaultSettings();

describe('hydraulicEngine', () => {
  it('solves Manning-Strickler accurately for a Rectangular Box Culvert (round-trip Q check)', () => {
    const struct: HydraulicStructure = {
      id: 'oh-box',
      code: 'OH-BOX',
      pkMeters: 1000,
      name: 'Dalot Test',
      type: 'BOX_CULVERT',
      material: 'CONCRETE',
      stricklerK: MATERIAL_STRICKLER_DEFAULTS.CONCRETE,
      widthM: 2.5,
      heightM: 2.0,
      cellsCount: 1,
      lengthM: 20,
      bedSlopeMPerM: 0.01,
      watershedId: 'bv-1',
      designFlowM3s: 6.5,
      checkFlowM3s: 8.5,
      position: { lat: 43.6, lng: 1.5 }
    };

    const res = calculateHydraulicBehavior(struct, baseSettings);
    const yn = res.normalDepthM;
    const S = 2.5 * yn;
    const P = 2.5 + 2 * yn;
    const Rh = S / P;
    const qCheck = 70 * S * Math.pow(Rh, 2 / 3) * Math.sqrt(0.01);

    expect(qCheck).toBeCloseTo(6.5, 1);
    expect(res.flowVelocityMs).toBeGreaterThan(0.6);
    expect(res.fillingRatioPercent).toBeLessThan(100);
    expect(res.freeboardM).toBeCloseTo(2.0 - yn, 2);
  });

  it('solves Manning-Strickler accurately for a Circular Pipe (round-trip Q check)', () => {
    const struct: HydraulicStructure = {
      id: 'oh-pipe',
      code: 'OH-PIPE',
      pkMeters: 2000,
      name: 'Buse Test',
      type: 'CIRCULAR_PIPE',
      material: 'CONCRETE',
      stricklerK: 70,
      diameterM: 1.2,
      cellsCount: 1,
      lengthM: 20,
      bedSlopeMPerM: 0.012,
      watershedId: 'bv-1',
      designFlowM3s: 1.8,
      checkFlowM3s: 2.4,
      position: { lat: 43.6, lng: 1.5 }
    };

    const res = calculateHydraulicBehavior(struct, baseSettings);
    const D = 1.2;
    const theta = 2 * Math.acos((D - 2 * res.normalDepthM) / D);
    const S = (D * D * (theta - Math.sin(theta))) / 8;
    const P = (D / 2) * theta;
    const Rh = S / P;
    const qCheck = 70 * S * Math.pow(Rh, 2 / 3) * Math.sqrt(0.012);

    expect(qCheck).toBeCloseTo(1.8, 1);
    expect(res.fillingRatioPercent).toBeLessThan(80);
    expect(res.status).toBe('COMPLIANT');
  });

  it('solves trapezoidal ditch correctly and detects grassed earth erosion velocity', () => {
    const struct: HydraulicStructure = {
      id: 'oh-ditch',
      code: 'F-01',
      pkMeters: 3000,
      name: 'Fossé Test',
      type: 'DITCH',
      material: 'EARTH_GRASSED',
      stricklerK: 35,
      widthM: 0.6,
      heightM: 1.0,
      sideSlopeM: 1.5,
      cellsCount: 1,
      lengthM: 100,
      bedSlopeMPerM: 0.03,
      watershedId: 'bv-1',
      designFlowM3s: 3.0,
      checkFlowM3s: 4.0,
      position: { lat: 43.6, lng: 1.5 }
    };

    const res = calculateHydraulicBehavior(struct, baseSettings);
    expect(res.flowVelocityMs).toBeGreaterThan(baseSettings.maxVelocityEarth);
    expect(res.status).toBe('NON_COMPLIANT');
    expect(res.auditIssues.some((i) => i.includes('Vitesse excessive'))).toBe(true);
  });

  it('flags overflow when discharge exceeds full-flow capacity', () => {
    const struct: HydraulicStructure = {
      id: 'oh-over',
      code: 'OH-OVER',
      pkMeters: 4000,
      name: 'Buse Surchargée',
      type: 'CIRCULAR_PIPE',
      material: 'CONCRETE',
      stricklerK: 70,
      diameterM: 0.6,
      cellsCount: 1,
      lengthM: 15,
      bedSlopeMPerM: 0.004,
      watershedId: 'bv-1',
      designFlowM3s: 5.0,
      checkFlowM3s: 6.5,
      position: { lat: 43.6, lng: 1.5 }
    };

    const res = calculateHydraulicBehavior(struct, baseSettings);
    expect(res.fillingRatioPercent).toBeGreaterThan(100);
    expect(res.status).toBe('NON_COMPLIANT');
    expect(res.freeboardM).toBe(0);
  });

  it('respects zero-valued settings thresholds using nullish coalescing', () => {
    const struct: HydraulicStructure = {
      id: 'oh-zero',
      code: 'OH-Z',
      pkMeters: 500,
      name: 'Zero Thresholds',
      type: 'BOX_CULVERT',
      material: 'CONCRETE',
      stricklerK: 40,
      widthM: 3.0,
      heightM: 2.0,
      cellsCount: 1,
      lengthM: 15,
      bedSlopeMPerM: 0.0002,
      watershedId: 'bv-1',
      designFlowM3s: 0.3,
      checkFlowM3s: 0.4,
      position: { lat: 43.6, lng: 1.5 }
    };

    const customSettings = {
      ...baseSettings,
      minSelfCleaningVelocity: 0,
      minFreeboardM: 0
    };
    const res = calculateHydraulicBehavior(struct, customSettings);
    // Low velocity (< 0.6) should NOT warn when minSelfCleaningVelocity is explicitly 0
    expect(res.flowVelocityMs).toBeLessThan(0.6);
    expect(res.status).toBe('COMPLIANT');
  });

  it('recommendOptimalStructure returns a section satisfying filling, velocity and freeboard criteria', () => {
    const pipeRec = recommendOptimalStructure('CIRCULAR_PIPE', 2.2, 0.01, baseSettings);
    expect(pipeRec.recommendedDiameterM).toBeDefined();

    const verifiedPipe = calculateHydraulicBehavior(
      {
        id: 'verify-p',
        code: 'VP',
        pkMeters: 0,
        name: 'Verify',
        type: 'CIRCULAR_PIPE',
        material: 'CONCRETE',
        stricklerK: 70,
        diameterM: pipeRec.recommendedDiameterM,
        cellsCount: pipeRec.recommendedCells,
        lengthM: 15,
        bedSlopeMPerM: 0.01,
        watershedId: '',
        designFlowM3s: 2.2,
        checkFlowM3s: 2.8,
        position: { lat: 0, lng: 0 }
      },
      baseSettings
    );
    expect(verifiedPipe.fillingRatioPercent).toBeLessThanOrEqual(80);
    expect(verifiedPipe.freeboardM).toBeGreaterThanOrEqual(baseSettings.minFreeboardM);

    const boxRec = recommendOptimalStructure('BOX_CULVERT', 18.0, 0.012, baseSettings);
    expect(boxRec.recommendedWidthM).toBeDefined();
    expect(boxRec.recommendedHeightM).toBeDefined();

    const verifiedBox = calculateHydraulicBehavior(
      {
        id: 'verify-b',
        code: 'VB',
        pkMeters: 0,
        name: 'VerifyBox',
        type: 'BOX_CULVERT',
        material: 'CONCRETE',
        stricklerK: 70,
        widthM: boxRec.recommendedWidthM,
        heightM: boxRec.recommendedHeightM,
        cellsCount: boxRec.recommendedCells,
        lengthM: 15,
        bedSlopeMPerM: 0.012,
        watershedId: '',
        designFlowM3s: 18.0,
        checkFlowM3s: 22.0,
        position: { lat: 0, lng: 0 }
      },
      baseSettings
    );
    expect(verifiedBox.fillingRatioPercent).toBeLessThanOrEqual(80);
    expect(verifiedBox.freeboardM).toBeGreaterThanOrEqual(baseSettings.minFreeboardM);
  });
});
