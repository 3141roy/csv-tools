import { describe, it, expect } from 'vitest';
import { OperationRegistry } from './operation-registry';
import { fromRows } from './table';
import { filterRows } from '../operations/filter-rows';
import { manifest as filterRowsManifest } from '../operations/filter-rows/manifest';

describe('OperationRegistry', () => {
	const table = fromRows([{ n: 1 }, { n: 2 }, { n: 3 }]);

	it('applies a registered operation', () => {
		const registry = new OperationRegistry();
		registry.register(filterRows, filterRowsManifest);
		const out = registry.applyOne(table, {
			opId: 'filter-rows',
			params: { column: 'n', operator: 'gte', value: 2 },
			enabled: true
		});
		expect(out.rowCount).toBe(2);
	});

	it('skips disabled invocations', () => {
		const registry = new OperationRegistry();
		registry.register(filterRows, filterRowsManifest);
		const out = registry.applyOne(table, {
			opId: 'filter-rows',
			params: { column: 'n', operator: 'gte', value: 2 },
			enabled: false
		});
		expect(out).toBe(table);
	});

	it('replays a log of operations in order (the pipeline)', () => {
		const registry = new OperationRegistry();
		registry.register(filterRows, filterRowsManifest);
		const out = registry.applyLog(table, [
			{ opId: 'filter-rows', params: { column: 'n', operator: 'gte', value: 2 }, enabled: true },
			{ opId: 'filter-rows', params: { column: 'n', operator: 'lte', value: 2 }, enabled: true }
		]);
		expect(out.rowCount).toBe(1);
		expect(out.getColumn('n')).toEqual([2]);
	});

	it('rejects a duplicate operation id', () => {
		const registry = new OperationRegistry();
		registry.register(filterRows, filterRowsManifest);
		expect(() => registry.register(filterRows, filterRowsManifest)).toThrow(
			'Duplicate operation id: filter-rows'
		);
	});

	it('throws on an unknown operation id', () => {
		const registry = new OperationRegistry();
		expect(() =>
			registry.applyOne(table, { opId: 'nope', params: {}, enabled: true })
		).toThrow('Unknown operation: nope');
	});
});
