// Pure: (table, params) => table. Finds the row by its hidden row-id (see
// ROW_ID_COLUMN in table.ts) rather than a display index, so an edit always
// lands on the right row regardless of any active filter/sort. Rebuilds the
// whole table the same way filter-rows/sort-rows do — a single-cell edit is
// the same O(n) cost class as those, not worth a special-cased fast path.
import type { Operation, Table } from '../../core/types';
import { fromRows, ROW_ID_COLUMN } from '../../core/table';
import type { EditCellParams } from './manifest';

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === '';
}

export const editCell: Operation<EditCellParams> = {
	id: 'edit-cell',
	apply(table: Table, params: EditCellParams): Table {
		const colMeta = table.columns.find((c) => c.name === params.column);
		if (!colMeta) throw new Error(`Unknown column: ${params.column}`);

		let value = params.value;
		if (colMeta.type === 'number' && !isEmpty(value)) {
			const n = Number(value);
			if (Number.isNaN(n)) throw new Error(`"${value}" is not a number`);
			value = n;
		}
		if (isEmpty(value)) value = null;

		const rows = table.toRows().map((row) => ({ ...row }));
		const idx = rows.findIndex((r) => r[ROW_ID_COLUMN] === params.rowId);
		if (idx === -1) throw new Error(`Row ${params.rowId} not found`);
		rows[idx][params.column] = value;

		return fromRows(rows);
	}
};
