# csv.bundle.tools

A private, in-browser CSV workbench. Open a CSV, view and edit it in a grid, sort and
filter it, tidy a few things, and convert it to JSON, Excel, or YAML. Everything runs
in your browser. Nothing is uploaded, nothing is stored, no accounts.

Part of the Bundle family of tools.

## Features

- Open a CSV and view it in a spreadsheet-style grid
- Sort and filter to find what you need
- Tidy cells: fix typos, drop columns, remove duplicates
- Convert to JSON, Excel, or YAML
- 100% client-side, no server, no telemetry

## Stack

- SvelteKit, static adapter, single-page app
- TypeScript, strict mode
- Apache Arrow as the in-memory table model
- Web Workers for heavy compute (parsing, transforms, export)

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # build the static site
npm run preview  # preview the production build
npm run check    # type-check
npm test         # run tests
```

## License

MIT. See [LICENSE](LICENSE).
