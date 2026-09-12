// The engine adapter interface. Not wired up yet.
import type { Table } from '../core/types';

export interface Engine {
  readonly name: string; // 'light' | 'arquero' | 'sqljs' | 'duckdb'
  sort(table: Table, column: string, dir: 'asc' | 'desc'): Promise<Table>;
  // filter, aggregate, join, and an optional sql(query) surface for SQL-capable engines.
}
