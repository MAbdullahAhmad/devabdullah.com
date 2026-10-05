/** Stable, URL-safe id for a heading, e.g. "The hardest problem" → "the-hardest-problem". */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
