// Pure: (table, params) => table. Uses Arquero so filtering
// reads only the columns it needs off the underlying Arrow buffers, instead
// of a hand-rolled toRows() that materializes every column of every row.
import * as aq from 'arquero';
import type { Operation, Table } from '../../core/types';
import { Table as ArrowTable, fromRows } from '../../core/table';
import type { FilterRowsParams } from './manifest';

function matches(cellValue: unknown, params: FilterRowsParams): boolean {
	const { operator, value } = params;
	switch (operator) {
		case 'isEmpty':
			return cellValue === null || cellValue === undefined || cellValue === '';
		case 'notEmpty':
			return !(cellValue === null || cellValue === undefined || cellValue === '');
		case 'eq':
			return cellValue === value;
		case 'neq':
			return cellValue !== value;
		case 'contains':
			return String(cellValue ?? '').includes(String(value ?? ''));
		case 'gte':
			return typeof cellValue === 'number' && typeof value === 'number' && cellValue >= value;
		case 'lte':
			return typeof cellValue === 'number' && typeof value === 'number' && cellValue <= value;
	}
}

export const filterRows: Operation<FilterRowsParams> = {
	id: 'filter-rows',
	apply(table: Table, params: FilterRowsParams): Table {
		if (!table.columns.some((c) => c.name === params.column)) {
			throw new Error(`Unknown column: ${params.column}`);
		}
		// Arquero types its Arrow interop against its own bundled Arrow reader
		// (Flechette), not the apache-arrow package we use elsewhere — the two
		// are runtime-interoperable as *input* (same IPC format) but not the
		// same TS nominal type, hence the cast through `unknown` here.
		const dt = aq.fromArrow((table as ArrowTable).toArrow() as unknown as Parameters<typeof aq.fromArrow>[0]);
		const filtered = dt.filter(aq.escape((d: Record<string, unknown>) => matches(d[params.column], params)));
		// Deliberately NOT filtered.toArrow(): confirmed by direct reproduction
		// that Arquero's own toArrow() output is not a real apache-arrow
		// Table — arrow.tableToIPC() on it silently writes 0 bytes (no
		// error), and anything built from it (getRows, export, a second
		// operation) then breaks on "Cannot read properties of undefined"
		// inside apache-arrow's internals. .objects() is Arquero's own,
		// correct, plain-row accessor; fromRows() rebuilds a genuine table
		// from it the same way the initial CSV parse does.
		return fromRows(filtered.objects() as Record<string, unknown>[]);
	}
};
