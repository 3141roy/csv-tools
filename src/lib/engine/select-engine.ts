// Picks the engine by table size — the only place that decides. Operations
// never call Arquero or DuckDB by name; everything goes through here.
import { arqueroEngine } from './arquero-engine';
import type { Engine } from './engine';
import type { Table } from '../core/types';

// DuckDB is paused pending more testing (see engine/duckdb/, gitignored).
export const DUCKDB_ROW_THRESHOLD = Infinity;

export async function selectEngine(_table: Table): Promise<Engine> {
	return arqueroEngine;
}
