/**
 * OASIS HYDRO SUITE — Moteur de Calculs Hydrauliques Réels (Manning-Strickler)
 * Résolution exacte par méthodes numériques des équations de Saint-Venant / écoulement uniforme.
 * Calcul précis de la hauteur normale (yn), hauteur critique (yc), vitesse (V), régime (Froude),
 * taux de remplissage et audit normatif des ouvrages de franchissement (buses, dalots, fossés).
 */

import {
  ComplianceStatus,
  HydraulicCalculationResults,
  HydraulicStructure,
  MaterialType,
  ProjectSettings
} from '../types/oasis';

const GRAVITY = 9.80665; // Accélération de la pesanteur en m/s²

export const MATERIAL_STRICKLER_DEFAULTS: Record<MaterialType, number> = {
  CONCRETE: 70,
  HDPE: 80,
  CORRUGATED_STEEL: 45,
  MASONRY: 55,
  EARTH_GRASSED: 35
};

/**
 * Calcul complet de l'écoulement permanent pour un ouvrage hydraulique donné
 */
export function calculateHydraulicBehavior(
  structure: HydraulicStructure,
  settings: ProjectSettings
): HydraulicCalculationResults {
  const Q = Math.max(0.001, structure.designFlowM3s);
  const K = Math.max(10, structure.stricklerK);
  const S0 = Math.max(0.0001, structure.bedSlopeMPerM);
  const N = Math.max(1, structure.cellsCount || 1);

  if (structure.type === 'CIRCULAR_PIPE') {
    const D = Math.max(0.3, structure.diameterM || 1.0);
    return calculateCircularPipe(Q, K, S0, D, N, structure, settings);
  } else if (structure.type === 'BOX_CULVERT') {
    const B = Math.max(0.5, structure.widthM || 1.5);
    const H = Math.max(0.5, structure.heightM || 1.5);
    return calculateBoxCulvert(Q, K, S0, B, H, N, structure, settings);
  } else {
    // FOSSÉ TRAPÉZOÏDAL OU TRIANGULAIRE
    const b = Math.max(0.0, structure.widthM ?? 0.5); // 0 pour fossé en V triangulaire
    const m = Math.max(0.0, structure.sideSlopeM ?? 1.5); // fruit de berge 1V:mH
    const H = Math.max(0.3, structure.heightM || 1.0);
    return calculateDitch(Q, K, S0, b, m, H, structure, settings);
  }
}

/**
 * Résolution exacte pour Dalot Cadre Rectangulaire (Box Culvert)
 */
function calculateBoxCulvert(
  Q: number,
  K: number,
  S0: number,
  B: number,
  H: number,
  N: number,
  structure: HydraulicStructure,
  settings: ProjectSettings
): HydraulicCalculationResults {
  // Capacité pleine section Qfull
  const S_full = N * B * H;
  const P_full = N * (2 * B + 2 * H);
  const Rh_full = S_full / P_full;
  const Q_full = K * S_full * Math.pow(Rh_full, 2 / 3) * Math.sqrt(S0);

  // Fonction débit pour une hauteur d'eau y : Q(y) = K * S * Rh^(2/3) * sqrt(S0)
  const dischargeAtDepth = (y: number): number => {
    if (y <= 0) return 0;
    const S = N * B * y;
    const P = N * (B + 2 * y);
    const Rh = S / P;
    return K * S * Math.pow(Rh, 2 / 3) * Math.sqrt(S0);
  };

  // Résolution numérique de la hauteur normale yn par dichotomie
  let yn = H;
  if (Q >= Q_full) {
    yn = H * (Q / Q_full); // En charge / débordement
  } else {
    let low = 0.001;
    let high = H;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const qMid = dischargeAtDepth(mid);
      if (Math.abs(qMid - Q) < 1e-5) {
        yn = mid;
        break;
      }
      if (qMid < Q) {
        low = mid;
      } else {
        high = mid;
      }
      yn = mid;
    }
  }

  // Hauteur critique yc : pour section rectangulaire avec N pertuis
  const qUnit = Q / (N * B);
  const yc = Math.pow(Math.pow(qUnit, 2) / GRAVITY, 1 / 3);

  // Paramètres réels à yn
  const actualY = Math.min(yn, H);
  const wetAreaM2 = N * B * actualY;
  const wettedPerimeterM = N * (B + 2 * actualY);
  const hydraulicRadiusM = wetAreaM2 / wettedPerimeterM;
  const flowVelocityMs = Q / wetAreaM2;

  const froudeNumber = flowVelocityMs / Math.sqrt(GRAVITY * actualY);

  let flowRegime: 'FLUVIAL' | 'TORRENTIAL' | 'CRITICAL' = 'FLUVIAL';
  if (froudeNumber > 1.05) flowRegime = 'TORRENTIAL';
  else if (froudeNumber >= 0.95 && froudeNumber <= 1.05) flowRegime = 'CRITICAL';

  const fillingRatioPercent = (yn / H) * 100;
  const freeboardM = Math.max(0, H - yn);

  const { status, auditIssues } = auditStructure(
    flowVelocityMs,
    fillingRatioPercent,
    freeboardM,
    structure,
    settings
  );

  return {
    normalDepthM: Number(yn.toFixed(3)),
    criticalDepthM: Number(yc.toFixed(3)),
    wetAreaM2: Number(wetAreaM2.toFixed(3)),
    wettedPerimeterM: Number(wettedPerimeterM.toFixed(3)),
    hydraulicRadiusM: Number(hydraulicRadiusM.toFixed(3)),
    flowVelocityMs: Number(flowVelocityMs.toFixed(2)),
    froudeNumber: Number(froudeNumber.toFixed(2)),
    flowRegime,
    fillingRatioPercent: Number(fillingRatioPercent.toFixed(1)),
    freeboardM: Number(freeboardM.toFixed(3)),
    fullFlowCapacityM3s: Number(Q_full.toFixed(3)),
    status,
    auditIssues
  };
}

