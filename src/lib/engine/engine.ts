// The engine adapter interface. Operations/UI depend on this, never on a
// concrete engine by name — see select-engine.ts, which picks an
// implementation by table size.
import type { OperationInvocation } from '../core/types';
import type { Table } from '../core/table';

export interface Engine {
	readonly name: 'arquero' | 'duckdb';
	applyLog(table: Table, log: ReadonlyArray<OperationInvocation>): Promise<Table>;
}
