<script module lang="ts">
	// Registered once per module load, not per component instance — the
	// registry is a shared singleton, and re-registering on every mount
	// (e.g. navigating back to this route) would throw on the duplicate id.
	import { registry } from '$lib/core/operation-registry';
	import { filterRows } from '$lib/operations/filter-rows';
	import { manifest as filterRowsManifest } from '$lib/operations/filter-rows/manifest';
	import { sortRows } from '$lib/operations/sort-rows';
	import { manifest as sortRowsManifest } from '$lib/operations/sort-rows/manifest';

	if (!registry.manifests().some((m) => m.id === 'filter-rows')) {
		registry.register(filterRows, filterRowsManifest);
		registry.register(sortRows, sortRowsManifest);
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Table, OperationInvocation } from '$lib/core/types';
	import { fromRows } from '$lib/core/table';
	import { parseCsv } from '$lib/formats/csv/parse';
	import type { CsvParseOptions } from '$lib/formats/csv/parse';
	import { decodeBytes, ENCODINGS } from '$lib/formats/csv/decode';
	import { tableToCsv } from '$lib/formats/csv/serialize';
	import { tableToJson } from '$lib/formats/json/serialize';
	import { columnStats } from '$lib/core/column-stats';
	import ThemeToggle from '$lib/ui/ThemeToggle.svelte';
	import type { FilterRowsParams } from '$lib/operations/filter-rows/manifest';

	const SAMPLE_CSV = `name,plan,signups,active
Ada,Pro,4210,true
Grace,Pro,3980,true
Alan,Team,1560,true
Bug,Free,12,false
`;

	let rawText = $state('');
	let sourceTable = $state<Table | null>(null);
	let fileName = $state('');
	let error = $state<string | null>(null);
	let dragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let parseOptions = $state<CsvParseOptions>({ hasHeader: true });

	function loadText(text: string, name: string) {
		const { rows, delimiter } = parseCsv(text, parseOptions);
		if (rows.length === 0) {
			error = "Couldn't find any rows in that file.";
			return;
		}
		rawText = text;
		parseOptions = { ...parseOptions, delimiter };
		sourceTable = fromRows(rows);
		fileName = name;
		error = null;
		filters = [];
		sort = null;
		searchQuery = '';
		selectedColumn = null;
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
		if (sourceTable) return;
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
		sourceTable = null;
		rawText = '';
		fileName = '';
		error = null;
		selectedColumn = null;
	}

	// Re-parses the original text with new delimiter/header settings —
	// filters and sort are kept as-is; if a column they reference no
	// longer exists, applyOne/applyLog will just throw, so re-validate.
	function updateParseOptions(next: Partial<CsvParseOptions>) {
		parseOptions = { ...parseOptions, ...next };
		if (rawText) loadTextKeepingOptions();
	}
	function loadTextKeepingOptions() {
		const { rows } = parseCsv(rawText, parseOptions);
		if (rows.length === 0) {
			error = "Couldn't find any rows with those settings.";
			return;
		}
		sourceTable = fromRows(rows);
		error = null;
	}

	function typeBadge(type: string): string {
		if (type === 'number') return 'num';
		if (type === 'boolean') return 'bool';
		if (type === 'date') return 'date';
		if (type === 'text') return 'txt';
		return '?';
	}

	let selectedColumn = $state<string | null>(null);

	function selectColumn(name: string) {
		selectedColumn = selectedColumn === name ? null : name;
	}

	const inspected = $derived(
		sourceTable && selectedColumn
			? {
					name: selectedColumn,
					meta: sourceTable.columns.find((c) => c.name === selectedColumn)!,
					stats: columnStats(sourceTable.getColumn(selectedColumn))
				}
			: null
	);

	// --- Filters + sort: an operation-log, exactly what the pipeline is ---
	type FilterPill = { id: number; params: FilterRowsParams };
	let filters = $state<FilterPill[]>([]);
	let nextFilterId = 0;
	let sort = $state<{ column: string; direction: 'asc' | 'desc' } | null>(null);
	let searchQuery = $state('');

	let showAddFilter = $state(false);
	let newFilterColumn = $state('');
	let newFilterOperator = $state<FilterRowsParams['operator']>('contains');
	let newFilterValue = $state('');

	const OPERATOR_LABELS: Record<FilterRowsParams['operator'], string> = {
		eq: 'is',
		neq: 'is not',
		contains: 'contains',
		gte: '≥',
		lte: '≤',
		isEmpty: 'is empty',
		notEmpty: 'is not empty'
	};
	const NEEDS_VALUE: ReadonlyArray<FilterRowsParams['operator']> = ['eq', 'neq', 'contains', 'gte', 'lte'];

	function addFilter() {
		if (!newFilterColumn) return;
		const value = NEEDS_VALUE.includes(newFilterOperator)
			? sourceTable?.columns.find((c) => c.name === newFilterColumn)?.type === 'number'
				? Number(newFilterValue)
				: newFilterValue
			: undefined;
		filters = [
			...filters,
			{ id: nextFilterId++, params: { column: newFilterColumn, operator: newFilterOperator, value } }
		];
		showAddFilter = false;
		newFilterValue = '';
	}
	function removeFilter(id: number) {
		filters = filters.filter((f) => f.id !== id);
	}
	function filterLabel(params: FilterRowsParams): string {
		const opLabel = OPERATOR_LABELS[params.operator];
		return NEEDS_VALUE.includes(params.operator)
			? `${params.column} ${opLabel} ${params.value}`
			: `${params.column} ${opLabel}`;
	}

	function toggleSort(column: string) {
		if (sort?.column !== column) sort = { column, direction: 'asc' };
		else if (sort.direction === 'asc') sort = { column, direction: 'desc' };
		else sort = null;
	}

	const displayedTable = $derived.by(() => {
		if (!sourceTable) return null;
		const log: OperationInvocation[] = filters.map((f) => ({
			opId: 'filter-rows',
			params: f.params,
			enabled: true
		}));
		if (sort) log.push({ opId: 'sort-rows', params: sort, enabled: true });
		return registry.applyLog(sourceTable, log);
	});

	const visibleRows = $derived.by(() => {
		if (!displayedTable) return [];
		const rows = displayedTable.toRows();
		if (!searchQuery.trim()) return rows;
		const q = searchQuery.toLowerCase();
		return rows.filter((row) =>
			Object.values(row).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
		);
	});

	// --- Format popover ---
	let formatOpen = $state(false);
	let formatWrapEl: HTMLDivElement | undefined = $state();

	function onWindowClick(e: MouseEvent) {
		if (formatOpen && formatWrapEl && !formatWrapEl.contains(e.target as Node)) {
			formatOpen = false;
		}
	}

	// --- Export ---
	let exportOpen = $state(false);
	function download(content: string, filename: string, mimeType: string) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
	function exportCsv() {
		if (!displayedTable) return;
		download(tableToCsv(displayedTable), fileName.replace(/\.csv$/i, '') + '.csv', 'text/csv');
		exportOpen = false;
	}
	function exportJson() {
		if (!displayedTable) return;
		download(tableToJson(displayedTable), fileName.replace(/\.csv$/i, '') + '.json', 'application/json');
		exportOpen = false;
	}
