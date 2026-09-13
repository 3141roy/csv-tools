// Serializes a Table to a JSON array of row objects. Pure, no I/O.
import type { Table } from '../../core/types';

export function tableToJson(table: Table): string {
	return JSON.stringify(table.toRows(), null, 2);
}
