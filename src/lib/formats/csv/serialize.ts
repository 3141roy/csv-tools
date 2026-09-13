// Serializes a Table back to CSV text. Pure, no I/O.
import type { Table } from '../../core/types';

function field(value: unknown): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
	return str;
}

export function tableToCsv(table: Table): string {
	if (table.columns.length === 0) return '';
	const columns = table.columns.map((c) => c.name);
	const lines = [columns.map(field).join(',')];
	for (const row of table.toRows()) {
		lines.push(columns.map((col) => field(row[col])).join(','));
	}
	return lines.join('\n') + '\n';
}
