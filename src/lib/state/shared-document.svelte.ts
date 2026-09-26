// The editor's loaded-file state, lifted out of the route component so it
// survives navigating to Convert and back instead of resetting on remount.
import type { Table } from '$lib/core/table';
import type { CsvParseOptions } from '$lib/formats/csv/parse';
import type { FilterRowsParams } from '$lib/operations/filter-rows/manifest';

export type FilterPill = { id: number; params: FilterRowsParams };
export type SortState = { column: string; direction: 'asc' | 'desc' } | null;

let rawBytes = $state<ArrayBuffer | null>(null);
let sourceTable = $state.raw<Table | null>(null);
let table = $state.raw<Table | null>(null); // displayed (filtered/sorted) table
let fileName = $state('');
let parseOptions = $state<CsvParseOptions>({ hasHeader: true });
let encoding = $state('utf-8');
let filters = $state<FilterPill[]>([]);
let sort = $state<SortState>(null);

export const sharedDocument = {
	get rawBytes() {
		return rawBytes;
	},
	set rawBytes(value: ArrayBuffer | null) {
		rawBytes = value;
	},
	get sourceTable() {
		return sourceTable;
	},
	set sourceTable(value: Table | null) {
		sourceTable = value;
	},
	get table() {
		return table;
	},
	set table(value: Table | null) {
		table = value;
	},
	get fileName() {
		return fileName;
	},
	set fileName(value: string) {
		fileName = value;
	},
	get parseOptions() {
		return parseOptions;
	},
	set parseOptions(value: CsvParseOptions) {
		parseOptions = value;
	},
	get encoding() {
		return encoding;
	},
	set encoding(value: string) {
		encoding = value;
	},
	get filters() {
		return filters;
	},
	set filters(value: FilterPill[]) {
		filters = value;
	},
	get sort() {
		return sort;
	},
	set sort(value: SortState) {
		sort = value;
	}
};
