import { describe, it, expect } from 'vitest';
import { fromRows } from '../../core/table';
import { tableToCsv } from './serialize';
import { parseCsv } from './parse';

describe('tableToCsv', () => {
	it('writes a header row and data rows', () => {
		const table = fromRows([
			{ name: 'Ada', signups: 4210 },
			{ name: 'Grace', signups: 3980 }
		]);
		expect(tableToCsv(table)).toBe('name,signups\nAda,4210\nGrace,3980\n');
	});

	it('quotes fields containing the delimiter, quotes, or newlines', () => {
		const table = fromRows([{ name: 'Ada, the first', bio: 'She said "hi"\nonce' }]);
		expect(tableToCsv(table)).toBe('name,bio\n"Ada, the first","She said ""hi""\nonce"\n');
	});

	it('writes null as an empty field', () => {
		// A column entirely null in every row is a separate, documented gap
		// (see table.ts) — apache-arrow can't infer its type and drops it.
		const table = fromRows([
			{ name: 'Ada', notes: null },
			{ name: 'Grace', notes: 'likes tea' }
		]);
		expect(tableToCsv(table)).toBe('name,notes\nAda,\nGrace,likes tea\n');
	});

	it('round-trips through parseCsv', () => {
		const original = fromRows([
			{ name: 'Ada', signups: 4210, active: true },
			{ name: 'Grace, PhD', signups: 3980, active: false }
		]);
		const { rows } = parseCsv(tableToCsv(original));
		expect(fromRows(rows).toRows()).toEqual(original.toRows());
	});

	it('returns just a newline for an empty table', () => {
		expect(tableToCsv(fromRows([]))).toBe('');
	});
});
