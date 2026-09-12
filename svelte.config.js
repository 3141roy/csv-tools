import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Pure static output, no server runtime — required by the privacy promise (ADR-0002).
		adapter: adapter({
			fallback: '200.html' // SPA fallback for client-side routing
		})
	}
};

export default config;
