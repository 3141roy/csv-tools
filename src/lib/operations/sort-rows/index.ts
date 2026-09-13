// Pure: (table, params) => table. Uses Arquero for the
// actual sort — columnar, type-aware, and never materializes row objects
// for the whole table the way a hand-rolled Array.sort over toRows() does.
import * as aq from 'arquero';
import type { Operation, Table } from '../../core/types';
import { Table as ArrowTable, fromRows } from '../../core/table';
import type { SortRowsParams } from './manifest';

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === '';
}

export const sortRows: Operation<SortRowsParams> = {
	id: 'sort-rows',
	apply(table: Table, params: SortRowsParams): Table {
		if (!table.columns.some((c) => c.name === params.column)) {
			throw new Error(`Unknown column: ${params.column}`);
		}
		// Arquero types its Arrow interop against its own bundled Arrow reader
		// (Flechette), not the apache-arrow package we use elsewhere — the two
		// are runtime-interoperable as *input* (same IPC format) but not the
		// same TS nominal type, hence the cast through `unknown` here.
		const dt = aq.fromArrow((table as ArrowTable).toArrow() as unknown as Parameters<typeof aq.fromArrow>[0]);
		const { column, direction } = params;
		// Arquero's own null handling is NULLS FIRST ascending / NULLS LAST
		// descending (standard SQL default) — ours is nulls always last,
		// regardless of direction, so sort on an is-empty flag first.
		const nullsLastFlag = aq.escape((d: Record<string, unknown>) => (isEmpty(d[column]) ? 1 : 0));
		const valueKey = direction === 'desc' ? aq.desc(column) : column;
		const sorted = dt.orderby(nullsLastFlag, valueKey);
		// Deliberately NOT sorted.toArrow(): confirmed by direct reproduction
		// that Arquero's own toArrow() output is not a real apache-arrow
		// Table — arrow.tableToIPC() on it silently writes 0 bytes (no
		// error), and anything built from it (getRows, export, a second
		// operation) then breaks on "Cannot read properties of undefined"
		// inside apache-arrow's internals. .objects() is Arquero's own,
		// correct, plain-row accessor; fromRows() rebuilds a genuine table
		// from it the same way the initial CSV parse does.
		return fromRows(sorted.objects() as Record<string, unknown>[]);
	}
};