/**
 * Résolution exacte pour Buse Circulaire (Circular Pipe)
 */
function calculateCircularPipe(
  Q: number,
  K: number,
  S0: number,
  D: number,
  N: number,
  structure: HydraulicStructure,
  settings: ProjectSettings
): HydraulicCalculationResults {
  const S_full = (N * (Math.PI * Math.pow(D, 2))) / 4;
  const Rh_full = D / 4;
  const Q_full = K * S_full * Math.pow(Rh_full, 2 / 3) * Math.sqrt(S0);

  const getPipeProps = (y: number) => {
    const clampedY = Math.min(D * 0.9999, Math.max(0.0001, y));
    const theta = 2 * Math.acos(Math.max(-1, Math.min(1, (D - 2 * clampedY) / D)));
    const S = N * (Math.pow(D, 2) / 8) * (theta - Math.sin(theta));
    const P = N * (D / 2) * theta;
    const Rh = S / P;
    const T = N * 2 * Math.sqrt(Math.max(0.0001, clampedY * (D - clampedY)));
    return { theta, S, P, Rh, T };
  };

  let yn = D;
  if (Q >= Q_full) {
    yn = D * (Q / Q_full);
  } else {
    let low = 0.001;
    let high = D * 0.999;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      const { S, Rh } = getPipeProps(mid);
      const qMid = K * S * Math.pow(Rh, 2 / 3) * Math.sqrt(S0);
      if (Math.abs(qMid - Q) < 1e-5) {
        yn = mid;
        break;
      }
      if (qMid < Q) {
        low = mid;
      } else {
        high = mid;
      }
      yn = mid;
    }
  }

  let yc = D * 0.5;
  let lowC = 0.001;
  let highC = D * 0.999;
  for (let i = 0; i < 35; i++) {
    const mid = (lowC + highC) / 2;
    const { S, T } = getPipeProps(mid);
    const critValue = (Math.pow(Q, 2) * T) / (GRAVITY * Math.pow(S, 3));
    if (Math.abs(critValue - 1) < 1e-4) {
      yc = mid;
      break;
    }
    if (critValue > 1) {
      lowC = mid;
    } else {
      highC = mid;
    }
    yc = mid;
  }

  const {
    S: wetAreaM2,
    P: wettedPerimeterM,
    Rh: hydraulicRadiusM,
    T
  } = getPipeProps(Math.min(yn, D * 0.999));
  const flowVelocityMs = Q / wetAreaM2;
  const hydrDepth = Math.max(0.01, wetAreaM2 / Math.max(0.01, T));
  const froudeNumber = flowVelocityMs / Math.sqrt(GRAVITY * hydrDepth);

  let flowRegime: 'FLUVIAL' | 'TORRENTIAL' | 'CRITICAL' = 'FLUVIAL';
  if (froudeNumber > 1.05) flowRegime = 'TORRENTIAL';
  else if (froudeNumber >= 0.95 && froudeNumber <= 1.05) flowRegime = 'CRITICAL';

  const fillingRatioPercent = (yn / D) * 100;
  const freeboardM = Math.max(0, D - yn);

  const { status, auditIssues } = auditStructure(
    flowVelocityMs,
    fillingRatioPercent,
    freeboardM,
    structure,
    settings
  );

  return {
    normalDepthM: Number(yn.toFixed(3)),
    criticalDepthM: Number(yc.toFixed(3)),
    wetAreaM2: Number(wetAreaM2.toFixed(3)),
    wettedPerimeterM: Number(wettedPerimeterM.toFixed(3)),
    hydraulicRadiusM: Number(hydraulicRadiusM.toFixed(3)),
    flowVelocityMs: Number(flowVelocityMs.toFixed(2)),
    froudeNumber: Number(froudeNumber.toFixed(2)),
    flowRegime,
    fillingRatioPercent: Number(fillingRatioPercent.toFixed(1)),
    freeboardM: Number(freeboardM.toFixed(3)),
    fullFlowCapacityM3s: Number(Q_full.toFixed(3)),
    status,
    auditIssues
  };
}

