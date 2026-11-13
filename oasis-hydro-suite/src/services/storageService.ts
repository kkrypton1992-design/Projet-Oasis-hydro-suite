/**
 * OASIS HYDRO SUITE — Service de Stockage Navigateur & Export Fichiers
 * Responsabilité unique : Cache localStorage navigateur + export .oasis.json / .geojson
 */

import { createNewBlankProject, recalculateEntireProject } from '../core/projectEngine';
import { DEFAULT_REAL_PROJECT } from '../data/referenceProject';
import { Project } from '../types/oasis';

export { createNewBlankProject, DEFAULT_REAL_PROJECT, recalculateEntireProject };

const STORAGE_KEY = 'oasis_hydro_suite_active_project';

/**
 * Récupère le projet actif stocké localement dans le navigateur ou initialise le projet de référence.
 */
export function getStoredProject(): Project {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Project;
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return recalculateEntireProject(parsed);
      }
    }
  } catch (err) {
    console.warn('Cache local illisible, réinitialisation sur le projet de référence:', err);
  }

  const initialized = recalculateEntireProject(DEFAULT_REAL_PROJECT);
  saveProject(initialized);
  return initialized;
}

/**
 * Sauvegarde le projet recalculé dans le stockage local navigateur.
 */
export function saveProject(project: Project): Project {
  const recalculated = recalculateEntireProject(project);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recalculated));
    }
  } catch (err) {
    console.warn('Écriture localStorage impossible:', err);
  }
  return recalculated;
}

/**
 * Export du projet au format JSON téléchargeable (.oasis.json)
 */
export function exportProjectToJson(project: Project): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OASIS_${project.code}_${new Date().toISOString().slice(0, 10)}.oasis.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export des ouvrages et bassins au format GeoJSON standard pour SIG (QGIS, ArcGIS)
 */
export function exportProjectToGeoJson(project: Project): void {
  const features: Array<Record<string, unknown>> = [];

  project.watersheds.forEach((ws) => {
    if (ws.coordinates && ws.coordinates.length > 2) {
      const coords = ws.coordinates.map((pt) => [pt.lng, pt.lat]);
      if (
        coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1]
      ) {
        coords.push([coords[0][0], coords[0][1]]);
      }
      features.push({
        type: 'Feature',
        properties: {
          id: ws.id,
          code: ws.code,
          nom: ws.name,
          surface_km2: ws.areaKm2,
          longueur_km: ws.lengthKm,
          pente_pct: ws.slopePercent,
          coeff_c: ws.runoffCoefficient,
          tc_min: ws.calculatedTc?.chosenValueMin,
          q10_m3s: ws.calculatedFlows?.q10,
          q25_m3s: ws.calculatedFlows?.q25,
          q100_m3s: ws.calculatedFlows?.q100
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      });
    }
  });

  project.structures.forEach((st) => {
    features.push({
      type: 'Feature',
      properties: {
        id: st.id,
        code: st.code,
        pk_m: st.pkMeters,
        nom: st.name,
        type: st.type,
        materiau: st.material,
        q_projet_m3s: st.designFlowM3s,
        vitesse_ms: st.results?.flowVelocityMs,
        hauteur_eau_m: st.results?.normalDepthM,
        statut_conformite: st.results?.status,
        anomalies: st.results?.auditIssues?.join(' ; ')
      },
      geometry: {
        type: 'Point',
        coordinates: [st.position.lng, st.position.lat]
      }
    });
  });

  const geoJson = {
    type: 'FeatureCollection',
    name: `OASIS_HYDRO_SUITE_${project.code}`,
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features
  };

  const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OASIS_${project.code}_SIG_Couches.geojson`;
  a.click();
  URL.revokeObjectURL(url);
}
