// All heavy CSV compute off the main thread so the grid never blocks. Two
// jobs: parsing raw bytes into a table, and applying the filter/sort
// operation log to one. Both
// cross the worker boundary as Arrow's own IPC bytes (transferable), never
// as a giant array of row objects.
import * as arrow from 'apache-arrow';
import { parseCsv } from '../lib/formats/csv/parse';
import { decodeBytes } from '../lib/formats/csv/decode';
import { fromIPC } from '../lib/core/table';
import { selectEngine } from '../lib/engine/select-engine';
import type { OperationInvocation } from '../lib/core/types';

export interface CsvParseRequest {
	type: 'parse';
	requestId: number;
	buffer: ArrayBuffer;
	encoding: string;
	delimiter?: string;
	hasHeader: boolean;
}

export interface ApplyLogRequest {
	type: 'applyLog';
	requestId: number;
	tableIpc: Uint8Array;
	log: OperationInvocation[];
}

export type CsvWorkerRequest = CsvParseRequest | ApplyLogRequest;

export type CsvParseResponse =
	| { type: 'parse'; requestId: number; ok: true; ipc: Uint8Array; delimiter: string }
	| { type: 'parse'; requestId: number; ok: false; error: string };

export type ApplyLogResponse =
	| { type: 'applyLog'; requestId: number; ok: true; ipc: Uint8Array; engine: string }
	| { type: 'applyLog'; requestId: number; ok: false; error: string };

export type CsvWorkerResponse = CsvParseResponse | ApplyLogResponse;

// The app's tsconfig loads DOM lib types (for the rest of the app), which
// declares `self` as `Window`, conflicting with the worker-scope `self` this
// file actually runs under. Sidestep the lib mismatch with a narrow local
// type instead of pulling in "webworker" lib globally.
interface WorkerScope {
	onmessage: ((e: MessageEvent<CsvWorkerRequest>) => void) | null;
	postMessage(message: CsvWorkerResponse, transfer?: Transferable[]): void;
}
const ctx = self as unknown as WorkerScope;

function handleParse(req: CsvParseRequest) {
	const { requestId, buffer, encoding, delimiter, hasHeader } = req;
	try {
		const text = decodeBytes(buffer, encoding);
		const { rows, delimiter: detected } = parseCsv(text, { delimiter, hasHeader });
		if (rows.length === 0) {
			ctx.postMessage({ type: 'parse', requestId, ok: false, error: "Couldn't find any rows." });
			return;
		}
		const ipc = arrow.tableToIPC(arrow.tableFromJSON(rows));
		ctx.postMessage({ type: 'parse', requestId, ok: true, ipc, delimiter: detected }, [ipc.buffer]);
	} catch (err) {
		ctx.postMessage({
			type: 'parse',
			requestId,
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		});
	}
}

async function handleApplyLog(req: ApplyLogRequest) {
	const { requestId, tableIpc, log } = req;
	try {
		const table = fromIPC(tableIpc);
		const engine = await selectEngine(table);
		const result = await engine.applyLog(table, log);
		const ipc = result.toIPC();
		ctx.postMessage({ type: 'applyLog', requestId, ok: true, ipc, engine: engine.name }, [ipc.buffer]);
	} catch (err) {
		ctx.postMessage({
			type: 'applyLog',
			requestId,
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		});
	}
}

ctx.onmessage = (e) => {
	if (e.data.type === 'parse') handleParse(e.data);
	else handleApplyLog(e.data);
};
