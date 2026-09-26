// Hands the currently-loaded, currently-filtered/sorted table off to another
// route (Convert) without re-parsing the file. The editor owns parsing and
// the whole worker pipeline; this is just the latest read-only snapshot of
// its output, mirrored here on every change (see the editor's `$effect`
// that assigns into it). Module-level runes state, so it survives client-side
// navigation between routes the way a page-local `$state` wouldn't.
import type { Table } from '$lib/core/table';

let table = $state.raw<Table | null>(null);
let fileName = $state('');

export const sharedDocument = {
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
	}
};
