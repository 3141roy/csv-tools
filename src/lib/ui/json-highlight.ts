// Minimal JSON syntax highlighter for the convert preview pane — no
// highlighting library, just tagging tokens in an already-valid JSON string.
// Escapes first since the source values are exported cell content and must
// never turn into HTML when rendered with {@html}.
function escapeHtml(text: string): string {
	return text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);
}

const TOKEN =
	/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g;

export function highlightJson(json: string): string {
	return escapeHtml(json).replace(TOKEN, (match) => {
		let cls = 'json-number';
		if (match.startsWith('"')) {
			cls = match.endsWith(':') ? 'json-key' : 'json-string';
		} else if (match === 'true' || match === 'false') {
			cls = 'json-boolean';
		} else if (match === 'null') {
			cls = 'json-null';
		}
		return `<span class="${cls}">${match}</span>`;
	});
}
