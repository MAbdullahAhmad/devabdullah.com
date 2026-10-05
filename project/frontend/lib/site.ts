/**
 * Canonical site origin, used for absolute URLs (the hero's API view, SEO).
 * Set NEXT_PUBLIC_SITE_URL per environment; defaults to the planned domain
 * (Blueprint Section 3.1).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devabdullah.com'
).replace(/\/$/, '');

/**
 * Search indexing is opt-in (set SITE_INDEXABLE=true on the production
 * deployment only), so local builds and preview deployments are never indexed.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === 'true';
