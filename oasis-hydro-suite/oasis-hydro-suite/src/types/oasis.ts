/**
 * OASIS HYDRO SUITE — Modèle de données officiel
 * Ingénierie Hydrologique, Hydraulique & Dimensionnement d'Ouvrages d'Art
 */

export type StructureType = 'CIRCULAR_PIPE' | 'BOX_CULVERT' | 'DITCH';
export type MaterialType = 'CONCRETE' | 'HDPE' | 'CORRUGATED_STEEL' | 'MASONRY' | 'EARTH_GRASSED';
export type FlowRegime = 'FLUVIAL' | 'TORRENTIAL' | 'CRITICAL';
export type ComplianceStatus = 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';

export interface WatershedPoint {
  lat: number;
  lng: number;
}

export interface Watershed {
  id: string;
  code: string; // Ex: "BV-01"
  name: string;
  areaKm2: number; // Superficie en km²
  lengthKm: number; // Longueur du plus long thalweg en km
  deltaH: number; // Dénivelée totale en mètres
  slopePercent: number; // Pente moyenne en %
  runoffCoefficient: number; // C (ex: 0.45 à 0.85)
  soilType: string; // Ex: "Argilo-limoneux", "Rocheux", "Sableux"
  vegetation: string; // Ex: "Broussaille clairsemée", "Forêt dense", "Zone urbaine"
  coordinates: WatershedPoint[]; // Polygone géoréférencé GeoJSON
  color?: string;
  calculatedTc?: {
    kirpichMin: number;
    passiniMin: number;
    giandottiMin: number;
    bransbyWilliamsMin: number;
    chosenMethod: 'KIRPICH' | 'PASSINI' | 'GIANDOTTI' | 'BRANSBY_WILLIAMS';
    chosenValueMin: number;
  };
  calculatedFlows?: {
    q10: number; // m³/s
    q25: number;
    q50: number;
    q100: number;
    rainfallIntensityMmH: number;
  };
}

export interface RainfallMontana {
  periodReturnYears: number; // 10, 25, 50, 100
  a: number; // paramètre a de Montana (ex: 5.8)
  b: number; // paramètre b de Montana (ex: 0.65)
}

export interface ProjectSettings {
  region: string;
  departmentOrCountry: string;
  returnPeriodDesignYears: number; // Ex: 25 ou 50 ans pour les routes nationales
  returnPeriodCheckYears: number; // Ex: 100 ans pour la vérification du risque de débordement
  minSelfCleaningVelocity: number; // Vmin admissible (m/s, standard 0.60)
  maxVelocityConcrete: number; // Vmax admissible béton (m/s, standard 4.0)
  maxVelocityEarth: number; // Vmax admissible terre (m/s, standard 1.5)
  maxFillingRatio: number; // Taux de remplissage maxi (ex: 0.80 pour 80%)
  minFreeboardM: number; // Tirant d'air minimal de sécurité (ex: 0.25 m)
  montanaParams: RainfallMontana[];
}

export interface HydraulicStructure {
  id: string;
  code: string; // Ex: "OH-PK12+450"
  pkMeters: number; // Point Kilométrique en mètres
  name: string;
  type: StructureType;
  material: MaterialType;
  stricklerK: number; // Coefficient de rugosité de Manning-Strickler (ex: 70 pour béton lisse, 40 pour PEHD annelé, 30 pour terre)

  // Géométrie
  diameterM?: number; // Pour buse circulaire
  widthM?: number; // Pour dalot (largeur intérieure B) ou largeur de fond b pour fossé
  heightM?: number; // Pour dalot (hauteur intérieure H)
  sideSlopeM?: number; // Fruit de berge m pour fossé trapézoïdal (1V : mH)
  cellsCount: number; // Nombre de pertuis (1 pour buse simple, 2 pour double dalot...)
  lengthM: number; // Longueur de l'ouvrage en traversée
  bedSlopeMPerM: number; // Pente du radier (m/m, ex: 0.01 pour 1%)

  // Données de rattachement
  watershedId: string; // BV associé
  designFlowM3s: number; // Débit de projet de dimensionnement (Q25 ou Q50)
  checkFlowM3s: number; // Débit de vérification exceptionnelle (Q100)

  // Localisation
  position: {
    lat: number;
    lng: number;
  };

  // Résultats calculés réels (Manning-Strickler exact)
  results?: HydraulicCalculationResults;
}

export interface HydraulicCalculationResults {
  normalDepthM: number; // Hauteur normale yn (m)
  criticalDepthM: number; // Hauteur critique yc (m)
  wetAreaM2: number; // Section mouillée Sm (m²)
  wettedPerimeterM: number; // Périmètre mouillé Pm (m)
  hydraulicRadiusM: number; // Rayon hydraulique Rh (m)
  flowVelocityMs: number; // Vitesse moyenne V (m/s)
  froudeNumber: number; // Nombre de Froude Fr
  flowRegime: FlowRegime; // FLUVIAL (Fr < 1), TORRENTIAL (Fr > 1), CRITICAL
  fillingRatioPercent: number; // yn / H ou yn / D en %
  freeboardM: number; // Tirant d'air restant (m)
  fullFlowCapacityM3s: number; // Capacité maximale à pleine section Qfull (m³/s)

  // Audit de conformité
  status: ComplianceStatus;
  auditIssues: string[];
}

export interface Project {
  id: string;
  code: string;
  title: string;
  client: string; // Maître d'ouvrage (ex: "Ministère des Travaux Publics / DRE")
  engineer: string; // Bureau d'études / Ingénieur responsable
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'VALIDATED' | 'ARCHIVED';
  version: string;
  settings: ProjectSettings;
  watersheds: Watershed[];
  structures: HydraulicStructure[];
}

export type ActiveTab =
  | 'dashboard'
  | 'gis'
  | 'hydrology'
  | 'hydraulics'
  | 'dimensioning'
  | 'quality'
  | 'reporting'
  | 'ai'
  | 'desktop';

export type UserRole =
  'ADMIN' | 'CHIEF_ENGINEER' | 'HYDRAULIC_CALCULATOR' | 'AUDITOR' | 'CLIENT_VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  organization: string;
  avatarInitials: string;
}