/**
 * Résolution exacte pour Fossé Trapézoïdal ou Triangulaire
 */
function calculateDitch(
  Q: number,
  K: number,
  S0: number,
  b: number,
  m: number,
  H: number,
  structure: HydraulicStructure,
  settings: ProjectSettings
): HydraulicCalculationResults {
  const getDitchProps = (y: number) => {
    const clampedY = Math.max(0.001, y);
    const S = (b + m * clampedY) * clampedY;
    const P = b + 2 * clampedY * Math.sqrt(1 + Math.pow(m, 2));
    const Rh = S / P;
    const T = b + 2 * m * clampedY;
    return { S, P, Rh, T };
  };

  const { S: S_full, Rh: Rh_full } = getDitchProps(H);
  const Q_full = K * S_full * Math.pow(Rh_full, 2 / 3) * Math.sqrt(S0);

  let yn = H;
  let low = 0.001;
  let high = Math.max(H * 2, 5.0);
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const { S, Rh } = getDitchProps(mid);
    const qMid = K * S * Math.pow(Rh, 2 / 3) * Math.sqrt(S0);
    if (Math.abs(qMid - Q) < 1e-5) {
      yn = mid;
      break;
    }
    if (qMid < Q) {
      low = mid;
    } else {
      high = mid;
    }
    yn = mid;
  }

  let yc = 0.5;
  let lowC = 0.001;
  let highC = 5.0;
  for (let i = 0; i < 35; i++) {
    const mid = (lowC + highC) / 2;
    const { S, T } = getDitchProps(mid);
    const critValue = (Math.pow(Q, 2) * T) / (GRAVITY * Math.pow(S, 3));
    if (Math.abs(critValue - 1) < 1e-4) {
      yc = mid;
      break;
    }
    if (critValue > 1) {
      lowC = mid;
    } else {
      highC = mid;
    }
    yc = mid;
  }

  const { S: wetAreaM2, P: wettedPerimeterM, Rh: hydraulicRadiusM, T } = getDitchProps(yn);
  const flowVelocityMs = Q / wetAreaM2;
  const hydrDepth = Math.max(0.01, wetAreaM2 / Math.max(0.01, T));
  const froudeNumber = flowVelocityMs / Math.sqrt(GRAVITY * hydrDepth);

  let flowRegime: 'FLUVIAL' | 'TORRENTIAL' | 'CRITICAL' = 'FLUVIAL';
  if (froudeNumber > 1.05) flowRegime = 'TORRENTIAL';
  else if (froudeNumber >= 0.95 && froudeNumber <= 1.05) flowRegime = 'CRITICAL';

  const fillingRatioPercent = (yn / H) * 100;
  const freeboardM = Math.max(0, H - yn);

  const { status, auditIssues } = auditStructure(
    flowVelocityMs,
    fillingRatioPercent,
    freeboardM,
    structure,
    settings
  );

  return {
    normalDepthM: Number(yn.toFixed(3)),
    criticalDepthM: Number(yc.toFixed(3)),
    wetAreaM2: Number(wetAreaM2.toFixed(3)),
    wettedPerimeterM: Number(wettedPerimeterM.toFixed(3)),
    hydraulicRadiusM: Number(hydraulicRadiusM.toFixed(3)),
    flowVelocityMs: Number(flowVelocityMs.toFixed(2)),
    froudeNumber: Number(froudeNumber.toFixed(2)),
    flowRegime,
    fillingRatioPercent: Number(fillingRatioPercent.toFixed(1)),
    freeboardM: Number(freeboardM.toFixed(3)),
    fullFlowCapacityM3s: Number(Q_full.toFixed(3)),
    status,
    auditIssues
  };
}

