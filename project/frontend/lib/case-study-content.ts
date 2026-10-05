import 'server-only';
import type { ComponentType } from 'react';

import { getAllCaseStudies } from '@/lib/case-studies';
import type { CaseStudyHeading, CaseStudyMeta } from '@/lib/case-study-types';

export interface CaseStudy {
  meta: CaseStudyMeta;
  Content: ComponentType;
  headings: CaseStudyHeading[];
}

/**
 * Full case-study content loader.
 *
 * Abdullah's initial portfolio intentionally ships without inherited case-study
 * bodies. When verified projects are supplied, add their MDX imports here and
 * register their metadata in `content/work/index.ts`.
 */
export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const meta = (await getAllCaseStudies()).find((item) => item.slug === slug);
  if (!meta || meta.caseStudy === false) return null;

  return null;
}
