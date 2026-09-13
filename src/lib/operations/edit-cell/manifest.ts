import type { OperationManifest } from '../../core/types';

export type EditCellParams = {
	rowId: number;
	column: string;
	value: unknown;
};

export const manifest: OperationManifest<EditCellParams> = {
	id: 'edit-cell',
	category: 'edit',
	paramsSchema: {}, // TODO: real schema
	surfaces: ['editor']
};
