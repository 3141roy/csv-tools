// The light-path engine: plain-TS/Arquero, already-loaded, no lazy import.
// Just delegates to the operation registry — filter-rows and sort-rows are
// themselves Arquero-backed.
import { registry } from '../core/operation-registry';
import { filterRows } from '../operations/filter-rows';
import { manifest as filterRowsManifest } from '../operations/filter-rows/manifest';
import { sortRows } from '../operations/sort-rows';
import { manifest as sortRowsManifest } from '../operations/sort-rows/manifest';
import { editCell } from '../operations/edit-cell';
import { manifest as editCellManifest } from '../operations/edit-cell/manifest';
import type { Engine } from './engine';
import type { Table } from '../core/table';

if (!registry.manifests().some((m) => m.id === 'filter-rows')) {
	registry.register(filterRows, filterRowsManifest);
	registry.register(sortRows, sortRowsManifest);
	registry.register(editCell, editCellManifest);
}

export const arqueroEngine: Engine = {
	name: 'arquero',
	async applyLog(table, log) {
		// The registry is typed against the abstract Table shape (so operations
		// never depend on the concrete class), but every operation actually
		// returns one — see filter-rows/sort-rows.
		return registry.applyLog(table, [...log]) as Table;
	}
};
