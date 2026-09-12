import { describe, it, expect } from 'vitest';
import { fromRows } from '../../core/table';
import { filterRows } from './index';

const table = fromRows([
	{ name: 'Ada', signups: 4210, status: 'active' },
	{ name: 'Grace', signups: 3980, status: 'active' },
	{ name: 'Bug', signups: 12, status: '' }
]);

describe('filter-rows', () => {
	it('keeps rows where signups >= 100', () => {
		const out = filterRows.apply(table, { column: 'signups', operator: 'gte', value: 100 });
		expect(out.rowCount).toBe(2);
		expect(out.getColumn('name')).toEqual(['Ada', 'Grace']);
	});

	it('keeps rows where signups <= 3980', () => {
		const out = filterRows.apply(table, { column: 'signups', operator: 'lte', value: 3980 });
		expect(out.getColumn('name')).toEqual(['Grace', 'Bug']);
	});

	it('matches equality', () => {
		const out = filterRows.apply(table, { column: 'name', operator: 'eq', value: 'Ada' });
		expect(out.rowCount).toBe(1);
	});

	it('matches inequality', () => {
		const out = filterRows.apply(table, { column: 'name', operator: 'neq', value: 'Ada' });
		expect(out.rowCount).toBe(2);
	});

	it('matches substring with contains', () => {
		const out = filterRows.apply(table, { column: 'name', operator: 'contains', value: 'a' });
		expect(out.getColumn('name')).toEqual(['Ada', 'Grace']);
	});

	it('matches isEmpty / notEmpty', () => {
		expect(filterRows.apply(table, { column: 'status', operator: 'isEmpty' }).rowCount).toBe(1);
		expect(filterRows.apply(table, { column: 'status', operator: 'notEmpty' }).rowCount).toBe(2);
	});

	it('is pure: leaves the source table untouched', () => {
		filterRows.apply(table, { column: 'signups', operator: 'gte', value: 100 });
		expect(table.rowCount).toBe(3);
	});

	it('throws on an unknown column', () => {
		expect(() => filterRows.apply(table, { column: 'nope', operator: 'eq', value: 'x' })).toThrow(
			'Unknown column: nope'
		);
	});
});
