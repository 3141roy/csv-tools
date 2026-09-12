import { describe, it, expect } from 'vitest';
import { fromRows } from './table';

describe('Table.fromRows', () => {
	const rows = [
		{ name: 'Ada', signups: 4210, active: true },
		{ name: 'Grace', signups: 3980, active: false }
	];

	it('infers column types', () => {
		const table = fromRows(rows);
		expect(table.columns).toEqual([
			{ name: 'name', type: 'text', nullable: true },
			{ name: 'signups', type: 'number', nullable: true },
			{ name: 'active', type: 'boolean', nullable: true }
		]);
	});

	it('reports rowCount', () => {
		expect(fromRows(rows).rowCount).toBe(2);
	});

	it('reads a column in row order', () => {
		expect(fromRows(rows).getColumn('signups')).toEqual([4210, 3980]);
	});

	it('throws on an unknown column', () => {
		expect(() => fromRows(rows).getColumn('nope')).toThrow('Unknown column: nope');
	});

	it('round-trips rows', () => {
		expect(fromRows(rows).toRows()).toEqual(rows);
	});

	it('handles zero rows', () => {
		const empty = fromRows([]);
		expect(empty.rowCount).toBe(0);
		expect(empty.columns).toEqual([]);
		expect(empty.toRows()).toEqual([]);
	});
});
