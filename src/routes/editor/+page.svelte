<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Table } from '$lib/core/types';
	import { fromRows } from '$lib/core/table';
	import { parseCsv } from '$lib/formats/csv/parse';

	const SAMPLE_CSV = `name,plan,signups,active
Ada,Pro,4210,true
Grace,Pro,3980,true
Alan,Team,1560,true
Bug,Free,12,false
`;

	let table = $state<Table | null>(null);
	let fileName = $state('');
	let error = $state<string | null>(null);
	let dragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	function loadText(text: string, name: string) {
		const { rows } = parseCsv(text);
		if (rows.length === 0) {
			error = "Couldn't find any rows in that file.";
			return;
		}
		table = fromRows(rows);
		fileName = name;
		error = null;
	}

	async function loadFile(file: File) {
		loadText(await file.text(), file.name);
	}

	function onFileInputChange(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (file) loadFile(file);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) loadFile(file);
	}

	function onPaste(e: ClipboardEvent) {
		if (table) return;
		const text = e.clipboardData?.getData('text');
		if (text?.trim()) {
			e.preventDefault();
			loadText(text, 'Pasted data');
		}
	}

	function loadSample() {
		loadText(SAMPLE_CSV, 'sample.csv');
	}

	onMount(() => {
		if (page.url.searchParams.has('sample')) loadSample();
	});

	function reset() {
		table = null;
		fileName = '';
		error = null;
	}

	function typeBadge(type: string): string {
		if (type === 'number') return 'num';
		if (type === 'boolean') return 'bool';
		if (type === 'date') return 'date';
		if (type === 'text') return 'txt';
		return '?';
	}
</script>

<svelte:window onpaste={onPaste} />

<svelte:head>
	<title>csv.bundle.tools: Editor</title>
</svelte:head>

