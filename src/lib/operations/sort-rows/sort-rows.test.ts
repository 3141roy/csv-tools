import { describe, it, expect } from 'vitest';
import { fromRows } from '../../core/table';
import { sortRows } from './index';

const table = fromRows([
	{ name: 'Grace', signups: 3980 },
	{ name: 'Ada', signups: 4210 },
	{ name: 'Bug', signups: null },
	{ name: 'Tim', signups: 12 }
]);

describe('sort-rows', () => {
	it('sorts numbers ascending, nulls last', () => {
		const out = sortRows.apply(table, { column: 'signups', direction: 'asc' });
		expect(out.getColumn('name')).toEqual(['Tim', 'Grace', 'Ada', 'Bug']);
	});

	it('sorts numbers descending, nulls last', () => {
		const out = sortRows.apply(table, { column: 'signups', direction: 'desc' });
		expect(out.getColumn('name')).toEqual(['Ada', 'Grace', 'Tim', 'Bug']);
	});

	it('sorts text alphabetically', () => {
		const out = sortRows.apply(table, { column: 'name', direction: 'asc' });
		expect(out.getColumn('name')).toEqual(['Ada', 'Bug', 'Grace', 'Tim']);
	});

	it('is pure: leaves the source table untouched', () => {
		sortRows.apply(table, { column: 'signups', direction: 'asc' });
		expect(table.getColumn('name')).toEqual(['Grace', 'Ada', 'Bug', 'Tim']);
	});

	it('is stable: equal keys keep their relative order', () => {
		const tied = fromRows([
			{ name: 'a', plan: 'Pro' },
			{ name: 'b', plan: 'Free' },
			{ name: 'c', plan: 'Pro' }
		]);
		const out = sortRows.apply(tied, { column: 'plan', direction: 'asc' });
		expect(out.getColumn('name')).toEqual(['b', 'a', 'c']);
	});

	it('throws on an unknown column', () => {
		expect(() => sortRows.apply(table, { column: 'nope', direction: 'asc' })).toThrow(
			'Unknown column: nope'
		);
	});
});
