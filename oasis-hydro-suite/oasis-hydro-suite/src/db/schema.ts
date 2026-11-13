/**
 * OASIS HYDRO SUITE — Schéma Physique Drizzle ORM (PostgreSQL / PostGIS)
 * Tables officielles : projects, studies, scenarios, watersheds, hydraulic_structures,
 * stations, hydro_series, reports, workflow, users.
 */

import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  serial,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb
} from 'drizzle-orm/pg-core';

// 1. Table des Utilisateurs & Opérateurs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('ENGINEER').notNull(), // ADMIN, ENGINEER, AUDITOR, VIEWER
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 2. Table des Projets
export const projects = pgTable('projects', {
  id: text('id').primaryKey(), // Code unique ou UUID (ex: "prj-rn1-pk25-real")
  code: text('code').notNull().unique(), // Ex: "PRJ-2026-HYD-01"
  title: text('title').notNull(),
  client: text('client').notNull(),
  engineer: text('engineer').notNull(),
  location: text('location').notNull(),
  description: text('description').default('').notNull(),
  status: text('status').default('IN_PROGRESS').notNull(), // DRAFT, IN_PROGRESS, VALIDATED, ARCHIVED
  version: text('version').default('1.2.0').notNull(),
  settings: jsonb('settings').notNull(), // Paramètres normatifs, Montana, tolérances
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 3. Table des Études par Projet
export const studies = pgTable('studies', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. Table des Scénarios & Variantes
export const scenarios = pgTable('scenarios', {
  id: text('id').primaryKey(),
  studyId: text('study_id')
    .references(() => studies.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 5. Table des Bassins Versants (Watersheds)
export const watersheds = pgTable('watersheds', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(), // Ex: "BV-01"
  name: text('name').notNull(),
  areaKm2: doublePrecision('area_km2').notNull(),
  lengthKm: doublePrecision('length_km').notNull(),
  deltaH: doublePrecision('delta_h').notNull(),
  slopePercent: doublePrecision('slope_percent').notNull(),
  runoffCoefficient: doublePrecision('runoff_coefficient').notNull(),
  soilType: text('soil_type').default('').notNull(),
  vegetation: text('vegetation').default('').notNull(),
  color: text('color').default('#0284c7').notNull(),
  coordinates: jsonb('coordinates').notNull(), // GeoJSON points [{lat, lng}]
  calculatedTc: jsonb('calculated_tc'), // Résultats Kirpich, Passini, etc.
  calculatedFlows: jsonb('calculated_flows'), // Q10, Q25, Q50, Q100
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 6. Table des Ouvrages Hydrauliques (Hydraulic Structures)
export const hydraulicStructures = pgTable('hydraulic_structures', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  watershedId: text('watershed_id').notNull(),
  code: text('code').notNull(), // Ex: "OH-01"
  pkMeters: integer('pk_meters').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // CIRCULAR_PIPE, BOX_CULVERT, DITCH
  material: text('material').notNull(), // CONCRETE, HDPE, CORRUGATED_STEEL, EARTH_GRASSED
  stricklerK: doublePrecision('strickler_k').notNull(),

  // Géométrie
  diameterM: doublePrecision('diameter_m'),
  widthM: doublePrecision('width_m'),
  heightM: doublePrecision('height_m'),
  sideSlopeM: doublePrecision('side_slope_m'),
  cellsCount: integer('cells_count').default(1).notNull(),
  lengthM: doublePrecision('length_m').notNull(),
  bedSlopeMPerM: doublePrecision('bed_slope_m_per_m').notNull(),

  // Débits
  designFlowM3s: doublePrecision('design_flow_m3s').notNull(),
  checkFlowM3s: doublePrecision('check_flow_m3s').notNull(),

  // Localisation & Résultats d'écoulement
  position: jsonb('position').notNull(), // {lat, lng}
  results: jsonb('results'), // normalDepth, velocity, froude, auditIssues
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 7. Table des Stations Pluviométriques & Hydrométriques
export const stations = pgTable('stations', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // PLUVIOMETRIC, HYDROMETRIC
  coordinates: jsonb('coordinates').notNull(),
  elevationM: doublePrecision('elevation_m').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 8. Table des Séries Hydro-Pluviométriques
export const hydroSeries = pgTable('hydro_series', {
  id: text('id').primaryKey(),
  stationId: text('station_id')
    .references(() => stations.id, { onDelete: 'cascade' })
    .notNull(),
  returnPeriodYears: integer('return_period_years').notNull(),
  intensityMmH: doublePrecision('intensity_mm_h').notNull(),
  rainfallMm: doublePrecision('rainfall_mm').notNull(),
  montanaA: doublePrecision('montana_a'),
  montanaB: doublePrecision('montana_b'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 9. Table des Rapports & Notes de Calcul
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  type: text('type').default('HYDRAULIC_CALCULATION_NOTE').notNull(),
  status: text('status').default('DRAFT').notNull(), // DRAFT, VALIDATED, ARCHIVED
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 10. Table du Workflow & Audit Trail
export const workflow = pgTable('workflow', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  stepName: text('step_name').notNull(),
  status: text('status').default('PENDING').notNull(), // PENDING, IN_REVIEW, APPROVED, REJECTED
  validationNotes: text('validation_notes').default('').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations Drizzle
export const projectsRelations = relations(projects, ({ many }) => ({
  studies: many(studies),
  watersheds: many(watersheds),
  structures: many(hydraulicStructures),
  reports: many(reports),
  workflowSteps: many(workflow)
}));

export const watershedsRelations = relations(watersheds, ({ one }) => ({
  project: one(projects, {
    fields: [watersheds.projectId],
    references: [projects.id]
  })
}));

export const hydraulicStructuresRelations = relations(hydraulicStructures, ({ one }) => ({
  project: one(projects, {
    fields: [hydraulicStructures.projectId],
    references: [projects.id]
  })
}));
