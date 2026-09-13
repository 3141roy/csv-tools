// Picks the engine by table size — the only place that decides. Operations
// never call Arquero or DuckDB by name; everything goes through here.
import { arqueroEngine } from './arquero-engine';
import type { Engine } from './engine';
import type { Table } from '../core/types';

// DuckDB is paused: three real bugs surfaced in a row (a Svelte $state
// Proxy that couldn't structured-clone, a cross-Arrow-version object that
// silently corrupted, a stale table across cached connections), and it
// hasn't had enough good runs yet to trust. Its code moved to engine/duckdb/
// (gitignored — not committed while unproven) rather than being deleted;
// DUCKDB_ROW_THRESHOLD set to Infinity routes every table through Arquero
// regardless of size until this is re-enabled on purpose.
export const DUCKDB_ROW_THRESHOLD = Infinity;

let duckdbEnginePromise: Promise<Engine> | null = null;

export async function selectEngine(table: Table): Promise<Engine> {
	if (table.rowCount < DUCKDB_ROW_THRESHOLD) return arqueroEngine;
	if (!duckdbEnginePromise) {
		duckdbEnginePromise = import('./duckdb/engine').then((m) => m.duckdbEngine);
	}
	return duckdbEnginePromise;
}
