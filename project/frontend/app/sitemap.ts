import type { MetadataRoute } from 'next';
import { getCaseStudyPageSlugs } from '@/lib/case-studies';
import { SITE_URL } from '@/lib/site';

/** sitemap.xml (Blueprint Section 12.3). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const pages = [
    '',
    '/services',
    '/book-a-call',
    '/work',
    '/about',
    '/cv',
    '/contact',
    '/my-mac',
    '/privacy',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  const studies = (await getCaseStudyPageSlugs()).map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));
  return [...pages, ...studies];
}
