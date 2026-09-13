// Decodes raw file bytes to text in a chosen encoding. Pure (given the bytes).
// A CSV exported from older tools (Excel on Windows, mainly) often isn't
// UTF-8 — reading it as UTF-8 either throws or silently mangles accented
// characters, so the caller needs the original bytes, not File.text().

export interface EncodingOption {
	value: string;
	label: string;
}

export const ENCODINGS: EncodingOption[] = [
	{ value: 'utf-8', label: 'UTF-8' },
	{ value: 'windows-1252', label: 'Windows-1252' },
	{ value: 'iso-8859-1', label: 'ISO-8859-1' },
	{ value: 'utf-16le', label: 'UTF-16LE' }
];

export function decodeBytes(buffer: ArrayBuffer, encoding: string): string {
	try {
		return new TextDecoder(encoding).decode(buffer);
	} catch {
		return new TextDecoder('utf-8').decode(buffer);
	}
}