</script>

<svelte:window onpaste={onPaste} onclick={onWindowClick} />

<svelte:head>
	<title>csv.bundle.tools: Editor</title>
</svelte:head>

<!-- The page frame lives in +layout.svelte, shared with every route. This
     is the editor's own app bar — not the landing page's marketing nav. -->
<div class="editor">
	<div class="file-bar">
		<a class="wordmark" href="/">csv<span class="dot">.</span></a>
		{#if sourceTable}
			<div class="file-chip">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
					<path
						d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
						stroke="var(--sky-d)"
						stroke-width="1.8"
					/>
				</svg>
				<span class="file-name">{fileName}</span>
				<span class="file-meta">{sourceTable.rowCount} rows · {sourceTable.columns.length} cols</span>
			</div>
		{/if}
		<div class="file-bar-right">
			{#if sourceTable}
				<span class="privacy-note">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink)" stroke-width="2.2" />
						<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink)" stroke-width="2.2" />
					</svg>
					On your device
				</span>
				<button type="button" class="btn btn-secondary" onclick={reset}>Change file</button>
				<div class="export-wrap">
					<button type="button" class="btn btn-primary" onclick={() => (exportOpen = !exportOpen)}>
						Export
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
							<path d="M6 9l6 6 6-6" stroke="var(--ink-on-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					{#if exportOpen}
						<div class="export-menu">
							<button type="button" onclick={exportCsv}>Export as CSV</button>
							<button type="button" onclick={exportJson}>Export as JSON</button>
						</div>
					{/if}
				</div>
			{/if}
			<ThemeToggle />
		</div>
	</div>

	{#if sourceTable}

		<div class="toolbar">
			<div class="format-wrap" bind:this={formatWrapEl}>
				<button type="button" class="format-btn" onclick={() => (formatOpen = !formatOpen)}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<line x1="4" y1="7" x2="20" y2="7" stroke="var(--ink-on-accent)" stroke-width="2.2" stroke-linecap="round" />
						<line x1="4" y1="12" x2="20" y2="12" stroke="var(--ink-on-accent)" stroke-width="2.2" stroke-linecap="round" />
						<line x1="4" y1="17" x2="14" y2="17" stroke="var(--ink-on-accent)" stroke-width="2.2" stroke-linecap="round" />
					</svg>
					Format
				</button>
				{#if formatOpen}
					<div class="format-popover">
						<h3>How to read this file</h3>
						<p>We guessed. Change anything that looks wrong.</p>

						<span class="popover-label">Delimiter</span>
						<div class="segmented">
							{#each [[',', 'Comma'], [';', 'Semicolon'], ['\t', 'Tab']] as [value, label] (value)}
								<button
									type="button"
									class:active={parseOptions.delimiter === value}
									onclick={() => updateParseOptions({ delimiter: value })}
								>
									{label}
								</button>
							{/each}
						</div>

						<label class="toggle-row">
							<span>First row is a header</span>
							<input
								type="checkbox"
								checked={parseOptions.hasHeader}
								onchange={(e) => updateParseOptions({ hasHeader: e.currentTarget.checked })}
							/>
						</label>
					</div>
				{/if}
			</div>

			<span class="toolbar-rule"></span>

			<span class="toolbar-label">Filters</span>
			{#each filters as f (f.id)}
				<span class="pill filter-pill">
					{filterLabel(f.params)}
					<button type="button" onclick={() => removeFilter(f.id)} aria-label="Remove filter">×</button>
				</span>
			{/each}

			{#if !showAddFilter}
				<button type="button" class="pill add-filter" onclick={() => (showAddFilter = true)}>
					+ Filter
				</button>
			{:else}
				<div class="add-filter-form">
					<select bind:value={newFilterColumn}>
						<option value="">Column</option>
						{#each sourceTable.columns as col (col.name)}
							<option value={col.name}>{col.name}</option>
						{/each}
					</select>
					<select bind:value={newFilterOperator}>
						{#each Object.entries(OPERATOR_LABELS) as [op, label] (op)}
							<option value={op}>{label}</option>
						{/each}
					</select>
					{#if NEEDS_VALUE.includes(newFilterOperator)}
						<input type="text" bind:value={newFilterValue} placeholder="Value" />
					{/if}
					<button type="button" class="btn btn-secondary btn-sm" onclick={addFilter}>Add</button>
				</div>
			{/if}

			{#if sort}
				<span class="toolbar-rule"></span>
				<span class="pill sort-pill">
					{sort.column} {sort.direction === 'asc' ? '↑' : '↓'}
					<button type="button" onclick={() => (sort = null)} aria-label="Clear sort">×</button>
				</span>
			{/if}

			<input class="search" type="text" bind:value={searchQuery} placeholder="Find in table…" />
		</div>
	{/if}

	{#if !sourceTable}
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
	{:else if displayedTable}
		<div class="editor-body">
			<div class="grid-wrap">
				<table>
					<thead>
						<tr>
							<th class="row-num-col"></th>
							{#each displayedTable.columns as col (col.name)}
								<th class:selected-col={selectedColumn === col.name} class:sorted-col={sort?.column === col.name}>
									<button type="button" class="th-content" onclick={() => selectColumn(col.name)}>
										<span class="col-name">{col.name}</span>
										<span class="type-badge">{typeBadge(col.type)}</span>
									</button>
									<button
										type="button"
										class="sort-btn"
										onclick={(e) => {
											e.stopPropagation();
											toggleSort(col.name);
										}}
										aria-label="Sort by {col.name}"
									>
										{sort?.column === col.name ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
									</button>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each visibleRows as row, i (i)}
							<tr>
								<td class="row-num-col">{i + 1}</td>
								{#each displayedTable.columns as col (col.name)}
									<td
										class:numeric={col.type === 'number'}
										class:selected-col={selectedColumn === col.name}
										class:sorted-col={sort?.column === col.name}
									>
										{row[col.name] === null || row[col.name] === undefined
											? ''
											: String(row[col.name])}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
				{#if visibleRows.length === 0}
					<p class="no-rows">No rows match the current filters.</p>
				{/if}
			</div>

			{#if inspected}
				<aside class="inspector">
					<div class="inspector-head">
						<span class="col-name">{inspected.name}</span>
						<span class="type-badge">{typeBadge(inspected.meta.type)}</span>
					</div>
					<p class="inspector-note">A glance to help spot outliers and gaps, not a full report.</p>

					<div class="stat-grid">
						<div class="stat">
							<span class="stat-label">Empty</span>
							<span class="stat-value">{inspected.stats.emptyPct}%</span>
						</div>
						<div class="stat">
							<span class="stat-label">Unique</span>
							<span class="stat-value">{inspected.stats.uniqueCount}</span>
						</div>
						<div class="stat">
							<span class="stat-label">Min</span>
							<span class="stat-value">{inspected.stats.min ?? ''}</span>
						</div>
						<div class="stat">
							<span class="stat-label">Max</span>
							<span class="stat-value">{inspected.stats.max ?? ''}</span>
						</div>
					</div>

					{#if inspected.stats.histogram.length > 0}
						<div class="histogram">
							{#each inspected.stats.histogram as count, idx (idx)}
								<span
									class="bar"
									style="height: {(count / Math.max(...inspected.stats.histogram)) * 100}%"
								></span>
							{/each}
						</div>
					{/if}
				</aside>
			{/if}
		</div>

		<footer class="status-bar">
			<span>
				{visibleRows.length} of {sourceTable?.rowCount} rows shown
				{#if filters.length > 0}
					· {filters.length} filter{filters.length === 1 ? '' : 's'}
				{/if}
				{#if sort}
					· sorted by {sort.column} {sort.direction === 'asc' ? '↑' : '↓'}
				{/if}
			</span>
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
		align-items: center;
		gap: 8px;
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
	.btn-sm {
		padding: 6px 12px;
		font-size: 13px;
		box-shadow: var(--shadow-hard-sm);
	}

	.export-wrap {
		position: relative;
	}
	.export-menu {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 5;
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		box-shadow: var(--shadow-hard);
		overflow: hidden;
		min-width: 160px;
	}
	.export-menu button {
		background: none;
		border: none;
		text-align: left;
		padding: 10px 14px;
		font: inherit;
		font-weight: 600;
		color: var(--ink);
		cursor: pointer;
	}
	.export-menu button:hover {
		background: var(--panel-2);
	}

	/* TOOLBAR */
	.toolbar {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		padding: 12px clamp(20px, 4.5vw, 40px);
		border-bottom: var(--border-w) solid var(--ink);
	}
	.toolbar-rule {
		width: 1.5px;
		align-self: stretch;
		background: var(--ink-3);
		opacity: 0.4;
	}
	.toolbar-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--ink-2);
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		border: 1.6px solid var(--ink);
		border-radius: 999px;
		padding: 5px 10px;
	}
	.pill button {
		background: none;
		border: none;
		font: inherit;
		font-weight: 700;
		color: inherit;
		cursor: pointer;
		line-height: 1;
	}
	.filter-pill {
		background: var(--sky);
		color: var(--ink-on-accent);
	}
	.sort-pill {
		background: var(--lav);
		color: var(--ink-on-accent);
	}
	.add-filter {
		background: none;
		border: 1.6px dashed var(--ink-3);
		color: var(--ink-2);
		cursor: pointer;
	}
	.add-filter-form {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.add-filter-form select,
	.add-filter-form input,
	.search {
		font: inherit;
		font-size: 13px;
		border: var(--border-w) solid var(--ink);
		border-radius: 8px;
		padding: 6px 10px;
		background: var(--panel-2);
		color: var(--ink);
	}
	.search {
		margin-left: auto;
		width: 200px;
	}

	.format-wrap {
		position: relative;
	}
	.format-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 14px;
		color: var(--ink-on-accent);
		background: var(--lime);
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		padding: 8px 14px;
		box-shadow: var(--shadow-hard-sm);
		cursor: pointer;
	}
	.format-popover {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		z-index: 5;
		width: 320px;
		background: var(--panel);
		border: var(--border-w) solid var(--ink);
		border-radius: 14px;
		box-shadow: var(--shadow-hard);
		padding: 18px;
	}
	.format-popover h3 {
		font-family: var(--font-serif);
		font-size: 17px;
		margin: 0 0 4px;
	}
	.format-popover p {
		font-size: 13px;
		color: var(--ink-2);
		margin: 0 0 14px;
	}
	.popover-label {
		display: block;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		color: var(--ink-3);
		margin-bottom: 6px;
	}
	.segmented {
		display: flex;
		border: var(--border-w) solid var(--ink);
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 16px;
	}
	.segmented button {
		flex: 1;
		background: var(--panel-2);
		border: none;
		border-right: 1.5px solid var(--ink);
		padding: 8px 4px;
		font: inherit;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.segmented button:last-child {
		border-right: none;
	}
	.segmented button.active {
		background: var(--sky);
		color: var(--ink-on-accent);
	}
	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		font-weight: 600;
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

	.editor-body {
		flex: 1;
		display: flex;
		min-height: 0;
	}
	.grid-wrap {
		flex: 1;
		min-width: 0; /* without this a wide table forces the flex row to grow
			instead of scrolling in place, pushing the inspector off the edge */
		overflow: auto;
		padding: 0 clamp(20px, 4.5vw, 40px);
	}
	.no-rows {
		padding: 32px 0;
		text-align: center;
		color: var(--ink-2);
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
		white-space: nowrap;
	}
	thead th.selected-col {
		background: var(--sky);
		color: var(--ink-on-accent);
	}
	thead th.sorted-col {
		background: var(--lav);
		color: var(--ink-on-accent);
	}
	td.selected-col {
		background: rgba(166, 220, 239, 0.22);
	}
	td.sorted-col {
		background: rgba(198, 183, 242, 0.22);
	}
	.th-content {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		font: inherit;
		font-weight: inherit;
		color: inherit;
		padding: 0;
		cursor: pointer;
	}
	.sort-btn {
		background: none;
		border: none;
		color: var(--ink-3);
		font-size: 13px;
		cursor: pointer;
		padding: 0 0 0 6px;
	}
	th.selected-col .sort-btn,
	th.sorted-col .sort-btn {
		color: inherit;
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

	.inspector {
		flex: none;
		width: 260px;
		padding: 20px;
		border-left: var(--border-w) solid var(--ink);
		background: var(--panel);
		overflow-y: auto;
	}
	.inspector-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}
	.inspector-head .col-name {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 18px;
	}
	.inspector-note {
		font-family: var(--font-hand);
		font-size: 15px;
		color: var(--ink-3);
		margin: 0 0 18px;
	}
	.stat-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-bottom: 20px;
	}
	.stat {
		background: var(--panel-2);
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		padding: 10px 12px;
	}
	.stat-label {
		display: block;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.5px;
		color: var(--ink-3);
		text-transform: uppercase;
	}
	.stat-value {
		display: block;
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 21px;
	}
	.histogram {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		height: 60px;
	}
	.histogram .bar {
		flex: 1;
		min-height: 2px;
		background: var(--sky);
		border: 2px solid var(--ink);
		border-radius: 2px 2px 0 0;
	}

	@media (max-width: 720px) {
		.inspector {
			display: none;
		}
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
