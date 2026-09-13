// Per-column quick-overview profile: type, % empty, unique, min/max, shape.
// Pure, read-only — this is the "inspect" job, not a mutation, so it has
// no place in the operation registry. It just reads a column's values.

export interface ColumnStats {
	emptyCount: number;
	emptyPct: number;
	uniqueCount: number;
	min: number | string | null;
	max: number | string | null;
	/** 8-bucket counts across the value range. Numeric columns only, empty otherwise. */
	histogram: number[];
}

const HISTOGRAM_BUCKETS = 8;

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === '';
}

export function columnStats(values: ReadonlyArray<unknown>): ColumnStats {
	const present = values.filter((v) => !isEmpty(v));
	const emptyCount = values.length - present.length;
	const emptyPct = values.length === 0 ? 0 : Math.round((emptyCount / values.length) * 100);
	const uniqueCount = new Set(present).size;

	let min: number | string | null = null;
	let max: number | string | null = null;
	for (const value of present) {
		if (typeof value !== 'number' && typeof value !== 'string') continue;
		if (min === null || value < min) min = value;
		if (max === null || value > max) max = value;
	}

	const numbers = present.filter((v): v is number => typeof v === 'number');
	const histogram =
		numbers.length > 1 && typeof min === 'number' && typeof max === 'number' && max > min
			? buildHistogram(numbers, min, max)
			: [];

	return { emptyCount, emptyPct, uniqueCount, min, max, histogram };
}

function buildHistogram(numbers: number[], min: number, max: number): number[] {
	const buckets = new Array(HISTOGRAM_BUCKETS).fill(0);
	const width = (max - min) / HISTOGRAM_BUCKETS;
	for (const n of numbers) {
		const index = Math.min(HISTOGRAM_BUCKETS - 1, Math.floor((n - min) / width));
		buckets[index]++;
	}
	return buckets;
}
