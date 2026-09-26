<script lang="ts">
	import { sharedDocument } from '$lib/state/shared-document.svelte';
	import { tableToJson, type JsonExportOptions } from '$lib/formats/json/serialize';
	import { tableToCsv } from '$lib/formats/csv/serialize';
	import { downloadText } from '$lib/ui/download';
	import { highlightJson } from '$lib/ui/json-highlight';
	import ThemeToggle from '$lib/ui/ThemeToggle.svelte';

	type FormatId = 'json' | 'csv' | 'xlsx' | 'yml' | 'sql';
	const FORMATS: ReadonlyArray<{ id: FormatId; label: string; ext: string; available: boolean }> = [
		{ id: 'json', label: 'JSON', ext: '.json', available: true },
		{ id: 'csv', label: 'CSV', ext: '.csv', available: true },
		{ id: 'xlsx', label: 'Excel', ext: '.xlsx', available: false },
		{ id: 'yml', label: 'YAML', ext: '.yml', available: false },
		{ id: 'sql', label: 'SQL', ext: 'inserts', available: false }
	];

	let format = $state<FormatId>('json');
	let shape = $state<'rows' | 'columnar'>('rows');
	let pretty = $state(true);
	let namedKeys = $state(true);

	const table = $derived(sharedDocument.table);
	const fileBaseName = $derived(sharedDocument.fileName.replace(/\.[^.]+$/, '') || 'data');

	const PREVIEW_ROWS = 3;

	function jsonData(t: NonNullable<typeof table>, rowLimit: number): unknown {
		if (shape === 'columnar') {
			return Object.fromEntries(t.columns.map((c) => [c.name, t.getColumn(c.name).slice(0, rowLimit)]));
		}
		const names = t.columns.map((c) => c.name);
		return t
			.getRows(0, Math.min(rowLimit, t.rowCount))
			.map((row) => (namedKeys ? Object.fromEntries(names.map((n) => [n, row[n]])) : names.map((n) => row[n])));
	}

	const fullText = $derived.by(() => {
		if (!table) return '';
		if (format === 'csv') return tableToCsv(table);
		const options: JsonExportOptions = { shape, pretty, namedKeys };
		return tableToJson(table, options);
	});

	// The preview only ever renders PREVIEW_ROWS of data — never the whole
	// file — so opening a 100k-row file doesn't also mean stringifying and
	// syntax-highlighting 100k rows just to look at the top of the file.
	const previewText = $derived.by(() => {
		if (!table) return '';
		if (format === 'csv') {
			const lines = tableToCsv(table).split('\n').filter((l) => l.length > 0);
			const shown = lines.slice(0, PREVIEW_ROWS + 1); // +1 for the header row
			return lines.length > shown.length ? shown.join('\n') + '\n…' : shown.join('\n');
		}
		const text = pretty
			? JSON.stringify(jsonData(table, PREVIEW_ROWS), null, 2)
			: JSON.stringify(jsonData(table, PREVIEW_ROWS));
		if (table.rowCount <= PREVIEW_ROWS || shape === 'columnar') return text;
		const marker = namedKeys ? '{ … }' : '[ … ]';
		return pretty ? text.replace(/\n\]$/, `,\n  ${marker}\n]`) : text.replace(/\]$/, `,${marker}]`);
	});

	const previewHtml = $derived(format === 'json' ? highlightJson(previewText) : '');

	const previewLabel = $derived.by(() => {
		if (!table) return '';
		if (format === 'csv' || shape !== 'columnar') {
			return `first ${Math.min(PREVIEW_ROWS, table.rowCount)} of ${table.rowCount}`;
		}
		return `${table.columns.length} columns · ${table.rowCount} rows each`;
	});

	function download() {
		if (!table) return;
		const meta = FORMATS.find((f) => f.id === format)!;
		downloadText(fullText, fileBaseName + meta.ext, format === 'csv' ? 'text/csv' : 'application/json');
	}
</script>