/**
 * Audit normatif rigoureux selon les règles de l'art du génie civil & drainage
 */
function auditStructure(
  velocity: number,
  fillingRatioPct: number,
  freeboardM: number,
  structure: HydraulicStructure,
  settings: ProjectSettings
): { status: ComplianceStatus; auditIssues: string[] } {
  const issues: string[] = [];
  let status: ComplianceStatus = 'COMPLIANT';

  const vMin = settings.minSelfCleaningVelocity ?? 0.6;
  const vMax =
    structure.material === 'EARTH_GRASSED'
      ? (settings.maxVelocityEarth ?? 1.5)
      : (settings.maxVelocityConcrete ?? 4.0);
  const maxFillingPct = (settings.maxFillingRatio ?? 0.8) * 100;
  const minFreeboard = settings.minFreeboardM ?? 0.25;

  if (velocity < vMin) {
    issues.push(
      `Vitesse trop faible (${velocity.toFixed(2)} m/s < ${vMin.toFixed(2)} m/s) : Risque critique d'ensablement/colmatage.`
    );
    status = 'WARNING';
  }

  if (velocity > vMax) {
    issues.push(
      `Vitesse excessive (${velocity.toFixed(2)} m/s > ${vMax.toFixed(2)} m/s) : Risque d'affouillement du radier et dégradation de l'ouvrage.`
    );
    status = 'NON_COMPLIANT';
  }

  if (fillingRatioPct > 100) {
    issues.push(
      `Débordement / Mise en charge hydraulique (${fillingRatioPct.toFixed(1)}% > 100%) : Section insuffisante pour le débit de projet.`
    );
    status = 'NON_COMPLIANT';
  } else if (fillingRatioPct > maxFillingPct) {
    issues.push(
      `Taux de remplissage élevé (${fillingRatioPct.toFixed(1)}% > ${maxFillingPct.toFixed(0)}%) : Revanche de sécurité insuffisante.`
    );
    if (status !== 'NON_COMPLIANT') status = 'WARNING';
  }

  if (freeboardM < minFreeboard && fillingRatioPct <= 100) {
    issues.push(
      `Tirant d'air restreint (${freeboardM.toFixed(2)} m < ${minFreeboard.toFixed(2)} m) : Risque de blocage par les corps flottants.`
    );
    if (status !== 'NON_COMPLIANT') status = 'WARNING';
  }

  return { status, auditIssues: issues };
}

/**
 * Moteur de dimensionnement automatique dans le catalogue standard
 * Vérifie l'intégralité des critères normatifs (remplissage, Vmin, Vmax, tirant d'air).
 */
