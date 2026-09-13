<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import '$lib/styles/design-tokens.css';
	import '$lib/styles/global.css';
	import type { ThemeContext } from '$lib/ui/theme-context';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const stored = localStorage.getItem('theme');
		theme = stored === 'dark' ? 'dark' : 'light';
	});

	$effect(() => {
		document.documentElement.dataset.theme = theme;
	});

	// Shared across every route's own header, each renders its own nav
	// content (the landing page's marketing nav and the editor's app bar
	// are different things), but the theme is one app-wide preference.
	setContext<ThemeContext>('theme', {
		get current() {
			return theme;
		},
		toggle() {
			theme = theme === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', theme);
		}
	});
</script>

<div class="page">
	{@render children()}
</div>

<style>
	.page {
		max-width: 1440px;
		margin: 0 auto;
		min-height: calc(100vh - 5rem);
		display: flex;
		flex-direction: column;
		background: var(--paper);
		border: 2px solid var(--ink);
		border-radius: 20px;
		box-shadow: var(--shadow-hard-lg);
		overflow: hidden;
	}
	@media (max-width: 640px) {
		.page {
			min-height: 100vh;
			border: none;
			border-radius: 0;
			box-shadow: none;
		}
	}
</style>
