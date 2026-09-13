import { describe, it, expect } from 'vitest';
import { fromRows } from '../../core/table';
import { tableToJson } from './serialize';

describe('tableToJson', () => {
	it('writes an array of row objects', () => {
		const table = fromRows([
			{ name: 'Ada', signups: 4210, active: true },
			{ name: 'Grace', signups: 3980, active: false }
		]);
		expect(JSON.parse(tableToJson(table))).toEqual([
			{ name: 'Ada', signups: 4210, active: true },
			{ name: 'Grace', signups: 3980, active: false }
		]);
	});

	it('writes an empty array for an empty table', () => {
		expect(tableToJson(fromRows([]))).toBe('[]');
	});

	it('pretty-prints with two-space indentation', () => {
		const table = fromRows([{ name: 'Ada' }]);
		expect(tableToJson(table)).toBe('[\n  {\n    "name": "Ada"\n  }\n]');
	});
});
