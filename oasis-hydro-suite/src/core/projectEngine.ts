/**
 * OASIS HYDRO SUITE — Moteur d'Orchestration Projet (Domaine Pur)
 * Recalcul déterministe complet de la chaîne Hydrologie -> Hydraulique -> Audit
 * Sans aucune dépendance navigateur (localStorage/DOM) ni base de données.
 */

import { DEFAULT_REAL_PROJECT } from '../data/referenceProject';
import { Project, ProjectSettings, Watershed } from '../types/oasis';
import { calculateHydraulicBehavior } from './hydraulicEngine';
import {
  calculateRationalFlows,
  calculateTimeOfConcentration,
  computeSlopePercent
} from './hydrologyEngine';

export function getDesignFlowForPeriod(
  flows: NonNullable<Watershed['calculatedFlows']>,
  returnPeriodYears: number
): number {
  switch (returnPeriodYears) {
    case 10:
      return flows.q10;
    case 25:
      return flows.q25;
    case 50:
      return flows.q50;
    case 100:
      return flows.q100;
    default:
      return flows.q25;
  }
}

export function getCheckFlowForPeriod(
  flows: NonNullable<Watershed['calculatedFlows']>,
  checkPeriodYears: number
): number {
  switch (checkPeriodYears) {
    case 10:
      return flows.q10;
    case 25:
      return flows.q25;
    case 50:
      return flows.q50;
    case 100:
    default:
      return flows.q100;
  }
}

export function getDefaultSettings(): ProjectSettings {
  return {
    ...DEFAULT_REAL_PROJECT.settings,
    montanaParams: DEFAULT_REAL_PROJECT.settings.montanaParams.map((p) => ({ ...p }))
  };
}

/**
 * Calcul et synchronisation complète des résultats physiques sur tous les bassins et ouvrages.
 */
export function recalculateEntireProject(project: Project): Project {
  const watershedsList = Array.isArray(project.watersheds) ? project.watersheds : [];
  const structuresList = Array.isArray(project.structures) ? project.structures : [];
  const settings: ProjectSettings = project.settings || getDefaultSettings();
  const montanaParams =
    Array.isArray(settings.montanaParams) && settings.montanaParams.length > 0
      ? settings.montanaParams
      : DEFAULT_REAL_PROJECT.settings.montanaParams;

  // 1. Recalcul hydrologique cohérent sur chaque bassin versant
  const updatedWatersheds = watershedsList.map((ws) => {
    const derivedSlopePercent = computeSlopePercent(ws.deltaH, ws.lengthKm);
    const tcComp = calculateTimeOfConcentration(ws.areaKm2, ws.lengthKm, ws.deltaH);
    const chosenMethod = ws.calculatedTc?.chosenMethod || tcComp.recommendedMethod;
    const chosenValue =
      chosenMethod === 'KIRPICH'
        ? tcComp.kirpichMin
        : chosenMethod === 'PASSINI'
          ? tcComp.passiniMin
          : chosenMethod === 'GIANDOTTI'
            ? tcComp.giandottiMin
            : tcComp.bransbyWilliamsMin;

    const flows = calculateRationalFlows(ws, montanaParams, chosenValue);
    const designIntensity =
      settings.returnPeriodDesignYears === 10
        ? flows.intensityMmH.t10
        : settings.returnPeriodDesignYears === 50
          ? flows.intensityMmH.t50
          : settings.returnPeriodDesignYears === 100
            ? flows.intensityMmH.t100
            : flows.intensityMmH.t25;

    return {
      ...ws,
      slopePercent: derivedSlopePercent,
      calculatedTc: {
        kirpichMin: tcComp.kirpichMin,
        passiniMin: tcComp.passiniMin,
        giandottiMin: tcComp.giandottiMin,
        bransbyWilliamsMin: tcComp.bransbyWilliamsMin,
        chosenMethod,
        chosenValueMin: flows.tcMin
      },
      calculatedFlows: {
        q10: flows.flowsM3s.q10,
        q25: flows.flowsM3s.q25,
        q50: flows.flowsM3s.q50,
        q100: flows.flowsM3s.q100,
        rainfallIntensityMmH: designIntensity
      }
    };
  });

  // 2. Recalcul hydraulique sur chaque ouvrage avec synchronisation amont-aval
  const updatedStructures = structuresList.map((struct) => {
    const matchedWs = updatedWatersheds.find((w) => w.id === struct.watershedId);
    let designFlow = struct.designFlowM3s;
    let checkFlow = struct.checkFlowM3s;

    if (matchedWs && matchedWs.calculatedFlows) {
      designFlow = getDesignFlowForPeriod(
        matchedWs.calculatedFlows,
        settings.returnPeriodDesignYears
      );
      checkFlow = getCheckFlowForPeriod(matchedWs.calculatedFlows, settings.returnPeriodCheckYears);
    }

    const structWithFlow = {
      ...struct,
      designFlowM3s: designFlow,
      checkFlowM3s: checkFlow
    };

    const calcResults = calculateHydraulicBehavior(structWithFlow, settings);
    return {
      ...structWithFlow,
      results: calcResults
    };
  });

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    settings,
    watersheds: updatedWatersheds,
    structures: updatedStructures
  };
}

/**
 * Crée un nouveau projet d'ingénierie 100% vierge (feuille blanche).
 */
export function createNewBlankProject(
  code?: string,
  title = 'Nouvelle Étude Hydraulique Vierge'
): Project {
  const now = new Date().toISOString();
  const projectCode = code || `PRJ-${String(Date.now()).slice(-4)}`;
  return {
    id: `prj-${Date.now()}`,
    code: projectCode,
    title,
    client: "Maître d'Ouvrage à définir",
    engineer: 'Ingénieur Hydraulicien',
    location: "Secteur d'étude",
    description:
      "Projet d'ingénierie vierge prêt pour la saisie des bassins versants et le tracé des ouvrages.",
    createdAt: now,
    updatedAt: now,
    status: 'IN_PROGRESS',
    version: '1.2.0',
    settings: getDefaultSettings(),
    watersheds: [],
    structures: []
  };
}
