/**
 * OASIS HYDRO SUITE — Moteur d'Audit & Indicateurs Qualité (Domaine Pur)
 * Centralise le calcul des KPIs, la synthèse de conformité et le diagnostic expert.
 */

import { Project } from '../types/oasis';

export interface ProjectKpis {
  totalStructures: number;
  totalWatersheds: number;
  totalDrainageLengthM: number;
  maxFlowM3s: number;
  compliantCount: number;
  warningCount: number;
  nonCompliantCount: number;
  complianceRate: number;
}

export function computeProjectKpis(project: Project): ProjectKpis {
  const structuresList = Array.isArray(project?.structures) ? project.structures : [];
  const watershedsList = Array.isArray(project?.watersheds) ? project.watersheds : [];

  const totalStructures = structuresList.length;
  const totalWatersheds = watershedsList.length;

  const totalDrainageLengthM = structuresList.reduce((acc, curr) => acc + (curr.lengthM || 0), 0);
  const maxFlowM3s = structuresList.reduce(
    (acc, curr) => Math.max(acc, curr.designFlowM3s || 0),
    0
  );

  const compliantCount = structuresList.filter((s) => s.results?.status === 'COMPLIANT').length;
  const warningCount = structuresList.filter((s) => s.results?.status === 'WARNING').length;
  const nonCompliantCount = structuresList.filter(
    (s) => s.results?.status === 'NON_COMPLIANT'
  ).length;

  const complianceRate =
    totalStructures > 0 ? Math.round((compliantCount / totalStructures) * 100) : 100;

  return {
    totalStructures,
    totalWatersheds,
    totalDrainageLengthM,
    maxFlowM3s,
    compliantCount,
    warningCount,
    nonCompliantCount,
    complianceRate
  };
}

export function runEngineeringAudit(project: Project, userQuery: string): string {
  const q = userQuery.toLowerCase();
  const structures = Array.isArray(project.structures) ? project.structures : [];
  const watersheds = Array.isArray(project.watersheds) ? project.watersheds : [];
  const vMin = project.settings?.minSelfCleaningVelocity ?? 0.6;
  const vMaxConcrete = project.settings?.maxVelocityConcrete ?? 4.0;

  if (q.includes('vitesse') || q.includes('curage') || q.includes('erosion')) {
    if (structures.length === 0) {
      return "Aucun ouvrage hydraulique n'est encore modélisé dans ce projet pour auditer les vitesses.";
    }
    const issues = structures
      .map((s) => {
        const v = s.results?.flowVelocityMs ?? 0;
        const limitMax =
          s.material === 'EARTH_GRASSED'
            ? (project.settings?.maxVelocityEarth ?? 1.5)
            : vMaxConcrete;
        if (v < vMin) {
          return `• **${s.code}** : Vitesse de ${v.toFixed(2)} m/s < ${vMin.toFixed(2)} m/s (Risque d'ensablement). Recommandation : Augmenter la pente du radier ou réduire la largeur de fond.`;
        }
        if (v > limitMax) {
          return `• **${s.code}** : Vitesse excessive de ${v.toFixed(2)} m/s > ${limitMax.toFixed(2)} m/s (Risque d'érosion). Recommandation : Installer un radier renforcé ou un bassin de dissipation amont/aval.`;
        }
        return null;
      })
      .filter((x): x is string => x !== null);

    if (issues.length > 0) {
      return `### Audit des Vitesses d'Écoulement\n\nVoici les points d'attention détectés sur les ouvrages :\n\n${issues.join('\n\n')}`;
    }
    return `Toutes les vitesses d'écoulement actuelles sont conformes aux seuils normatifs (${vMin.toFixed(2)} m/s à ${vMaxConcrete.toFixed(2)} m/s).`;
  }

  if (q.includes('bassin') || q.includes('tc') || q.includes('kirpich') || q.includes('pluie')) {
    if (watersheds.length === 0) {
      return "Aucun bassin versant n'est encore saisi dans ce projet.";
    }
    return (
      `### Analyse Hydrologique du Projet\n\nLe projet comporte ${watersheds.length} bassin(s) versant(s) :\n\n` +
      watersheds
        .map(
          (w) =>
            `• **${w.code} (${w.name})** : Surface de ${w.areaKm2} km², pente de ${w.slopePercent}%, C = ${w.runoffCoefficient}. Tc retenu = **${w.calculatedTc?.chosenValueMin ?? '-'} min** (Formule : ${w.calculatedTc?.chosenMethod ?? 'KIRPICH'}). Débit Q25 = **${w.calculatedFlows?.q25 ?? '-'} m³/s**.`
        )
        .join('\n\n') +
      `\n\n*Rappel normatif : Pour des bassins versants ruraux à pente marquée < 3 km², la formule de Kirpich est la référence standard.*`
    );
  }

  if (q.includes('dalot') || q.includes('buse') || q.includes('dimensionnement')) {
    if (structures.length === 0) {
      return "Aucun ouvrage hydraulique n'est encore défini dans ce projet.";
    }
    return (
      `### Synthèse du Dimensionnement des Ouvrages\n\n` +
      structures
        .map((s) => {
          const res = s.results;
          const desc =
            s.type === 'BOX_CULVERT'
              ? `Dalot cadre ${s.cellsCount > 1 ? `${s.cellsCount}x ` : ''}${s.widthM}x${s.heightM}m`
              : s.type === 'CIRCULAR_PIPE'
                ? `Buse Ø${Math.round((s.diameterM || 1) * 1000)}mm`
                : 'Fossé';
          return `• **${s.code} (PK ${Math.floor(s.pkMeters / 1000)}+${String(s.pkMeters % 1000).padStart(3, '0')})** : ${desc}. Débit ${s.designFlowM3s.toFixed(2)} m³/s. Remplissage = **${res?.fillingRatioPercent.toFixed(1) ?? '-'}%**, Tirant d'air = **${res?.freeboardM.toFixed(2) ?? '-'} m**. Statut : **${res?.status === 'COMPLIANT' ? 'CONFORME' : 'ATTENTION'}**.`;
        })
        .join('\n\n')
    );
  }

  const kpis = computeProjectKpis(project);
  return `Synthèse technique pour le projet **${project.code}** :\n\n- Bassins versants : **${kpis.totalWatersheds}**\n- Nombre total d'ouvrages : **${kpis.totalStructures}**\n- Ouvrages conformes : **${kpis.compliantCount}**\n- Ouvrages avec avertissement / non-conformité : **${kpis.warningCount + kpis.nonCompliantCount}**\n\nVous pouvez demander un audit détaillé sur les vitesses, le dimensionnement des dalots ou les temps de concentration Tc.`;
}
