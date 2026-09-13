import type { OperationManifest } from '../../core/types';

export type SortRowsParams = {
	column: string;
	direction: 'asc' | 'desc';
};

export const manifest: OperationManifest<SortRowsParams> = {
	id: 'sort-rows',
	category: 'sort',
	paramsSchema: {}, // TODO: real schema
	surfaces: ['editor', 'pipeline']
};
