// Parses raw CSV text into rows ready for Table.fromRows. Pure, no I/O.

export interface CsvParseOptions {
	/** ',' | ';' | '\t' — auto-detected from the first line when omitted. */
	delimiter?: string;
	/** Whether the first row is a header. Defaults to true. */
	hasHeader: boolean;
}

export interface CsvParseResult {
	columns: string[];
	rows: Record<string, unknown>[];
	delimiter: string;
}

const CANDIDATE_DELIMITERS = [',', ';', '\t'];

function detectDelimiter(text: string): string {
	const firstLine = text.split(/\r\n|\r|\n/, 1)[0] ?? '';
	let best = CANDIDATE_DELIMITERS[0];
	let bestCount = -1;
	for (const candidate of CANDIDATE_DELIMITERS) {
		const count = firstLine.split(candidate).length - 1;
		if (count > bestCount) {
			best = candidate;
			bestCount = count;
		}
	}
	return best;
}

/** RFC 4180 tokenizer: quoted fields, embedded delimiters/newlines, "" as an escaped quote. */
function tokenize(text: string, delimiter: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;
	let i = 0;

	while (i < text.length) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += ch;
			i++;
			continue;
		}
		if (ch === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (ch === delimiter) {
			row.push(field);
			field = '';
			i++;
			continue;
		}
		if (ch === '\r') {
			i++; // normalize CRLF/CR; \n (below) ends the row
			continue;
		}
		if (ch === '\n') {
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
			i++;
			continue;
		}
		field += ch;
		i++;
	}
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

/** Numbers and booleans become real values (so Table.fromRows infers real types); blank becomes null. */
function coerce(value: string): unknown {
	const trimmed = value.trim();
	if (trimmed === '') return null;
	if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
	if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
	return value;
}

export function parseCsv(text: string, options: Partial<CsvParseOptions> = {}): CsvParseResult {
	const delimiter = options.delimiter ?? detectDelimiter(text);
	const hasHeader = options.hasHeader ?? true;

	// A lone trailing blank line (from a final newline) isn't a data row.
	const tokenized = tokenize(text, delimiter).filter(
		(fields) => !(fields.length === 1 && fields[0] === '')
	);
	if (tokenized.length === 0) return { columns: [], rows: [], delimiter };

	const columns = hasHeader ? tokenized[0] : tokenized[0].map((_, i) => `column_${i + 1}`);
	const dataRows = hasHeader ? tokenized.slice(1) : tokenized;

	// ponytail: a row shorter than the header fills missing cells with null;
	// a row longer than the header drops the extra fields. Good enough for
	// v1 — a real "ragged CSV" warning belongs to the file-open UI, not here.
	const rows = dataRows.map((fields) => {
		const row: Record<string, unknown> = {};
		columns.forEach((col, i) => {
			row[col] = coerce(fields[i] ?? '');
		});
		return row;
	});

	return { columns, rows, delimiter };
}
