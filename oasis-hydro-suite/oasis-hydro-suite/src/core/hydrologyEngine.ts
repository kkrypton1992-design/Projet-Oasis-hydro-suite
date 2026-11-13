/**
 * OASIS HYDRO SUITE — Moteur de Calculs Hydrologiques Réels
 * Implémentation certifiée des formules physiques normatives :
 * Kirpich, Passini, Giandotti, Bransby-Williams, Montana et Méthode Rationnelle.
 */

import { RainfallMontana, Watershed } from '../types/oasis';

export interface TcComparison {
  kirpichMin: number;
  passiniMin: number;
  giandottiMin: number;
  bransbyWilliamsMin: number;
  recommendedMin: number;
  recommendedMethod: 'KIRPICH' | 'PASSINI' | 'GIANDOTTI' | 'BRANSBY_WILLIAMS';
}

export interface RationalFlowResults {
  tcMin: number;
  intensityMmH: {
    t10: number;
    t25: number;
    t50: number;
    t100: number;
  };
  flowsM3s: {
    q10: number;
    q25: number;
    q50: number;
    q100: number;
  };
}

/**
 * Calcul du Temps de Concentration selon les 4 formules de référence
 * @param areaKm2 Superficie du bassin versant en km²
 * @param lengthKm Longueur du plus long thalweg en km
 * @param deltaHM Dénivelée totale entre le point le plus haut et l'exutoire en mètres
 */
export function calculateTimeOfConcentration(
  areaKm2: number,
  lengthKm: number,
  deltaHM: number
): TcComparison {
  const safeArea = Math.max(0.001, areaKm2);
  const safeLengthKm = Math.max(0.01, lengthKm);
  const safeLengthM = safeLengthKm * 1000;
  const safeDeltaH = Math.max(1, deltaHM);

  // Pente moyenne en m/m
  const slopeMPerM = Math.max(0.0001, safeDeltaH / safeLengthM);

  // 1. Formule de Kirpich (1940) — Standard pour bassins ruraux & pente marquée
  // Tc (minutes) = 0.0195 * L^0.77 * S^(-0.385) avec L en mètres et S en m/m
  const tcKirpich = 0.0195 * Math.pow(safeLengthM, 0.77) * Math.pow(slopeMPerM, -0.385);

  // 2. Formule de Passini — Standard méditerranéen & semi-aride
  // Tc (heures) = 0.108 * (A * L)^(1/3) / sqrt(S) avec A en km², L en km, S en m/m
  const tcPassiniHours = (0.108 * Math.pow(safeArea * safeLengthKm, 1 / 3)) / Math.sqrt(slopeMPerM);
  const tcPassini = Math.max(5, tcPassiniHours * 60);

  // 3. Formule de Giandotti — Standard pour bassins moyens (> 1 km²)
  // Tc (heures) = (4 * sqrt(A) + 1.5 * L) / (0.8 * sqrt(deltaH)) avec A en km², L en km, deltaH en m
  const tcGiandottiHours =
    (4 * Math.sqrt(safeArea) + 1.5 * safeLengthKm) / (0.8 * Math.sqrt(safeDeltaH));
  const tcGiandotti = Math.max(5, tcGiandottiHours * 60);

  // 4. Formule de Bransby-Williams — Recommandée en terrain ondulé
  // Tc (minutes) = 58.5 * L / (A^0.1 * S_pct^0.2)
  const slopePct = slopeMPerM * 100;
  const tcBransby =
    (58.5 * safeLengthKm) / (Math.pow(safeArea, 0.1) * Math.pow(Math.max(0.1, slopePct), 0.2));

  // Sélection de la méthode la plus appropriée selon la superficie :
  // Si A < 5 km² et forte pente => Kirpich est la référence universelle des ponts et chaussées
  // Si A >= 5 km² => Giandotti ou Passini
  let recommendedMethod: 'KIRPICH' | 'PASSINI' | 'GIANDOTTI' | 'BRANSBY_WILLIAMS';
  let recommendedMin: number;

  if (safeArea > 10) {
    recommendedMethod = 'GIANDOTTI';
    recommendedMin = tcGiandotti;
  } else if (safeArea > 3) {
    recommendedMethod = 'PASSINI';
    recommendedMin = tcPassini;
  } else {
    recommendedMethod = 'KIRPICH';
    recommendedMin = tcKirpich;
  }

  // Borner entre 5 minutes (durée minimale d'averse intense) et 1440 minutes (24h)
  return {
    kirpichMin: Number(Math.max(5, tcKirpich).toFixed(1)),
    passiniMin: Number(Math.max(5, tcPassini).toFixed(1)),
    giandottiMin: Number(Math.max(5, tcGiandotti).toFixed(1)),
    bransbyWilliamsMin: Number(Math.max(5, tcBransby).toFixed(1)),
    recommendedMin: Number(Math.max(5, recommendedMin).toFixed(1)),
    recommendedMethod
  };
}