<!-- The page frame + nav live in +layout.svelte, shared with every route. -->
<div class="editor">
	{#if table}
		<div class="file-bar">
			<div class="file-chip">
				<span class="file-name">{fileName}</span>
				<span class="file-meta">{table.rowCount} rows · {table.columns.length} cols</span>
			</div>
			<div class="file-bar-right">
				<button type="button" class="btn btn-secondary" onclick={reset}>Change file</button>
				<span class="privacy-note">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink)" stroke-width="2.2" />
						<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink)" stroke-width="2.2" />
					</svg>
					On your device
				</span>
			</div>
		</div>
	{/if}

	{#if !table}
		{#snippet dropContent()}
			<svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="drop-icon">
				<rect x="9" y="4" width="26" height="34" rx="3" fill="var(--panel-2)" stroke="var(--ink)" stroke-width="2.4" />
				<line x1="15" y1="15" x2="29" y2="15" stroke="var(--ink)" stroke-width="2" />
				<line x1="15" y1="22" x2="29" y2="22" stroke="var(--ink)" stroke-width="2" />
				<line x1="15" y1="29" x2="23" y2="29" stroke="var(--ink)" stroke-width="2" />
				<circle cx="35" cy="35" r="10" fill="var(--lime)" stroke="var(--ink-on-accent)" stroke-width="2.4" />
				<path
					d="M35 30v9M31 35l4 4 4-4"
					stroke="var(--ink-on-accent)"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<h2>Drop a CSV here</h2>
			<p>or <b>click to choose a file</b> · or paste it from your clipboard</p>
			{#if error}<p class="error">{error}</p>{/if}
			<div class="drop-actions">
				<button type="button" class="btn btn-primary" onclick={() => fileInput?.click()}>
					Choose a file
				</button>
				<button type="button" class="btn btn-secondary" onclick={loadSample}>Try sample data</button>
			</div>
		{/snippet}

		<section
			class="empty-state"
			aria-label="CSV file drop zone"
			ondragover={(e) => {
				e.preventDefault();
				dragging = true;
			}}
			ondragleave={() => (dragging = false)}
			ondrop={onDrop}
		>
			<div class="bg-shapes" aria-hidden="true">
				<svg class="bg-shape bg-shape-grid" width="140" height="90" viewBox="0 0 140 90" fill="none">
					<rect x="4" y="4" width="132" height="82" fill="var(--sky)" stroke="var(--ink-on-accent)" stroke-width="3" />
					<line x1="49" y1="4" x2="49" y2="86" stroke="var(--ink-on-accent)" stroke-width="2" />
					<line x1="94" y1="4" x2="94" y2="86" stroke="var(--ink-on-accent)" stroke-width="2" />
					<line x1="4" y1="31" x2="136" y2="31" stroke="var(--ink-on-accent)" stroke-width="2" />
					<line x1="4" y1="58" x2="136" y2="58" stroke="var(--ink-on-accent)" stroke-width="2" />
					<rect x="4" y="58" width="45" height="28" fill="var(--lime)" stroke="var(--ink-on-accent)" stroke-width="2" />
				</svg>
				<svg class="bg-shape bg-shape-band" width="150" height="90" viewBox="0 0 150 90" fill="none">
					<defs>
						<pattern id="bg-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
							<rect width="10" height="10" fill="var(--lav)" />
							<line x1="0" y1="0" x2="0" y2="10" stroke="var(--ink-on-accent)" stroke-width="3" />
						</pattern>
					</defs>
					<rect x="4" y="4" width="142" height="82" fill="url(#bg-hatch)" stroke="var(--ink-on-accent)" stroke-width="3" />
				</svg>
				<svg class="bg-shape bg-shape-triangle" width="120" height="100" viewBox="0 0 120 100" fill="none">
					<path d="M4 96 60 4l56 92z" fill="var(--lime)" stroke="var(--ink-on-accent)" stroke-width="3" stroke-linejoin="round" />
				</svg>
				<svg class="bg-shape bg-shape-square" width="120" height="120" viewBox="0 0 120 120" fill="none">
					<rect x="4" y="4" width="112" height="112" rx="16" fill="var(--terra)" stroke="var(--ink-on-accent)" stroke-width="3" />
					<path
						d="M60 40v32M46 60l14 14 14-14"
						stroke="var(--ink-on-accent)"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>

			<div class="empty-content">
				<div class="kicker">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink-on-accent)" stroke-width="2.4" />
						<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink-on-accent)" stroke-width="2.4" />
					</svg>
					NOTHING LEAVES THIS TAB
				</div>

				<h1>Start with a <span class="headline-italic">CSV</span>.</h1>

				<div class="donut-shell" class:dragging>
					<div class="donut-outer">
						<div class="donut-inner">
							{@render dropContent()}
						</div>
					</div>
					<div class="hand-badge">nothing uploads, promise</div>
				</div>

				<div class="quiet-shell" class:dragging>
					{@render dropContent()}
					<span class="hand-note-plain">nothing uploads, promise</span>
				</div>

				<div class="stepper">
					<span class="step"><span class="step-num sky">1</span> Look</span>
					<span class="step-arrow">→</span>
					<span class="step"><span class="step-num lime">2</span> Tidy</span>
					<span class="step-arrow">→</span>
					<span class="step"><span class="step-num lav">3</span> Convert</span>
				</div>
			</div>

			<input
				bind:this={fileInput}
				type="file"
				accept=".csv,text/csv"
				onchange={onFileInputChange}
				hidden
			/>
		</section>

		<footer class="status-bar centered">
			<span class="privacy-note">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink)" stroke-width="2.2" />
					<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink)" stroke-width="2.2" />
				</svg>
				Your file never leaves this browser tab. No upload, no server, no account.
			</span>
		</footer>
	{:else}
		<div class="grid-wrap">
			<table>
				<thead>
					<tr>
						<th class="row-num-col"></th>
						{#each table.columns as col (col.name)}
							<th>
								<span class="col-name">{col.name}</span>
								<span class="type-badge">{typeBadge(col.type)}</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each table.toRows() as row, i (i)}
						<tr>
							<td class="row-num-col">{i + 1}</td>
							{#each table.columns as col (col.name)}
								<td class:numeric={col.type === 'number'}>
									{row[col.name] === null || row[col.name] === undefined
										? ''
										: String(row[col.name])}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<footer class="status-bar">
			<span>{table.rowCount} rows · {table.columns.length} cols</span>
			<span class="privacy-note">Everything stays on your device.</span>
		</footer>
	{/if}
</div>

<style>
	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.file-bar {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 16px clamp(20px, 4.5vw, 40px);
		border-bottom: var(--border-w) solid var(--ink);
		flex-wrap: wrap;
	}
	.file-chip {
		display: flex;
		align-items: baseline;
		gap: 10px;
		font-size: 14px;
		color: var(--ink-2);
	}
	.file-name {
		font-weight: 600;
		color: var(--ink);
	}
	.file-bar-right {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-left: auto;
	}
	.privacy-note {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 15px;
		color: var(--ink);
		border: var(--border-w) solid var(--ink);
		border-radius: var(--radius);
		padding: 10px 16px;
		box-shadow: var(--shadow-hard-sm);
		cursor: pointer;
		transition: transform 0.08s ease, box-shadow 0.08s ease;
	}
	.btn:hover {
		transform: translate(1px, 1px);
		box-shadow: 2px 2px 0 var(--ink);
	}
	.btn-primary {
		background: var(--terra);
		color: var(--ink-on-accent);
	}
	.btn-secondary {
		background: var(--panel-2);
	}

	.empty-state {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 48px 20px;
	}
	.empty-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		text-align: center;
		max-width: 620px;
	}
	.empty-content h1 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: clamp(34px, 5vw, 48px);
		margin: 0;
	}
	.headline-italic {
		font-style: italic;
		color: var(--terra);
	}

	/* Background shapes crop off the edges of .page (which clips overflow),
	   pure decoration — hidden once there's no room to let them breathe. */
	.bg-shapes {
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	.bg-shape {
		position: absolute;
	}
	.bg-shape-grid {
		top: -20px;
		left: -30px;
		transform: rotate(-7deg);
	}
	.bg-shape-band {
		top: -10px;
		right: -40px;
		transform: rotate(8deg);
	}
	.bg-shape-triangle {
		bottom: -20px;
		left: -20px;
		transform: rotate(6deg);
	}
	.bg-shape-square {
		bottom: -30px;
		right: -30px;
		transform: rotate(-10deg);
	}
	@media (max-width: 900px) {
		.bg-shapes {
			display: none;
		}
	}

	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1.5px;
		color: var(--ink-on-accent);
		background: var(--lime);
		border: var(--border-w) solid var(--ink);
		border-radius: 999px;
		padding: 6px 14px;
		box-shadow: var(--shadow-hard-sm);
	}

	.drop-icon {
		flex: none;
	}
	.empty-content h2 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 26px;
		margin: 0;
	}
	.empty-content p {
		color: var(--ink-2);
		margin: 0;
	}
	.error {
		color: var(--terra-d);
		font-weight: 600;
	}
	.drop-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	/* Donut: default above 680px. Below that a shrinking circle leaves too
	   little room for the buttons inside it, so it's replaced outright by
	   a plain dashed rounded-rect (.quiet-shell) rather than squashed. */
	.donut-shell {
		position: relative;
		display: flex;
		justify-content: center;
	}
	.donut-outer {
		width: min(480px, 82vw);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--sky);
		border: 3.5px solid var(--ink);
		box-shadow: var(--shadow-hard-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8%;
		transition: background-color 0.12s ease;
	}
	.donut-shell.dragging .donut-outer {
		background: var(--lime);
	}
	.donut-inner {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--panel-2);
		border: 3px dashed var(--ink);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 10%;
		text-align: center;
	}
	.hand-badge {
		position: absolute;
		top: 6%;
		left: 2%;
		font-family: var(--font-hand);
		font-weight: 700;
		font-size: 18px;
		color: var(--terra-d);
		background: var(--paper);
		border: 2px solid var(--ink);
		border-radius: 10px;
		padding: 4px 12px;
		transform: rotate(-6deg);
		box-shadow: var(--shadow-hard-sm);
	}

	.quiet-shell {
		display: none;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		width: 100%;
		padding: 36px 28px;
		border: 3px dashed var(--ink);
		border-radius: 20px;
		background: var(--panel-2);
	}
	.hand-note-plain {
		font-family: var(--font-hand);
		font-weight: 700;
		font-size: 18px;
		color: var(--terra-d);
	}

	@media (max-width: 680px) {
		.donut-shell {
			display: none;
		}
		.quiet-shell {
			display: flex;
		}
	}

	.stepper {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		font-size: 15px;
		font-weight: 600;
	}
	.step {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.step-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid var(--ink);
		color: var(--ink-on-accent);
		font-size: 13px;
	}
	.step-num.sky {
		background: var(--sky);
	}
	.step-num.lime {
		background: var(--lime);
	}
	.step-num.lav {
		background: var(--lav);
	}
	.step-arrow {
		color: var(--ink-3);
	}

	.grid-wrap {
		flex: 1;
		overflow: auto;
		padding: 0 clamp(20px, 4.5vw, 40px);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 13.5px;
	}
	th,
	td {
		padding: 9px 12px;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	thead th {
		border-bottom: var(--border-w) solid var(--ink);
		background: var(--paper);
		position: sticky;
		top: 0;
		font-weight: 600;
	}
	.col-name {
		margin-right: 8px;
	}
	.type-badge {
		font-size: 10px;
		font-weight: 700;
		color: var(--ink-3);
		border: 1.4px solid var(--ink-3);
		border-radius: 4px;
		padding: 1px 5px;
	}
	tbody td {
		border-bottom: 1px solid var(--hairline);
	}
	td.numeric {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.row-num-col {
		width: 44px;
		color: var(--ink-3);
		text-align: right;
	}

	.status-bar {
		display: flex;
		justify-content: space-between;
		padding: 14px clamp(20px, 4.5vw, 40px);
		border-top: var(--border-w) solid var(--ink);
		font-size: 13px;
		color: var(--ink-2);
	}
	.status-bar.centered {
		justify-content: center;
	}
</style>
