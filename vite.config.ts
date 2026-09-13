import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// select-engine.ts dynamically import()s the DuckDB engine (only when a
	// table crosses the size threshold) — the default IIFE worker output
	// can't code-split, ES module workers can.
	worker: { format: 'es' }
});
