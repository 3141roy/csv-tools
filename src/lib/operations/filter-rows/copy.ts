// User-facing strings for filter-rows, kept out of logic.
export const copy = {
  label: 'Filter rows',
  description: 'Keep only rows where a column matches a condition.',
  params: {
    column: 'Column',
    operator: 'Condition',
    value: 'Value',
  },
} as const;