export function recommendOptimalStructure(
  type: 'CIRCULAR_PIPE' | 'BOX_CULVERT',
  designFlowM3s: number,
  bedSlopeMPerM: number,
  settings: ProjectSettings,
  stricklerK = MATERIAL_STRICKLER_DEFAULTS.CONCRETE
): {
  recommendedDiameterM?: number;
  recommendedWidthM?: number;
  recommendedHeightM?: number;
  recommendedCells: number;
  explanation: string;
} {
  const K = Math.max(10, stricklerK);
  const maxFillingPct = (settings.maxFillingRatio ?? 0.8) * 100;
  const maxV = settings.maxVelocityConcrete ?? 4.0;
  const minV = settings.minSelfCleaningVelocity ?? 0.6;
  const minFreeboard = settings.minFreeboardM ?? 0.25;

  const isStrictlyCompliant = (res: HydraulicCalculationResults) =>
    res.fillingRatioPercent <= maxFillingPct &&
    res.flowVelocityMs <= maxV &&
    res.flowVelocityMs >= minV &&
    res.freeboardM >= minFreeboard;

  const isHydroAdequate = (res: HydraulicCalculationResults) =>
    res.fillingRatioPercent <= maxFillingPct &&
    res.flowVelocityMs <= maxV &&
    res.freeboardM >= minFreeboard;

  if (type === 'CIRCULAR_PIPE') {
    const catalogDiameters = [0.6, 0.8, 1.0, 1.2, 1.4, 1.5, 1.8, 2.0];

    // Passe 1 : conformité complète (y compris auto-curage), puis passe 2 : capacité + tirant d'air
    for (const strict of [true, false]) {
      for (const cells of [1, 2]) {
        for (const d of catalogDiameters) {
          const dummyStructure: HydraulicStructure = {
            id: 'opt',
            code: 'OPT',
            pkMeters: 0,
            name: 'Opt',
            type: 'CIRCULAR_PIPE',
            material: 'CONCRETE',
            stricklerK: K,
            diameterM: d,
            cellsCount: cells,
            lengthM: 15,
            bedSlopeMPerM,
            watershedId: '',
            designFlowM3s,
            checkFlowM3s: designFlowM3s * 1.3,
            position: { lat: 0, lng: 0 }
          };

          const res = calculateHydraulicBehavior(dummyStructure, settings);
          const ok = strict ? isStrictlyCompliant(res) : isHydroAdequate(res);
          if (ok) {
            return {
              recommendedDiameterM: d,
              recommendedCells: cells,
              explanation:
                cells === 1
                  ? `Buse circulaire Ø${Math.round(d * 1000)} mm simple adaptée : taux de remplissage ${res.fillingRatioPercent}%, tirant d'air ${res.freeboardM} m et vitesse de ${res.flowVelocityMs} m/s.`
                  : `Buse double (${cells}x Ø${Math.round(d * 1000)} mm) recommandée pour éviter un diamètre excessif : remplissage ${res.fillingRatioPercent}%, vitesse ${res.flowVelocityMs} m/s.`
            };
          }
        }
      }
    }

    return {
      recommendedDiameterM: 2.0,
      recommendedCells: 2,
      explanation: `Débit très important (${designFlowM3s.toFixed(2)} m³/s). Il est recommandé de basculer sur un dalot cadre rectangulaire.`
    };
  } else {
    const catalogDalots = [
      { b: 1.0, h: 1.0 },
      { b: 1.5, h: 1.0 },
      { b: 1.5, h: 1.5 },
      { b: 2.0, h: 1.5 },
      { b: 2.0, h: 2.0 },
      { b: 2.5, h: 1.5 },
      { b: 2.5, h: 2.0 },
      { b: 3.0, h: 2.0 },
      { b: 3.0, h: 2.5 },
      { b: 4.0, h: 2.5 },
      { b: 4.0, h: 3.0 }
    ];

    for (const strict of [true, false]) {
      for (const cells of [1, 2]) {
        for (const dal of catalogDalots) {
          const dummyStructure: HydraulicStructure = {
            id: 'opt_box',
            code: 'OPT_BOX',
            pkMeters: 0,
            name: 'OptBox',
            type: 'BOX_CULVERT',
            material: 'CONCRETE',
            stricklerK: K,
            widthM: dal.b,
            heightM: dal.h,
            cellsCount: cells,
            lengthM: 15,
            bedSlopeMPerM,
            watershedId: '',
            designFlowM3s,
            checkFlowM3s: designFlowM3s * 1.3,
            position: { lat: 0, lng: 0 }
          };

          const res = calculateHydraulicBehavior(dummyStructure, settings);
          const ok = strict ? isStrictlyCompliant(res) : isHydroAdequate(res);
          if (ok) {
            return {
              recommendedWidthM: dal.b,
              recommendedHeightM: dal.h,
              recommendedCells: cells,
              explanation:
                cells === 1
                  ? `Dalot cadre rectangulaire ${dal.b.toFixed(2)} m x ${dal.h.toFixed(2)} m optimal : remplissage de ${res.fillingRatioPercent}%, vitesse ${res.flowVelocityMs} m/s et tirant d'air de ${res.freeboardM} m.`
                  : `Dalot double pertuis (${cells}x ${dal.b.toFixed(2)}m x ${dal.h.toFixed(2)}m) recommandé : remplissage ${res.fillingRatioPercent}% pour ${designFlowM3s.toFixed(2)} m³/s.`
            };
          }
        }
      }
    }

    return {
      recommendedWidthM: 4.0,
      recommendedHeightM: 3.0,
      recommendedCells: 2,
      explanation: `Débit exceptionnel (${designFlowM3s.toFixed(2)} m³/s). Dalot double 2x (4.00 x 3.00 m) ou ouvrage d'art type pont-cadre requis.`
    };
  }
}
