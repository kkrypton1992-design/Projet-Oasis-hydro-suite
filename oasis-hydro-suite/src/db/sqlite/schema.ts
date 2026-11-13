/**
 * OASIS HYDRO SUITE — Schéma Drizzle ORM SQLite Local Embarqué
 * Miroir exact du modèle relationnel PostgreSQL pour persistance 100% autonome.
 */

import { relations, sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('ENGINEER').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  client: text('client').notNull(),
  engineer: text('engineer').notNull(),
  location: text('location').notNull(),
  description: text('description').default('').notNull(),
  status: text('status').default('IN_PROGRESS').notNull(),
  version: text('version').default('1.2.0').notNull(),
  settings: text('settings').notNull(), // JSON sérialisé
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const studies = sqliteTable('studies', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const scenarios = sqliteTable('scenarios', {
  id: text('id').primaryKey(),
  studyId: text('study_id')
    .references(() => studies.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const watersheds = sqliteTable('watersheds', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  areaKm2: real('area_km2').notNull(),
  lengthKm: real('length_km').notNull(),
  deltaH: real('delta_h').notNull(),
  slopePercent: real('slope_percent').notNull(),
  runoffCoefficient: real('runoff_coefficient').notNull(),
  soilType: text('soil_type').default('').notNull(),
  vegetation: text('vegetation').default('').notNull(),
  color: text('color').default('#0284c7').notNull(),
  coordinates: text('coordinates').notNull(), // JSON [{lat, lng}]
  calculatedTc: text('calculated_tc'), // JSON
  calculatedFlows: text('calculated_flows'), // JSON
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const hydraulicStructures = sqliteTable('hydraulic_structures', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  watershedId: text('watershed_id').notNull(),
  code: text('code').notNull(),
  pkMeters: integer('pk_meters').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  material: text('material').notNull(),
  stricklerK: real('strickler_k').notNull(),
  diameterM: real('diameter_m'),
  widthM: real('width_m'),
  heightM: real('height_m'),
  sideSlopeM: real('side_slope_m'),
  cellsCount: integer('cells_count').default(1).notNull(),
  lengthM: real('length_m').notNull(),
  bedSlopeMPerM: real('bed_slope_m_per_m').notNull(),
  designFlowM3s: real('design_flow_m3s').notNull(),
  checkFlowM3s: real('check_flow_m3s').notNull(),
  position: text('position').notNull(), // JSON {lat, lng}
  results: text('results'), // JSON
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const stations = sqliteTable('stations', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  coordinates: text('coordinates').notNull(), // JSON {lat, lng}
  elevationM: real('elevation_m').default(0).notNull(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const hydroSeries = sqliteTable('hydro_series', {
  id: text('id').primaryKey(),
  stationId: text('station_id')
    .references(() => stations.id, { onDelete: 'cascade' })
    .notNull(),
  returnPeriodYears: integer('return_period_years').notNull(),
  intensityMmH: real('intensity_mm_h').notNull(),
  rainfallMm: real('rainfall_mm').notNull(),
  montanaA: real('montana_a'),
  montanaB: real('montana_b'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  type: text('type').default('HYDRAULIC_CALCULATION_NOTE').notNull(),
  status: text('status').default('DRAFT').notNull(),
  content: text('content').notNull(), // JSON
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const workflow = sqliteTable('workflow', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  stepName: text('step_name').notNull(),
  status: text('status').default('PENDING').notNull(),
  validationNotes: text('validation_notes').default('').notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const projectsRelations = relations(projects, ({ many }) => ({
  studies: many(studies),
  watersheds: many(watersheds),
  structures: many(hydraulicStructures),
  reports: many(reports),
  workflowSteps: many(workflow)
}));
