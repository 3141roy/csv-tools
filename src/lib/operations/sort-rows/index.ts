// Pure: (table, params) => table.
import type { Operation, Table } from '../../core/types';
import { fromRows } from '../../core/table';
import type { SortRowsParams } from './manifest';

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === '';
}

function compareValues(a: unknown, b: unknown): number {
	if (typeof a === 'number' && typeof b === 'number') return a - b;
	if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
	return String(a).localeCompare(String(b));
}

export const sortRows: Operation<SortRowsParams> = {
	id: 'sort-rows',
	apply(table: Table, params: SortRowsParams): Table {
		if (!table.columns.some((c) => c.name === params.column)) {
			throw new Error(`Unknown column: ${params.column}`);
		}
		const sign = params.direction === 'desc' ? -1 : 1;
		const sorted = table
			.toRows()
			.map((row, index) => ({ row, index })) // stable sort: tie-break on original position
			.sort((a, b) => {
				const av = a.row[params.column];
				const bv = b.row[params.column];
				const aEmpty = isEmpty(av);
				const bEmpty = isEmpty(bv);
				// Empties always sort last, regardless of direction.
				if (aEmpty || bEmpty) {
					if (aEmpty && bEmpty) return a.index - b.index;
					return aEmpty ? 1 : -1;
				}
				const cmp = compareValues(av, bv) * sign;
				return cmp !== 0 ? cmp : a.index - b.index;
			})
			.map(({ row }) => row);
		return fromRows(sorted);
	}
};
