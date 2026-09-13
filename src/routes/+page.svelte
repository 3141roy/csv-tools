<svelte:head>
	<title>csv.bundle.tools: Any CSV, made legible</title>
</svelte:head>

<!-- The page frame + nav live in +layout.svelte, shared with every route. -->
<div class="landing">
	<!-- HERO -->
	<section class="hero">
		<div class="hero-left">
			<div class="kicker">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
					<rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="var(--ink-on-accent)" stroke-width="2.4" />
					<path d="M8 10V8a4 4 0 0 1 8 0v2" fill="none" stroke="var(--ink-on-accent)" stroke-width="2.4" />
				</svg>
				STAYS ON YOUR DEVICE
			</div>

			<h1 class="headline">
				Any CSV,<br /><span class="headline-italic">made legible.</span>
			</h1>

			<p class="subhead">
				Open a spreadsheet-style view of any CSV, <b>sort and filter</b> to find what you need, tidy
				a few cells, and convert it to JSON or Excel, all in your browser.
			</p>

			<div class="callout">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="callout-icon">
					<circle cx="12" cy="12" r="9.5" fill="var(--sky)" stroke="var(--ink)" stroke-width="2.2" />
					<path d="M12 7.6v.2M12 11v6" stroke="var(--ink-on-accent)" stroke-width="2.4" stroke-linecap="round" />
				</svg>
				<div>
					Built for <b>quick overviews and light clean-up</b>, not heavy analytics. Nothing uploads,
					nothing is stored. It all happens on your device.
				</div>
			</div>

			<div class="ctas">
				<a class="btn btn-primary" href="/editor">
					Drop a CSV to start
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path
							d="M4 12h15M13 6l6 6-6 6"
							stroke="var(--ink-on-accent)"
							stroke-width="2.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
				<a class="btn btn-secondary" href="/editor?sample=1">Try sample data</a>
				<div class="hand-note">
					<svg width="34" height="30" viewBox="0 0 34 30" fill="none" class="hand-arrow">
						<path d="M30 27C20 15 12 6 6 3" stroke="var(--terra-d)" stroke-width="2.4" fill="none" stroke-linecap="round" />
						<path d="M6 3l8 1M6 3l3 7" stroke="var(--terra-d)" stroke-width="2.4" fill="none" stroke-linecap="round" />
					</svg>
					or just paste it in
				</div>
			</div>

			<div class="trust-chips">
				<span class="chip"><span class="dot lime"></span>100% in-browser</span>
				<span class="chip"><span class="dot sky"></span>No sign-up</span>
				<span class="chip"><span class="dot lav"></span>Open source · MIT</span>
			</div>
		</div>

		<div class="hero-right totem-wrap">
			<svg width="460" height="560" viewBox="0 0 460 560" fill="none" class="totem">
				<defs>
					<pattern id="hatch" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<rect width="11" height="11" fill="var(--lav)" />
						<line x1="0" y1="0" x2="0" y2="11" stroke="var(--ink-on-accent)" stroke-width="3.2" />
					</pattern>
				</defs>

				<g class="shape shape-square">
					<rect x="352" y="24" width="46" height="46" rx="12" fill="var(--terra)" stroke="var(--ink-on-accent)" stroke-width="2.6" />
				</g>

				<g class="shape shape-grid">
					<rect x="46" y="8" width="300" height="184" rx="16" fill="var(--sky)" stroke="var(--ink-on-accent)" stroke-width="3.4" />
					<rect x="46" y="8" width="100" height="61" fill="var(--lime)" stroke="var(--ink-on-accent)" stroke-width="2" />
					<rect x="246" y="131" width="100" height="61" fill="var(--panel)" stroke="var(--ink-on-accent)" stroke-width="2" />
					<line x1="146" y1="8" x2="146" y2="192" stroke="var(--ink-on-accent)" stroke-width="2.2" />
					<line x1="246" y1="8" x2="246" y2="192" stroke="var(--ink-on-accent)" stroke-width="2.2" />
					<line x1="46" y1="69" x2="346" y2="69" stroke="var(--ink-on-accent)" stroke-width="2.2" />
					<line x1="46" y1="131" x2="346" y2="131" stroke="var(--ink-on-accent)" stroke-width="2.2" />
				</g>

				<g class="shape shape-band">
					<rect x="70" y="248" width="346" height="66" rx="6" fill="url(#hatch)" stroke="var(--ink-on-accent)" stroke-width="3.4" />
					<rect x="224" y="274" width="38" height="14" rx="3" fill="var(--panel)" stroke="var(--ink-on-accent)" stroke-width="2.4" />
				</g>

				<g class="shape shape-donut">
					<circle cx="165" cy="392" r="80" fill="var(--sky)" stroke="var(--ink-on-accent)" stroke-width="3.4" />
					<circle cx="165" cy="392" r="27" fill="var(--paper)" stroke="var(--ink-on-accent)" stroke-width="3.4" />
				</g>

				<g class="shape shape-chevron">
					<path d="M255 452h190l-95 66z" fill="var(--lime)" stroke="var(--ink-on-accent)" stroke-width="3.4" stroke-linejoin="round" />
				</g>
			</svg>
		</div>
	</section>

	<!-- THREE THINGS -->
	<section class="three-things">
		<div class="section-head">
			<h2>Three things it does</h2>
		</div>
		<div class="cards">
			<article class="card">
				<div class="card-top">
					<div class="card-icon sky">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--ink-on-accent)" stroke-width="2.2" />
							<line x1="3" y1="10" x2="21" y2="10" stroke="var(--ink-on-accent)" stroke-width="2.2" />
							<line x1="9" y1="10" x2="9" y2="20" stroke="var(--ink-on-accent)" stroke-width="2.2" />
						</svg>
					</div>
					<span class="card-num">1</span>
				</div>
				<h3>Look</h3>
				<p>See it as a clean table. Sort, filter, and scan to get the gist of what's in the file.</p>
			</article>

			<article class="card">
				<div class="card-top">
					<div class="card-icon lime">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4z" stroke="var(--ink-on-accent)" stroke-width="2.2" stroke-linejoin="round" />
						</svg>
					</div>
					<span class="card-num">2</span>
				</div>
				<h3>Tidy</h3>
				<p>Fix typos, drop columns, remove duplicates. Small clean-ups, no formulas to learn.</p>
			</article>

			<article class="card">
				<div class="card-top">
					<div class="card-icon lav">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16"
								stroke="var(--ink-on-accent)"
								stroke-width="2.2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<span class="card-num">3</span>
				</div>
				<h3>Convert</h3>
				<p>Turn it into JSON, Excel, or YAML, and check column types at a glance before you send it on.</p>
			</article>
		</div>
	</section>

	<!-- PREVIEW -->
	<section class="preview-section">
		<div class="section-head">
			<h2>One clean table. That's the app.</h2>
		</div>
		<p class="section-lede">
			Open a file and this is what you get, a real grid with sortable columns and typed
			cells, not a mockup.
		</p>

		<div class="preview-frame">
			<div class="preview-inner">
			<div class="preview-filebar">
				<div class="preview-file">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
						<path
							d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
							stroke="var(--sky-d)"
							stroke-width="1.8"
						/>
					</svg>
					<span class="preview-filename">customers_sample.csv</span>
					<span class="preview-meta">12,481 rows · 8 cols</span>
				</div>
				<span class="privacy-note-sm">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none">
						<rect x="5" y="10" width="14" height="10" rx="2" stroke="var(--ink)" stroke-width="2.2" />
						<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="var(--ink)" stroke-width="2.2" />
					</svg>
					On your device
				</span>
			</div>

			<div class="preview-table-wrap">
				<table class="preview-table">
					<thead>
						<tr>
							<th></th>
							<th>id</th>
							<th>name</th>
							<th>email</th>
							<th>country</th>
							<th>plan</th>
							<th class="sorted">signups ↓</th>
							<th>joined</th>
						</tr>
					</thead>
					<tbody>
						{#each [
							{ id: 1021, name: 'Ada Lovelace', email: 'ada@example.com', country: 'UK', plan: 'Pro', signups: '4,210', joined: '2023-02-11' },
							{ id: 1023, name: 'Grace Hopper', email: 'grace@example.com', country: 'US', plan: 'Pro', signups: '3,980', joined: '2022-11-19' },
							{ id: 1029, name: 'Tim Berners-Lee', email: 'tim@example.com', country: 'UK', plan: 'Pro', signups: '3,120', joined: '2022-05-30' },
							{ id: 1026, name: 'Margaret Hamilton', email: 'peg@example.com', country: 'US', plan: 'Pro', signups: '2,765', joined: '2022-08-15' },
							{ id: 1031, name: 'Sophie Wilson', email: 'sophie@example.com', country: 'UK', plan: 'Team', signups: '2,450', joined: '2023-01-07' },
							{ id: 1027, name: 'Dennis Ritchie', email: 'dmr@example.com', country: 'US', plan: 'Team', signups: '1,890', joined: '2023-04-22' },
							{ id: 1035, name: 'Rajeev Motwani', email: 'rajeev@example.com', country: 'IN', plan: 'Team', signups: '1,610', joined: '2023-05-09' },
							{ id: 1036, name: 'Linus Torvalds', email: 'linus@example.com', country: 'FI', plan: 'Free', signups: '1,180', joined: '2023-07-22' }
						] as row, i (row.id)}
							<tr>
								<td class="row-num">{i + 1}</td>
								<td>{row.id}</td>
								<td>{row.name}</td>
								<td>{row.email}</td>
								<td>{row.country}</td>
								<td><span class="plan-chip {row.plan.toLowerCase()}">{row.plan}</span></td>
								<td class="sorted numeric">{row.signups}</td>
								<td>{row.joined}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		</div>
	</section>

	<!-- FOOTER -->
	<footer class="footer">
		<div><b>csv.bundle.tools</b> · part of Bundle · free &amp; open source</div>
		<div>Your data never leaves this tab.</div>
	</footer>
