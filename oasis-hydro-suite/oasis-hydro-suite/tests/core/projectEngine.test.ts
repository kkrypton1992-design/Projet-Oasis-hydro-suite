import { describe, expect, it } from 'vitest';
import { computeProjectKpis, runEngineeringAudit } from '../../src/core/auditEngine';
import { createNewBlankProject, recalculateEntireProject } from '../../src/core/projectEngine';
import { DEFAULT_REAL_PROJECT } from '../../src/data/referenceProject';

describe('projectEngine & auditEngine', () => {
  it('propagates watershed parameter edits end-to-end into linked structure flows and hydraulic results', () => {
    const base = recalculateEntireProject(DEFAULT_REAL_PROJECT);
    const initialFlow = base.structures[0].designFlowM3s;

    // Double watershed bv-01 area
    const modified = {
      ...base,
      watersheds: base.watersheds.map((w) =>
        w.id === 'bv-01' ? { ...w, areaKm2: w.areaKm2 * 2 } : w
      )
    };
    const recalculated = recalculateEntireProject(modified);
    const updatedWs = recalculated.watersheds.find((w) => w.id === 'bv-01');
    const linkedStruct = recalculated.structures.find((s) => s.watershedId === 'bv-01');

    expect(updatedWs?.calculatedFlows?.q25).toBeGreaterThan(initialFlow);
    expect(linkedStruct?.designFlowM3s).toBe(updatedWs?.calculatedFlows?.q25);
    expect(linkedStruct?.results?.normalDepthM).toBeGreaterThan(
      base.structures[0].results?.normalDepthM ?? 0
    );
  });

  it('uses Q100 when returnPeriodDesignYears is set to 100 (fixed previous fallback bug)', () => {
    const q100Project = recalculateEntireProject({
      ...DEFAULT_REAL_PROJECT,
      settings: {
        ...DEFAULT_REAL_PROJECT.settings,
        returnPeriodDesignYears: 100
      }
    });

    const ws1 = q100Project.watersheds.find((w) => w.id === 'bv-01');
    const st1 = q100Project.structures.find((s) => s.watershedId === 'bv-01');
    expect(st1?.designFlowM3s).toBe(ws1?.calculatedFlows?.q100);
    expect(st1?.designFlowM3s).not.toBe(ws1?.calculatedFlows?.q10);
  });

  it('creates an empty valid blank project', () => {
    const blank = createNewBlankProject('PRJ-TEST', 'Étude Vide');
    expect(blank.code).toBe('PRJ-TEST');
    expect(blank.watersheds).toEqual([]);
    expect(blank.structures).toEqual([]);
    expect(blank.settings.montanaParams.length).toBeGreaterThanOrEqual(4);
  });

  it('computes accurate KPIs and deterministic engineering audit summaries', () => {
    const recalculated = recalculateEntireProject(DEFAULT_REAL_PROJECT);
    const kpis = computeProjectKpis(recalculated);
    expect(kpis.totalStructures).toBe(recalculated.structures.length);
    expect(kpis.totalWatersheds).toBe(recalculated.watersheds.length);
    expect(kpis.compliantCount + kpis.warningCount + kpis.nonCompliantCount).toBe(
      kpis.totalStructures
    );

    const speedAudit = runEngineeringAudit(recalculated, 'vitesse');
    expect(speedAudit.length).toBeGreaterThan(20);

    const tcAudit = runEngineeringAudit(recalculated, 'kirpich');
    expect(tcAudit).toContain('BV-01');
  });
});
