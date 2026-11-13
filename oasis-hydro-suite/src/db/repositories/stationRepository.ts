/**
 * OASIS HYDRO SUITE — Repository Stations & Séries Pluviométriques
 * Délègue au DatabaseProvider actif (SQLite local ou PostgreSQL optionnel).
 */

import { getDatabaseProvider } from '../index.ts';
import { StationRecord } from '../provider.ts';

export async function getAllStations(): Promise<StationRecord[]> {
  const provider = await getDatabaseProvider();
  return provider.getAllStations();
}

export async function getSeriesByStationId(
  stationId: string
): Promise<Array<Record<string, unknown>>> {
  const provider = await getDatabaseProvider();
  return provider.getSeriesByStationId(stationId);
}
