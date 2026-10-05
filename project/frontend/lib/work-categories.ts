/** Project categories used by the /work filters (Blueprint Section 6.2). */
export const WORK_CATEGORIES = {
  saas: 'SaaS',
  pos: 'POS',
  cms: 'CMS',
  internal: 'Internal tools',
  freelance: 'Freelance',
} as const;

export type WorkCategory = keyof typeof WORK_CATEGORIES;

export function isWorkCategory(value: unknown): value is WorkCategory {
  return typeof value === 'string' && value in WORK_CATEGORIES;
}
