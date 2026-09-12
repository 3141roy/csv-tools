// Shared vocabulary for the table model and the operation registry.

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'unknown';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  nullable: boolean;
  // provenance: which operation(s) produced/renamed this column, filled in over time.
}

/**
 * A columnar table. Backed by Apache Arrow (see table.ts); this interface
 * hides that so surfaces depend on the shape, not the storage.
 */
export interface Table {
  readonly columns: ReadonlyArray<ColumnMeta>;
  readonly rowCount: number;
  /** Read one column's values in row order. Throws on an unknown column name. */
  getColumn(name: string): ReadonlyArray<unknown>;
  /** Materialize every row as a plain object, for the grid, export, and tests. */
  toRows(): ReadonlyArray<Record<string, unknown>>;
}

/** Serializable params: a plain JSON object fully describing one operation instance. */
export type OperationParams = Record<string, unknown>;

/** A pure, serializable table transform. The unit the whole app is built from. */
export interface Operation<P extends OperationParams = OperationParams> {
  readonly id: string; // matches its manifest id
  apply(table: Table, params: P): Table; // pure: no I/O, no DOM, no ambient nondeterminism
}

/** Metadata that lets the UI render an operation without knowing about it specifically. */
export interface OperationManifest<P extends OperationParams = OperationParams> {
  id: string;
  category: 'edit' | 'filter' | 'sort' | 'reshape' | 'combine' | 'convert' | 'inspect';
  // A schema describing P for validation and for auto-generating pipeline/menu UI.
  paramsSchema: unknown; // TODO: pick a schema representation (e.g. a small JSON-schema subset)
  surfaces: Array<'editor' | 'pipeline' | 'convert'>;
}

/** One entry in the operation log. A log is just OperationInvocation[], the pipeline, serialized. */
export interface OperationInvocation<P extends OperationParams = OperationParams> {
  opId: string;
  params: P;
  enabled: boolean;
}
