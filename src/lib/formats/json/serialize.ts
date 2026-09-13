// Serializes a Table to a JSON array of row objects. Pure, no I/O.
import type { Table } from '../../core/types';

export function tableToJson(table: Table): string {
	// Built from table.columns, not the raw row objects, so a hidden
	// internal column (the row-id edit-cell relies on) never leaks out.
	const names = table.columns.map((c) => c.name);
	const rows = table.toRows().map((row) => Object.fromEntries(names.map((name) => [name, row[name]])));
	return JSON.stringify(rows, null, 2);
}