<svelte:head>
	<title>Convert – csv.bundle.tools</title>
	<meta name="description" content="Convert your CSV to JSON or another format and preview the result, entirely in your browser." />
</svelte:head>

<div class="convert">
	<div class="file-bar">
		<a class="wordmark" href="/">csv<span class="dot">.</span></a>
		<a class="pill" href="https://bundle.tools">part of Bundle</a>
		{#if table}
			<div class="file-chip">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
					<path
						d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
						stroke="var(--sky-d)"
						stroke-width="1.8"
					/>
				</svg>
				<span class="file-name">{sharedDocument.fileName}</span>
			</div>
		{/if}
		<div class="file-bar-right">
			{#if table}
				<span class="privacy-note">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink)" stroke-width="2.2" />
						<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink)" stroke-width="2.2" />
					</svg>
					On your device
				</span>
				<a class="btn btn-secondary" href="/editor">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
						<path d="M15 6l-6 6 6 6" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					Back to table
				</a>
			{/if}
			<ThemeToggle />
		</div>
	</div>

	{#if !table}
		<div class="empty-state">
			<p>No file loaded yet.</p>
			<a class="btn btn-primary" href="/editor">Open a file</a>
		</div>
	{:else}
		<div class="convert-body">
			<h1>Convert &amp; <em>inspect</em></h1>
			<p class="lede">Change the format, or get a feel for what's inside.</p>

			<div class="convert-layout">
				<div class="convert-controls">
					<div class="panel">
						<span class="panel-label">Convert to</span>
						<div class="format-list">
							{#each FORMATS as f (f.id)}
								<button
									type="button"
									class="format-row"
									class:selected={format === f.id}
									disabled={!f.available}
									onclick={() => (format = f.id)}
								>
									<span>{f.label}</span>
									{#if format === f.id}
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
											<path d="M5 13l4 4L19 7" stroke="var(--ink-on-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									{:else}
										<span class="format-ext">{f.ext}</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>

					{#if format === 'json'}
						<div class="panel">
							<span class="panel-label">Options</span>
							<div class="segmented">
								<button type="button" class:active={shape === 'rows'} onclick={() => (shape = 'rows')}>
									Array of objects
								</button>
								<button type="button" class:active={shape === 'columnar'} onclick={() => (shape = 'columnar')}>
									Columnar
								</button>
							</div>

							<label class="switch-row">
								<span>Pretty-print</span>
								<span class="switch" class:on={pretty}>
									<input type="checkbox" bind:checked={pretty} />
									<span class="switch-thumb"></span>
								</span>
							</label>
							<label class="switch-row" class:disabled={shape === 'columnar'}>
								<span>Column names as keys</span>
								<span class="switch" class:on={namedKeys}>
									<input type="checkbox" bind:checked={namedKeys} disabled={shape === 'columnar'} />
									<span class="switch-thumb"></span>
								</span>
							</label>
						</div>
					{/if}

					<button type="button" class="btn btn-primary download-btn" onclick={download}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path d="M12 3v13m0 0l-5-5m5 5l5-5M4 21h16" stroke="var(--ink-on-accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						Download {FORMATS.find((f) => f.id === format)?.label}
					</button>
					<p class="hand-note">converted right here, in this tab</p>
				</div>

				<div class="code-window">
					<div class="code-titlebar">
						<span class="code-dots"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-blue"></span></span>
						<span class="code-filename">{fileBaseName}.{format}</span>
						<span class="code-meta">{previewLabel}</span>
					</div>
					<pre class="code-body"><code>{#if format === 'json'}{@html previewHtml}{:else}{previewText}{/if}</code></pre>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.convert {
		display: flex;
		flex-direction: column;
		flex: 1;
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
	.pill {
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-2);
		border: 2px solid var(--ink);
		border-radius: 999px;
		padding: 3px 10px;
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

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 60px 20px;
		color: var(--ink-2);
	}

	.convert-body {
		padding: 24px clamp(20px, 4.5vw, 40px) 40px;
	}
	.convert-body h1 {
		font-family: var(--font-serif);
		font-size: 32px;
		margin: 0;
	}
	.convert-body h1 em {
		color: var(--terra);
	}
	.lede {
		color: var(--ink-2);
		margin: 6px 0 24px;
	}

	.convert-layout {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}
	.convert-controls {
		flex: none;
		width: 300px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.panel {
		background: var(--panel);
		border: var(--border-w) solid var(--ink);
		border-radius: var(--radius);
		box-shadow: var(--shadow-hard-sm);
		padding: 16px;
	}
	.panel-label {
		display: block;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.6px;
		text-transform: uppercase;
		color: var(--ink-3);
		margin-bottom: 10px;
	}
	.format-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.format-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font: inherit;
		font-size: 15px;
		font-weight: 700;
		background: var(--panel-2);
		border: var(--border-w) solid var(--ink);
		border-radius: 10px;
		padding: 12px 14px;
		cursor: pointer;
		color: var(--ink);
	}
	.format-row.selected {
		background: var(--terra);
		color: var(--ink-on-accent);
		box-shadow: var(--shadow-hard-sm);
	}
	.format-row:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
	.format-ext {
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-3);
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
		padding: 9px 6px;
		font: inherit;
		font-size: 12.5px;
		font-weight: 600;
		cursor: pointer;
		color: var(--ink);
	}
	.segmented button:last-child {
		border-right: none;
	}
	.segmented button.active {
		background: var(--lav);
		color: var(--ink-on-accent);
	}

	.switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 12px;
		cursor: pointer;
	}
	.switch-row:last-child {
		margin-bottom: 0;
	}
	.switch-row.disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.switch {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 38px;
		height: 22px;
		border: var(--border-w) solid var(--ink);
		border-radius: 999px;
		background: var(--panel-2);
		flex: none;
	}
	.switch.on {
		background: var(--lime);
	}
	.switch input {
		position: absolute;
		inset: 0;
		opacity: 0;
		margin: 0;
		cursor: pointer;
	}
	.switch-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--ink);
		transform: translateX(3px);
		transition: transform 0.12s ease;
	}
	.switch.on .switch-thumb {
		transform: translateX(18px);
		background: var(--ink-on-accent);
	}

	.download-btn {
		width: 100%;
		justify-content: center;
	}
	.hand-note {
		font-family: var(--font-hand);
		font-size: 18px;
		color: var(--terra-d);
		text-align: center;
		margin: -4px 0 0;
	}

	.code-window {
		flex: 1;
		min-width: 0;
		background: #1b1914;
		border: var(--border-w) solid var(--ink);
		border-radius: var(--radius);
		box-shadow: var(--shadow-hard-sm);
		overflow: hidden;
	}
	.code-titlebar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		background: #24211a;
		border-bottom: 1px solid rgba(240, 234, 217, 0.14);
	}
	.code-dots {
		display: flex;
		gap: 6px;
	}
	.code-dots span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}
	.dot-red {
		background: var(--terra);
	}
	.dot-yellow {
		background: var(--lime);
	}
	.dot-blue {
		background: var(--sky);
	}
	.code-filename {
		font-size: 13px;
		font-weight: 600;
		color: #d8d2c2;
	}
	.code-meta {
		margin-left: auto;
		font-size: 12px;
		color: #9c9688;
	}
	.code-body {
		margin: 0;
		padding: 18px 20px;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.6;
		color: #d8d2c2;
		overflow: auto;
		max-height: 70vh;
		white-space: pre;
	}
	.code-body :global(.json-key) {
		color: var(--terra-d);
	}
	.code-body :global(.json-string) {
		color: #9fd88a;
	}
	.code-body :global(.json-number) {
		color: var(--lime);
	}
	.code-body :global(.json-boolean),
	.code-body :global(.json-null) {
		color: var(--sky);
	}

	@media (max-width: 760px) {
		.convert-layout {
			flex-direction: column;
		}
		.convert-controls {
			width: 100%;
		}
	}
</style>
