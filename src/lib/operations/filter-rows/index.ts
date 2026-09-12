// Pure: (table, params) => table.
import type { Operation, Table } from '../../core/types';
import { fromRows } from '../../core/table';
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
		const kept = table.toRows().filter((row) => matches(row[params.column], params));
		return fromRows(kept);
	}
};
