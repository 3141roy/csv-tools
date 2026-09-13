import { describe, it, expect } from 'vitest';
import { fromRows, ROW_ID_COLUMN } from '../../core/table';
import { editCell } from './index';
import { filterRows } from '../filter-rows';
import { sortRows } from '../sort-rows';

const rows = [
	{ name: 'Ada', signups: 4210, [ROW_ID_COLUMN]: 0 },
	{ name: 'Grace', signups: 3980, [ROW_ID_COLUMN]: 1 },
	{ name: 'Bug', signups: 12, [ROW_ID_COLUMN]: 2 }
];

describe('edit-cell', () => {
	it('changes one cell, leaves the rest alone', () => {
		const table = fromRows(rows);
		const out = editCell.apply(table, { rowId: 1, column: 'name', value: 'Grace H.' });
		expect(out.getColumn('name')).toEqual(['Ada', 'Grace H.', 'Bug']);
		expect(out.getColumn('signups')).toEqual([4210, 3980, 12]);
	});

	it('is pure: leaves the source table untouched', () => {
		const table = fromRows(rows);
		editCell.apply(table, { rowId: 0, column: 'name', value: 'Changed' });
		expect(table.getColumn('name')).toEqual(['Ada', 'Grace', 'Bug']);
	});

	it('coerces a valid number into a number column', () => {
		const table = fromRows(rows);
		const out = editCell.apply(table, { rowId: 2, column: 'signups', value: '99' });
		expect(out.getColumn('signups')).toEqual([4210, 3980, 99]);
	});

	it('rejects an invalid number', () => {
		const table = fromRows(rows);
		expect(() => editCell.apply(table, { rowId: 0, column: 'signups', value: 'abc' })).toThrow(
			'"abc" is not a number'
		);
	});

	it('clears a cell to null on an empty value', () => {
		const table = fromRows(rows);
		const out = editCell.apply(table, { rowId: 0, column: 'signups', value: '' });
		expect(out.getColumn('signups')).toEqual([null, 3980, 12]);
	});

	it('throws on an unknown column', () => {
		const table = fromRows(rows);
		expect(() => editCell.apply(table, { rowId: 0, column: 'nope', value: 'x' })).toThrow(
			'Unknown column: nope'
		);
	});

	it('throws on an unknown row id', () => {
		const table = fromRows(rows);
		expect(() => editCell.apply(table, { rowId: 999, column: 'name', value: 'x' })).toThrow(
			'Row 999 not found'
		);
	});

	it('hides the row-id column from the public column list', () => {
		const table = fromRows(rows);
		expect(table.columns.map((c) => c.name)).toEqual(['name', 'signups']);
	});

	it('still finds the right row after a filter', () => {
		const table = fromRows(rows);
		const filtered = filterRows.apply(table, { column: 'signups', operator: 'gte', value: 100 });
		// "Bug" (rowId 2) is filtered out; edit the surviving row that was
		// originally second (Grace, rowId 1) and confirm it lands correctly.
		const out = editCell.apply(filtered, { rowId: 1, column: 'name', value: 'Grace H.' });
		expect(out.getColumn('name')).toEqual(['Ada', 'Grace H.']);
	});

	it('still finds the right row after a sort', () => {
		const table = fromRows(rows);
		const sorted = sortRows.apply(table, { column: 'signups', direction: 'asc' });
		// Ascending puts Bug (12, rowId 2) first, Ada (4210, rowId 0) last.
		const out = editCell.apply(sorted, { rowId: 0, column: 'name', value: 'Ada H.' });
		expect(out.getColumn('name')).toEqual(['Bug', 'Grace', 'Ada H.']);
	});
});
