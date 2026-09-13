import { describe, it, expect } from 'vitest';
import { columnStats } from './column-stats';

describe('columnStats', () => {
	it('counts empty values (null, undefined, blank string)', () => {
		const stats = columnStats([1, null, 2, undefined, 3, '']);
		expect(stats.emptyCount).toBe(3);
		expect(stats.emptyPct).toBe(50);
	});

	it('counts unique non-empty values', () => {
		const stats = columnStats(['a', 'b', 'a', null, 'b', 'c']);
		expect(stats.uniqueCount).toBe(3);
	});

	it('finds numeric min/max, ignoring empties', () => {
		const stats = columnStats([4210, 3980, null, 12, 1530]);
		expect(stats.min).toBe(12);
		expect(stats.max).toBe(4210);
	});

	it('finds lexicographic min/max for text', () => {
		const stats = columnStats(['Grace', 'Ada', null, 'Tim']);
		expect(stats.min).toBe('Ada');
		expect(stats.max).toBe('Tim');
	});

	it('returns null min/max for an all-empty column', () => {
		const stats = columnStats([null, undefined, '']);
		expect(stats.min).toBeNull();
		expect(stats.max).toBeNull();
	});

	it('buckets numeric values into a histogram', () => {
		const stats = columnStats([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
		expect(stats.histogram).toHaveLength(8);
		expect(stats.histogram.reduce((a, b) => a + b, 0)).toBe(11);
	});

	it('leaves the histogram empty for non-numeric columns', () => {
		const stats = columnStats(['Ada', 'Grace']);
		expect(stats.histogram).toEqual([]);
	});

	it('leaves the histogram empty when every value is the same number', () => {
		const stats = columnStats([5, 5, 5]);
		expect(stats.histogram).toEqual([]);
	});
});
