const isPrimitive = (value: unknown) =>
  value === null || typeof value !== 'object';

/**
 * Pretty JSON that keeps arrays of primitives on one line — easier to scan in
 * a small panel. Output is still valid JSON.
 */
export function formatJson(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.every(isPrimitive)) {
      return `[${value.map((item) => JSON.stringify(item)).join(', ')}]`;
    }
    return `[\n${value.map((item) => inner + formatJson(item, indent + 1)).join(',\n')}\n${pad}]`;
  }
  if (value !== null && typeof value === 'object') {
    return `{\n${Object.entries(value)
      .map(
        ([key, item]) =>
          `${inner}${JSON.stringify(key)}: ${formatJson(item, indent + 1)}`,
      )
      .join(',\n')}\n${pad}}`;
  }
  return JSON.stringify(value);
}
