<script lang="ts">
	import { getContext } from 'svelte';
	import type { ThemeContext } from './theme-context';

	const theme = getContext<ThemeContext>('theme');
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={theme.toggle}
	aria-label={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if theme.current === 'dark'}
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

<style>
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
</style>
