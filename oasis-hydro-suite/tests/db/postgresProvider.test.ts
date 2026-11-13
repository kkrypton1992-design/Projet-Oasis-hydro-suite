import { describe, expect, it, vi } from 'vitest';
import { PostgresDatabaseProvider } from '../../src/db/postgres/postgresProvider';

const mockQuery = vi.fn();
const mockEnd = vi.fn(async () => {});
const mockOn = vi.fn();

vi.mock('pg', () => {
  class MockPool {
    query = mockQuery;
    end = mockEnd;
    on = mockOn;
  }
  return { Pool: MockPool };
});

describe('PostgresDatabaseProvider (mode serveur optionnel)', () => {
  const sampleDbConfig = {
    providerPreference: 'postgres' as const,
    dialect: 'postgres' as const,
    sqlitePath: './data/unused.sqlite',
    host: 'pg.internal.local',
    port: 5432,
    user: 'oasis_srv',
    password: 'secret',
    database: 'oasis_prod',
    maxConnections: 10,
    connectionTimeoutMs: 5000
  };

  it('retourne connected=true et dialect="postgres" lors d’un readiness check réussi', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
    const provider = new PostgresDatabaseProvider(sampleDbConfig);

    expect(provider.dialect).toBe('postgres');
    expect(provider.storageLocation).toBe('pg.internal.local:5432/oasis_prod');

    const ready = await provider.checkReadiness();
    expect(ready.connected).toBe(true);
    expect(ready.dialect).toBe('postgres');
    expect(ready.storageLocation).toBe('pg.internal.local:5432/oasis_prod');

    await provider.close();
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });

  it('retourne connected=false avec erreur explicite si PostgreSQL est injoignable', async () => {
    mockQuery.mockRejectedValueOnce(new Error('ECONNREFUSED 127.0.0.1:5432'));
    const provider = new PostgresDatabaseProvider(sampleDbConfig);

    const ready = await provider.checkReadiness();
    expect(ready.connected).toBe(false);
    expect(ready.dialect).toBe('postgres');
    expect(ready.error).toContain('ECONNREFUSED');

    await provider.close();
  });
});
