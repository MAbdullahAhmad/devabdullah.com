import 'server-only';
import { caseStudies } from '@/content/work';
import type { CaseStudyMeta } from '@/lib/case-study-types';

export type { CaseStudyHeading, CaseStudyMeta } from '@/lib/case-study-types';

const sorted = [...caseStudies].sort((a, b) => a.order - b.order);

const slugs = sorted.map((meta) => meta.slug);
if (new Set(slugs).size !== slugs.length) {
  throw new Error('content/work: duplicate case-study slugs');
}

/** All project metadata, ordered by `order`. Never imports MDX content. */
export async function getAllCaseStudies(): Promise<CaseStudyMeta[]> {
  return sorted;
}

/** Featured projects for the home page — only those with a full case study. */
export async function getFeaturedCaseStudies(): Promise<CaseStudyMeta[]> {
  return sorted.filter((meta) => meta.featured && meta.caseStudy !== false);
}

/** Slugs that get a full `/work/[slug]` page (excludes drawer-only projects). */
export async function getCaseStudyPageSlugs(): Promise<string[]> {
  return sorted
    .filter((meta) => meta.caseStudy !== false)
    .map((meta) => meta.slug);
}

/** The case study after `slug` by order, wrapping around; null if it is the only one. */
export async function getNextCaseStudy(
  slug: string,
): Promise<CaseStudyMeta | null> {
  const pages = sorted.filter((meta) => meta.caseStudy !== false);
  if (pages.length < 2) return null;
  const index = pages.findIndex((meta) => meta.slug === slug);
  return pages[(index + 1) % pages.length];
}
