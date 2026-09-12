// The registry that makes the editor, pipeline, and convert surfaces one app.

import type { Operation, OperationManifest, OperationInvocation, Table } from './types';

/**
 * Operations self-register via their module's manifest so that adding an
 * operation requires NO edits to the editor, pipeline, or convert views,
 * those surfaces read the registry.
 */
export class OperationRegistry {
  private ops = new Map<string, { op: Operation; manifest: OperationManifest }>();

  register(op: Operation, manifest: OperationManifest): void {
    if (this.ops.has(op.id)) throw new Error(`Duplicate operation id: ${op.id}`);
    this.ops.set(op.id, { op, manifest });
  }

  manifests(): OperationManifest[] {
    return [...this.ops.values()].map((e) => e.manifest);
  }

  /** Apply one invocation. Pure at the operation level; the log lives above this. */
  applyOne(table: Table, inv: OperationInvocation): Table {
    if (!inv.enabled) return table;
    const entry = this.ops.get(inv.opId);
    if (!entry) throw new Error(`Unknown operation: ${inv.opId}`);
    return entry.op.apply(table, inv.params);
  }

  /** Replay a whole log. This is what the pipeline (and reproducible "recipes") run. */
  applyLog(table: Table, log: OperationInvocation[]): Table {
    return log.reduce((t, inv) => this.applyOne(t, inv), table);
  }
}

export const registry = new OperationRegistry();
