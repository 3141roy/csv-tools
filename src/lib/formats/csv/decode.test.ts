import { describe, it, expect } from 'vitest';
import { decodeBytes, ENCODINGS } from './decode';

describe('decodeBytes', () => {
	it('decodes UTF-8 bytes', () => {
		const bytes = new TextEncoder().encode('Café');
		expect(decodeBytes(bytes.buffer, 'utf-8')).toBe('Café');
	});

	it('decodes Windows-1252 bytes UTF-8 would mangle', () => {
		// 'é' in windows-1252 is the single byte 0xE9, invalid as a lone UTF-8 byte.
		const bytes = new Uint8Array([0x43, 0x61, 0x66, 0xe9]); // "Caf" + 0xE9
		expect(decodeBytes(bytes.buffer, 'windows-1252')).toBe('Café');
	});

	it('decodes ISO-8859-1 bytes', () => {
		const bytes = new Uint8Array([0x43, 0x61, 0x66, 0xe9]);
		expect(decodeBytes(bytes.buffer, 'iso-8859-1')).toBe('Café');
	});

	it('falls back to UTF-8 for an unrecognized label', () => {
		const bytes = new TextEncoder().encode('hello');
		expect(decodeBytes(bytes.buffer, 'not-a-real-encoding')).toBe('hello');
	});

	it('lists the supported encodings with labels', () => {
		expect(ENCODINGS.map((e) => e.value)).toEqual(['utf-8', 'windows-1252', 'iso-8859-1', 'utf-16le']);
	});
});
