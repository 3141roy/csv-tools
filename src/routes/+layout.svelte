<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/design-tokens.css';
	import '$lib/styles/global.css';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const stored = localStorage.getItem('theme');
		theme = stored === 'dark' ? 'dark' : 'light';
	});

	$effect(() => {
		document.documentElement.dataset.theme = theme;
	});

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', theme);
	}
</script>

<div class="page">
	<nav class="nav">
		<div class="brand">
			<a class="wordmark" href="/">csv<span class="dot">.</span></a>
			<a class="pill" href="https://bundle.tools">part of Bundle</a>
		</div>
		<div class="nav-links">
			<a class="nav-link-text" href="/editor">Open a file</a>
			<span class="nav-link-text">Convert</span>
			<span class="nav-link-text">How it works</span>
			<a class="gh-btn" href="https://github.com/3141roy/csv-tools">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="var(--ink)">
					<path
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
				<span class="gh-label">GitHub</span>
			</a>
			<button
				type="button"
				class="theme-toggle"
				onclick={toggleTheme}
				aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				{#if theme === 'dark'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="4.5" stroke="var(--ink)" stroke-width="2.2" />
						<path
							d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6"
							stroke="var(--ink)"
							stroke-width="2.2"
							stroke-linecap="round"
						/>
					</svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
						<path
							d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"
							fill="var(--lav)"
							stroke="var(--ink)"
							stroke-width="2.2"
							stroke-linejoin="round"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</nav>

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

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22px clamp(20px, 4.5vw, 64px);
		border-bottom: var(--border-w) solid var(--ink);
		flex-wrap: wrap;
		gap: 12px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.wordmark {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 28px;
		letter-spacing: -0.5px;
		color: var(--ink);
	}
	.dot {
		color: var(--terra);
	}
	.pill {
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-2);
		border: 2px solid var(--ink);
		border-radius: 999px;
		padding: 3px 10px;
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 26px;
		font-size: 15px;
		font-weight: 500;
		color: var(--ink-2);
		flex-wrap: wrap;
	}
	.nav-link-text {
		color: inherit;
	}
	.nav-link-text:hover {
		color: var(--ink);
	}
	.gh-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		color: var(--ink);
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		padding: 8px 12px;
		box-shadow: var(--shadow-hard-sm);
		background: var(--panel-2);
	}
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		flex: none;
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		box-shadow: var(--shadow-hard-sm);
		background: var(--panel-2);
		cursor: pointer;
		transition: transform 0.08s ease, box-shadow 0.08s ease;
	}
	.theme-toggle:hover {
		transform: translate(1px, 1px);
		box-shadow: var(--shadow-press-sm);
	}

	@media (max-width: 800px) {
		.nav-link-text {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.gh-label {
			display: none;
		}
	}
</style>
