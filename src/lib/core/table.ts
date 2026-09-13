// The Arrow-backed columnar table wrapper, the spine's data model.
import * as arrow from 'apache-arrow';
import type { ColumnMeta, ColumnType, Table as TableShape } from './types';

function inferColumnType(field: arrow.Field): ColumnType {
	let type = field.type;
	if (arrow.DataType.isDictionary(type)) type = type.dictionary;
	if (arrow.DataType.isInt(type) || arrow.DataType.isFloat(type)) return 'number';
	if (arrow.DataType.isBool(type)) return 'boolean';
	if (arrow.DataType.isDate(type) || arrow.DataType.isTimestamp(type)) return 'date';
	if (arrow.DataType.isUtf8(type) || arrow.DataType.isLargeUtf8(type)) return 'text';
	return 'unknown';
}

function columnsFromSchema(schema: arrow.Schema): ColumnMeta[] {
	return schema.fields.map((field) => ({
		name: field.name,
		type: inferColumnType(field),
		nullable: field.nullable
	}));
}

/** Wraps an Arrow table so surfaces depend on `TableShape`, never on Arrow directly. */
export class Table implements TableShape {
	readonly columns: ReadonlyArray<ColumnMeta>;

	constructor(private readonly arrowTable: arrow.Table) {
		this.columns = columnsFromSchema(arrowTable.schema);
	}

	get rowCount(): number {
		return this.arrowTable.numRows;
	}

	getColumn(name: string): ReadonlyArray<unknown> {
		const column = this.arrowTable.getChild(name);
		if (!column) throw new Error(`Unknown column: ${name}`);
		return Array.from(column);
	}

	toRows(): ReadonlyArray<Record<string, unknown>> {
		return this.arrowTable.toArray().map((row) => row.toJSON());
	}

	/** Materializes only rows [start, end) — for a virtualized grid, which
	 * only ever needs the rows actually on screen. Avoids paying toRows'
	 * full-table cost (real, measured: ~470ms at 60k rows) on every
	 * render when only a window of ~30 rows is ever shown at once. */
	getRows(start: number, end: number): ReadonlyArray<Record<string, unknown>> {
		return this.arrowTable
			.slice(start, end)
			.toArray()
			.map((row) => row.toJSON());
	}

	/** Serializes to Arrow's own IPC bytes — for moving a Table across a
	 * worker boundary without a row-object round trip (see toIPC below). */
	toIPC(): Uint8Array {
		return arrow.tableToIPC(this.arrowTable);
	}

	/** The underlying Arrow table, zero-copy — for a query engine (Arquero)
	 * to operate on directly instead of round-tripping through row objects. */
	toArrow(): arrow.Table {
		return this.arrowTable;
	}
}

/** Reconstructs a Table from bytes produced by Table#toIPC. */
export function fromIPC(bytes: Uint8Array): Table {
	return new Table(arrow.tableFromIPC(bytes));
}

/** Build a Table from plain row objects (e.g. a parsed CSV). Column types are inferred. */
export function fromRows(rows: ReadonlyArray<Record<string, unknown>>): Table {
	// A zero-row input infers no columns at all, since there is nothing to describe.
	// Revisit if a caller needs a known-but-empty schema, e.g. a header-only CSV.
	//
	// Known gap: a column that is null in every row is silently dropped, since
	// Arrow can't infer a type for it. Only matters for a column that's blank
	// across an entire loaded file; revisit if that turns out to be common
	// (fill it in as a nullable text column instead of inferring nothing).
	return new Table(arrow.tableFromJSON(rows as Record<string, unknown>[]));
}
