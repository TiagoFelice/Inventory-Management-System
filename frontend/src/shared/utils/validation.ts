export const isRequired = (label: string) => (value: string) =>
  value.length === 0 ? `${label} is required` : null;