</div>

<style>
	.landing {
		display: flex;
		flex-direction: column;
	}

	/* HERO */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
		gap: 48px;
		padding: 52px clamp(20px, 4.5vw, 64px) 36px;
	}
	.hero-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 22px;
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
		transform: rotate(-2deg);
		box-shadow: var(--shadow-hard-sm);
	}
	.headline {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: clamp(42px, 6vw, 74px);
		line-height: 0.98;
		letter-spacing: -1.5px;
		margin: 0;
	}
	.headline-italic {
		font-style: italic;
		font-weight: 600;
		color: var(--terra);
	}
	.subhead {
		font-size: 19px;
		line-height: 1.5;
		color: var(--ink-2);
		max-width: 560px;
		margin: 0;
	}
	.subhead b {
		color: var(--ink);
	}
	.callout {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		background: var(--panel);
		border: var(--border-w) solid var(--ink);
		border-left: 8px solid var(--sky);
		border-radius: var(--radius);
		padding: 14px 16px;
		max-width: 560px;
		box-shadow: var(--shadow-hard);
		font-size: 15px;
		line-height: 1.45;
	}
	.callout-icon {
		flex: none;
		margin-top: 2px;
	}
	.ctas {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: 4px;
		flex-wrap: wrap;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-weight: 600;
		font-size: 17px;
		color: var(--ink);
		border: var(--border-w) solid var(--ink);
		border-radius: var(--radius);
		padding: 14px 22px;
		box-shadow: var(--shadow-hard);
		cursor: pointer;
		transition: transform 0.08s ease, box-shadow 0.08s ease;
	}
	.btn:hover {
		transform: translate(2px, 2px);
		box-shadow: var(--shadow-press);
	}
	.btn-primary {
		background: var(--terra);
		color: var(--ink-on-accent);
	}
	.btn-secondary {
		background: var(--panel-2);
	}
	.hand-note {
		position: relative;
		font-family: var(--font-hand);
		font-weight: 700;
		font-size: 22px;
		color: var(--terra-d);
		line-height: 1;
		transform: rotate(-4deg);
		padding-top: 28px;
	}
	.hand-arrow {
		position: absolute;
		left: 2px;
		top: -2px;
	}
	.trust-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 8px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 13px;
		font-weight: 600;
		color: var(--ink);
		background: var(--panel);
		border: 2px solid var(--ink);
		border-radius: 999px;
		padding: 6px 13px;
	}
	.dot.lime {
		background: var(--lime);
	}
	.dot.sky {
		background: var(--sky);
	}
	.dot.lav {
		background: var(--lav);
	}
	.chip .dot {
		width: 9px;
		height: 9px;
		border-radius: 999px;
		border: 1.6px solid var(--ink);
	}

	.hero-right {
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}
	.totem {
		max-width: 100%;
		height: auto;
		overflow: visible;
	}

	/* Scattered cluster instead of a stacked column: each shape gets its own
	   tilt and offset, and leans in a little further on hover, staggered so
	   the whole totem feels like it wobbles awake rather than snapping. */
	.shape {
		transform-box: fill-box;
		transform-origin: center;
	}
	.shape-square {
		transform: rotate(12deg);
	}
	.shape-grid {
		transform: rotate(-6deg) translate(-8px, 2px);
	}
	.shape-band {
		transform: rotate(5deg) translate(10px, -6px);
	}
	.shape-donut {
		transform: translate(-18px, 8px);
	}
	.shape-chevron {
		transform: rotate(-9deg) translate(-10px, -14px);
	}
	@media (prefers-reduced-motion: no-preference) {
		.shape {
			transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		}
		.shape-square {
			transition-delay: 0s;
		}
		.shape-grid {
			transition-delay: 0.03s;
		}
		.shape-band {
			transition-delay: 0.06s;
		}
		.shape-donut {
			transition-delay: 0.09s;
		}
		.shape-chevron {
			transition-delay: 0.12s;
		}
		.totem-wrap:hover .shape-square {
			transform: rotate(22deg) translate(4px, -4px);
		}
		.totem-wrap:hover .shape-grid {
			transform: rotate(-10deg) translate(-14px, -4px);
		}
		.totem-wrap:hover .shape-band {
			transform: rotate(9deg) translate(16px, -12px);
		}
		.totem-wrap:hover .shape-donut {
			transform: translate(-26px, 2px) scale(1.04);
		}
		.totem-wrap:hover .shape-chevron {
			transform: rotate(-15deg) translate(-16px, -20px);
		}
	}

	/* THREE THINGS */
	.three-things {
		padding: 8px clamp(20px, 4.5vw, 64px) 40px;
	}
	.section-head {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.section-head h2 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 26px;
		margin: 0;
	}
	.hand-note-static {
		font-family: var(--font-hand);
		font-weight: 700;
		font-size: 20px;
		color: var(--ink-3);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}
	.card {
		background: var(--panel);
		border: var(--border-w) solid var(--ink);
		border-radius: 16px;
		box-shadow: var(--shadow-hard-lg);
		padding: 22px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.card-icon {
		width: 46px;
		height: 46px;
		border-radius: 10px;
		border: var(--border-w) solid var(--ink);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.card-icon.sky {
		background: var(--sky);
	}
	.card-icon.lime {
		background: var(--lime);
	}
	.card-icon.lav {
		background: var(--lav);
	}
	.card-num {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 34px;
		color: var(--ink-3);
	}
	.card h3 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 22px;
		margin: 0;
	}
	.card p {
		font-size: 15px;
		line-height: 1.5;
		color: var(--ink-2);
		margin: 0;
	}

	/* PREVIEW */
	.preview-section {
		padding: 16px clamp(20px, 4.5vw, 64px) 56px;
	}
	.section-lede {
		font-size: 16px;
		color: var(--ink-2);
		max-width: 720px;
		margin: 0 0 24px;
	}
	.preview-frame {
		position: relative;
		border: var(--border-w) solid var(--ink);
		border-radius: 16px;
		box-shadow: var(--shadow-hard-lg);
	}
	/* Its own layer, radius/overflow separate from .preview-frame, so the
	   handwritten badge can sit above the frame's top edge without the
	   frame's own corner-clipping cutting it off. */
	.preview-inner {
		background: var(--panel);
		border-radius: 13.5px;
		overflow: hidden;
	}
	.preview-filebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 14px 20px;
		border-bottom: var(--border-w) solid var(--ink);
		background: var(--panel-2);
		flex-wrap: wrap;
	}
	.preview-file {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
	}
	.preview-filename {
		font-weight: 600;
		color: var(--ink);
	}
	.preview-meta {
		color: var(--ink-2);
	}
	.privacy-note-sm {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
	}
	.preview-table-wrap {
		overflow-x: auto;
	}
	.preview-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13.5px;
		white-space: nowrap;
	}
	.preview-table th,
	.preview-table td {
		padding: 9px 14px;
		text-align: left;
	}
	.preview-table thead th {
		border-bottom: var(--border-w) solid var(--ink);
		font-weight: 600;
	}
	.preview-table tbody td {
		border-bottom: 1px solid var(--hairline);
	}
	.preview-table th.sorted {
		background: var(--lav);
		color: var(--ink-on-accent);
	}
	.preview-table td.sorted {
		background: rgba(198, 183, 242, 0.22);
	}
	.preview-table td.numeric {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.row-num {
		color: var(--ink-3);
	}
	.plan-chip {
		display: inline-block;
		font-size: 12px;
		font-weight: 600;
		border: 1.4px solid var(--ink);
		border-radius: 999px;
		padding: 1px 10px;
	}
	.plan-chip.pro {
		background: var(--lime);
		color: var(--ink-on-accent);
	}
	.plan-chip.team {
		background: var(--sky);
		color: var(--ink-on-accent);
	}
	.plan-chip.free {
		background: var(--panel);
	}

	/* FOOTER */
	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px clamp(20px, 4.5vw, 64px);
		border-top: var(--border-w) solid var(--ink);
		font-size: 13px;
		color: var(--ink-2);
		flex-wrap: wrap;
		gap: 8px;
	}
	.footer b {
		color: var(--ink);
	}

	/* Below this the totem has nowhere good to sit: too narrow to read as a
	   composition, but not narrow enough to justify going full width, so it
	   just leaves blank space under itself. Drop it and let the text column
	   be the whole hero, centered so it reads as a deliberate single column
	   rather than a two-column layout with an empty half. */
	@media (max-width: 1180px) {
		.hero {
			grid-template-columns: 1fr;
		}
		.hero-right {
			display: none;
		}
		.hero-left {
			max-width: 640px;
			margin: 0 auto;
		}
	}

	/* Same width the shared nav (in +layout.svelte) drops its text links,
	   so this loses the room it needs too. */
	@media (max-width: 800px) {
		.hand-note {
			display: none;
		}
	}
</style>
