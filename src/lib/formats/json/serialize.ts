// Serializes a Table to JSON. Pure, no I/O.
import type { Table } from '../../core/types';

export interface JsonExportOptions {
	/** 'rows': one entry per row. 'columnar': one array per column. */
	shape?: 'rows' | 'columnar';
	pretty?: boolean;
	/** Only applies to shape 'rows': object-per-row (keyed by column name) vs array-per-row (values only). */
	namedKeys?: boolean;
}

function rowsToJson(table: Table, namedKeys: boolean): unknown {
	const names = table.columns.map((c) => c.name);
	return table.toRows().map((row) =>
		namedKeys ? Object.fromEntries(names.map((name) => [name, row[name]])) : names.map((name) => row[name])
	);
}

function columnarJson(table: Table): unknown {
	return Object.fromEntries(table.columns.map((c) => [c.name, table.getColumn(c.name)]));
}

export function tableToJson(table: Table, options: JsonExportOptions = {}): string {
	const { shape = 'rows', pretty = true, namedKeys = true } = options;
	const data = shape === 'columnar' ? columnarJson(table) : rowsToJson(table, namedKeys);
	return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}
