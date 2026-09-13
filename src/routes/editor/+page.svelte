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
	let showPasteBox = $state(false);
	let pastedText = $state('');
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
		showPasteBox = false;
		pastedText = '';
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

	function loadPastedText() {
		if (pastedText.trim()) loadText(pastedText, 'Pasted data');
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

<svelte:head>
	<title>csv.bundle.tools: Editor</title>
</svelte:head>

<div class="page">
	<nav class="nav">
		<a class="wordmark" href="/">csv<span class="dot">.</span></a>
		{#if table}
			<div class="file-chip">
				<span class="file-name">{fileName}</span>
				<span class="file-meta">{table.rowCount} rows · {table.columns.length} cols</span>
			</div>
		{/if}
		<div class="nav-right">
			{#if table}
				<button type="button" class="btn btn-secondary" onclick={reset}>Change file</button>
			{/if}
			<span class="privacy-note">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink)" stroke-width="2.2" />
					<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink)" stroke-width="2.2" />
				</svg>
				On your device
			</span>
		</div>
	</nav>

	{#if !table}
		<section
			class="drop-zone"
			class:dragging
			aria-label="CSV file drop zone"
			ondragover={(e) => {
				e.preventDefault();
				dragging = true;
			}}
			ondragleave={() => (dragging = false)}
			ondrop={onDrop}
		>
			<h1>Start with a CSV.</h1>
			<p>Drop a file here, choose one, paste it in, or try sample data. Nothing leaves this tab.</p>

			{#if error}
				<p class="error">{error}</p>
			{/if}

			<div class="drop-actions">
				<button type="button" class="btn btn-primary" onclick={() => fileInput?.click()}>
					Choose a file
				</button>
				<button type="button" class="btn btn-secondary" onclick={() => (showPasteBox = !showPasteBox)}>
					Paste it in
				</button>
				<button type="button" class="btn btn-secondary" onclick={loadSample}>
					Try sample data
				</button>
			</div>

			<input
				bind:this={fileInput}
				type="file"
				accept=".csv,text/csv"
				onchange={onFileInputChange}
				hidden
			/>

			{#if showPasteBox}
				<div class="paste-box">
					<textarea bind:value={pastedText} placeholder="name,plan,signups&#10;Ada,Pro,4210" rows="6"
					></textarea>
					<button type="button" class="btn btn-primary" onclick={loadPastedText}>Load pasted text</button>
				</div>
			{/if}
		</section>
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
	.page {
		max-width: 1440px;
		margin: 0 auto;
		min-height: 100vh;
		background: var(--paper);
		display: flex;
		flex-direction: column;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 16px clamp(20px, 4.5vw, 40px);
		border-bottom: var(--border-w) solid var(--ink);
		flex-wrap: wrap;
	}
	.wordmark {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 24px;
		color: var(--ink);
	}
	.dot {
		color: var(--terra);
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
	.nav-right {
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

	.drop-zone {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 18px;
		text-align: center;
		padding: 40px 20px;
		margin: 24px;
		border: 3px dashed var(--ink);
		border-radius: 22px;
		transition: background-color 0.12s ease;
	}
	.drop-zone.dragging {
		background: var(--panel);
	}
	.drop-zone h1 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 40px;
		margin: 0;
	}
	.drop-zone p {
		color: var(--ink-2);
		max-width: 480px;
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
	.paste-box {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		max-width: 480px;
	}
	.paste-box textarea {
		font-family: var(--font-mono);
		font-size: 13px;
		padding: 12px;
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		background: var(--panel-2);
		color: var(--ink);
		resize: vertical;
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
</style>
