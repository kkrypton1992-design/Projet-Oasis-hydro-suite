/**
 * OASIS HYDRO SUITE — Schémas de Validation Zod (Partagés Backend & Contrats API)
 */

import { z } from 'zod';

export const StructureTypeSchema = z.enum(['CIRCULAR_PIPE', 'BOX_CULVERT', 'DITCH']);
export const MaterialTypeSchema = z.enum([
  'CONCRETE',
  'HDPE',
  'CORRUGATED_STEEL',
  'MASONRY',
  'EARTH_GRASSED'
]);
export const FlowRegimeSchema = z.enum(['FLUVIAL', 'TORRENTIAL', 'CRITICAL']);
export const ComplianceStatusSchema = z.enum(['COMPLIANT', 'WARNING', 'NON_COMPLIANT']);
export const ProjectStatusSchema = z.enum(['DRAFT', 'IN_PROGRESS', 'VALIDATED', 'ARCHIVED']);
export const TcMethodSchema = z.enum(['KIRPICH', 'PASSINI', 'GIANDOTTI', 'BRANSBY_WILLIAMS']);
export const UserRoleSchema = z.enum([
  'ADMIN',
  'CHIEF_ENGINEER',
  'HYDRAULIC_CALCULATOR',
  'AUDITOR',
  'CLIENT_VIEWER'
]);

export const WatershedPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const RainfallMontanaSchema = z.object({
  periodReturnYears: z.number().int().positive(),
  a: z.number().positive(),
  b: z.number().positive().max(2)
});

export const ProjectSettingsSchema = z.object({
  region: z.string().min(1),
  departmentOrCountry: z.string().min(1),
  returnPeriodDesignYears: z.number().int().positive(),
  returnPeriodCheckYears: z.number().int().positive(),
  minSelfCleaningVelocity: z.number().min(0).max(5),
  maxVelocityConcrete: z.number().positive().max(20),
  maxVelocityEarth: z.number().positive().max(10),
  maxFillingRatio: z.number().positive().max(1),
  minFreeboardM: z.number().min(0).max(5),
  montanaParams: z.array(RainfallMontanaSchema).min(1)
});

export const CalculatedTcSchema = z.object({
  kirpichMin: z.number().positive(),
  passiniMin: z.number().positive(),
  giandottiMin: z.number().positive(),
  bransbyWilliamsMin: z.number().positive(),
  chosenMethod: TcMethodSchema,
  chosenValueMin: z.number().positive()
});

export const CalculatedFlowsSchema = z.object({
  q10: z.number().nonnegative(),
  q25: z.number().nonnegative(),
  q50: z.number().nonnegative(),
  q100: z.number().nonnegative(),
  rainfallIntensityMmH: z.number().nonnegative()
});

export const WatershedSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  areaKm2: z.number().positive(),
  lengthKm: z.number().positive(),
  deltaH: z.number().positive(),
  slopePercent: z.number().nonnegative(),
  runoffCoefficient: z.number().min(0.05).max(1),
  soilType: z.string(),
  vegetation: z.string(),
  coordinates: z.array(WatershedPointSchema),
  color: z.string().optional(),
  calculatedTc: CalculatedTcSchema.optional(),
  calculatedFlows: CalculatedFlowsSchema.optional()
});

export const HydraulicCalculationResultsSchema = z.object({
  normalDepthM: z.number().nonnegative(),
  criticalDepthM: z.number().nonnegative(),
  wetAreaM2: z.number().nonnegative(),
  wettedPerimeterM: z.number().nonnegative(),
  hydraulicRadiusM: z.number().nonnegative(),
  flowVelocityMs: z.number().nonnegative(),
  froudeNumber: z.number().nonnegative(),
  flowRegime: FlowRegimeSchema,
  fillingRatioPercent: z.number().nonnegative(),
  freeboardM: z.number().nonnegative(),
  fullFlowCapacityM3s: z.number().nonnegative(),
  status: ComplianceStatusSchema,
  auditIssues: z.array(z.string())
});

export const HydraulicStructureSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  pkMeters: z.number().int().min(0),
  name: z.string().min(1),
  type: StructureTypeSchema,
  material: MaterialTypeSchema,
  stricklerK: z.number().min(10).max(150),
  diameterM: z.number().positive().optional(),
  widthM: z.number().nonnegative().optional(),
  heightM: z.number().positive().optional(),
  sideSlopeM: z.number().nonnegative().optional(),
  cellsCount: z.number().int().min(1).max(20),
  lengthM: z.number().positive(),
  bedSlopeMPerM: z.number().positive().max(0.5),
  watershedId: z.string(),
  designFlowM3s: z.number().positive(),
  checkFlowM3s: z.number().nonnegative(),
  position: WatershedPointSchema,
  results: HydraulicCalculationResultsSchema.optional()
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  client: z.string().min(1),
  engineer: z.string().min(1),
  location: z.string().min(1),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: ProjectStatusSchema,
  version: z.string().min(1),
  settings: ProjectSettingsSchema,
  watersheds: z.array(WatershedSchema),
  structures: z.array(HydraulicStructureSchema)
});

export const ReportCreateSchema = z.object({
  id: z.string().min(1).optional(),
  code: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'VALIDATED', 'ARCHIVED']).optional(),
  content: z.record(z.string(), z.unknown())
});
