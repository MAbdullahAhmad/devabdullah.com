'use client';

import { useSearchParams } from 'next/navigation';
import type { CaseStudyMeta } from '@/lib/case-studies';
import { isWorkCategory } from '@/lib/work-categories';
import { WorkIndex } from '@/components/work/WorkIndex';

/**
 * Reads `?type=` for the index. Rendered inside `<Suspense>` so the rest of
 * /work stays prerendered (the fallback is the unfiltered list).
 */
export function WorkIndexFromParams({
  projects,
}: {
  projects: CaseStudyMeta[];
}) {
  const type = useSearchParams().get('type');
  return (
    <WorkIndex
      projects={projects}
      activeType={isWorkCategory(type) ? type : null}
    />
  );
}
