import { describe, it, expect } from 'vitest';
import { parseCsv } from './parse';
import { fromRows } from '../../core/table';

describe('parseCsv', () => {
	it('parses a simple comma-delimited file with a header', () => {
		const result = parseCsv('name,signups\nAda,4210\nGrace,3980\n');
		expect(result.delimiter).toBe(',');
		expect(result.columns).toEqual(['name', 'signups']);
		expect(result.rows).toEqual([
			{ name: 'Ada', signups: 4210 },
			{ name: 'Grace', signups: 3980 }
		]);
	});

	it('coerces numbers and booleans, and empty fields to null', () => {
		const result = parseCsv('name,active,notes\nAda,true,\nBug,false,\n');
		expect(result.rows).toEqual([
			{ name: 'Ada', active: true, notes: null },
			{ name: 'Bug', active: false, notes: null }
		]);
	});

	it('handles quoted fields containing the delimiter, newlines, and escaped quotes', () => {
		const result = parseCsv('name,bio\n"Ada, the first","He said ""hi""\nline two"""\n');
		expect(result.rows).toEqual([{ name: 'Ada, the first', bio: 'He said "hi"\nline two"' }]);
	});

	it('auto-detects a semicolon delimiter', () => {
		const result = parseCsv('name;signups\nAda;4210\n');
		expect(result.delimiter).toBe(';');
		expect(result.rows).toEqual([{ name: 'Ada', signups: 4210 }]);
	});

	it('auto-detects a tab delimiter', () => {
		const result = parseCsv('name\tsignups\nAda\t4210\n');
		expect(result.delimiter).toBe('\t');
		expect(result.rows).toEqual([{ name: 'Ada', signups: 4210 }]);
	});

	it('generates column names when hasHeader is false', () => {
		const result = parseCsv('Ada,4210\nGrace,3980\n', { hasHeader: false });
		expect(result.columns).toEqual(['column_1', 'column_2']);
		expect(result.rows).toEqual([
			{ column_1: 'Ada', column_2: 4210 },
			{ column_1: 'Grace', column_2: 3980 }
		]);
	});

	it('respects an explicit delimiter override', () => {
		const result = parseCsv('a,b;c\n1,2;3\n', { delimiter: ';' });
		expect(result.columns).toEqual(['a,b', 'c']);
	});

	it('returns nothing for empty input', () => {
		expect(parseCsv('')).toEqual({ columns: [], rows: [], delimiter: ',' });
	});

	it('feeds straight into Table.fromRows with correct types', () => {
		const { rows } = parseCsv('name,signups,active\nAda,4210,true\n');
		const table = fromRows(rows);
		expect(table.columns).toEqual([
			{ name: 'name', type: 'text', nullable: true },
			{ name: 'signups', type: 'number', nullable: true },
			{ name: 'active', type: 'boolean', nullable: true }
		]);
	});
});