export function computeSlopePercent(deltaHM: number, lengthKm: number): number {
  const safeLengthKm = Math.max(0.01, Number.isFinite(lengthKm) ? lengthKm : 0.01);
  const safeDeltaH = Math.max(0.1, Number.isFinite(deltaHM) ? deltaHM : 0.1);
  return Number(((safeDeltaH / (safeLengthKm * 1000)) * 100).toFixed(2));
}

/**
 * Calcul de l'intensité pluviométrique selon la loi de Montana : I(t) = a * t^(-b)
 * @param tcMin Temps de concentration en minutes
 * @param a Paramètre a de Montana (dépend de la région et de la période de retour)
 * @param b Paramètre b de Montana (dépend de la région et de la période de retour)
 * @returns Intensité en mm/h
 */
export function calculateRainfallIntensity(tcMin: number, a: number, b: number): number {
  const safeTc = Math.max(5, Number.isFinite(tcMin) ? tcMin : 5);
  const safeA = Math.max(0.01, Number.isFinite(a) ? a : 5);
  const safeB = Math.max(0.01, Number.isFinite(b) ? b : 0.6);
  const intensity = safeA * Math.pow(safeTc, -safeB);
  return Number(intensity.toFixed(2));
}

/**
 * Calcul des débits de pointe par la Méthode Rationnelle : Q = (C * I * A) / 3.6
 * @param watershed Bassin versant
 * @param montanaParams Paramètres de Montana pour les périodes de retour
 * @param explicitTcMin Temps de concentration forcé ou calculé
 */
export function calculateRationalFlows(
  watershed: Watershed,
  montanaParams: RainfallMontana[],
  explicitTcMin?: number
): RationalFlowResults {
  const tcComparison = calculateTimeOfConcentration(
    watershed.areaKm2,
    watershed.lengthKm,
    watershed.deltaH
  );

  const rawTc =
    explicitTcMin !== undefined && Number.isFinite(explicitTcMin) && explicitTcMin > 0
      ? explicitTcMin
      : tcComparison.recommendedMin;
  const tcToUse = Number(Math.max(5, rawTc).toFixed(1));

  const getParams = (period: number): RainfallMontana => {
    const found = montanaParams.find((p) => p.periodReturnYears === period);
    if (found) return found;
    // Valeurs par défaut normatives (climat tempéré/méditerranéen moyen)
    switch (period) {
      case 10:
        return { periodReturnYears: 10, a: 5.6, b: 0.62 };
      case 25:
        return { periodReturnYears: 25, a: 6.9, b: 0.62 };
      case 50:
        return { periodReturnYears: 50, a: 8.2, b: 0.61 };
      case 100:
        return { periodReturnYears: 100, a: 9.8, b: 0.6 };
      default:
        return { periodReturnYears: period, a: 6.5, b: 0.62 };
    }
  };

  const p10 = getParams(10);
  const p25 = getParams(25);
  const p50 = getParams(50);
  const p100 = getParams(100);

  const i10 = calculateRainfallIntensity(tcToUse, p10.a, p10.b);
  const i25 = calculateRainfallIntensity(tcToUse, p25.a, p25.b);
  const i50 = calculateRainfallIntensity(tcToUse, p50.a, p50.b);
  const i100 = calculateRainfallIntensity(tcToUse, p100.a, p100.b);

  const C = Math.min(1.0, Math.max(0.05, watershed.runoffCoefficient));
  const A = Math.max(0.001, watershed.areaKm2);

  // Q = (C * I * A) / 3.6  [en m³/s]
  const q10 = Number(((C * i10 * A) / 3.6).toFixed(3));
  const q25 = Number(((C * i25 * A) / 3.6).toFixed(3));
  const q50 = Number(((C * i50 * A) / 3.6).toFixed(3));
  const q100 = Number(((C * i100 * A) / 3.6).toFixed(3));

  return {
    tcMin: tcToUse,
    intensityMmH: {
      t10: i10,
      t25: i25,
      t50: i50,
      t100: i100
    },
    flowsM3s: {
      q10,
      q25,
      q50,
      q100
    }
  };
}
