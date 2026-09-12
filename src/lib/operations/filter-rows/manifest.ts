import type { OperationManifest } from '../../core/types';

export type FilterRowsParams = {
  column: string;
  operator: 'eq' | 'neq' | 'contains' | 'gte' | 'lte' | 'isEmpty' | 'notEmpty';
  value?: string | number;
};

export const manifest: OperationManifest<FilterRowsParams> = {
  id: 'filter-rows',
  category: 'filter',
  paramsSchema: {}, // TODO: real schema
  surfaces: ['editor', 'pipeline'],
};
