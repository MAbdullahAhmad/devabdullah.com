import type { MetadataRoute } from 'next';
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site';

/**
 * robots.txt (Blueprint Section 12.3). Crawling is allowed only when
 * SITE_INDEXABLE=true (production); otherwise everything is disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/styleguide'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
