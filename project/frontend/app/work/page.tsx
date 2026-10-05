import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllCaseStudies } from '@/lib/case-studies';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { WorkIndex } from '@/components/work/WorkIndex';
import { WorkIndexFromParams } from '@/components/work/WorkIndexFromParams';
import { WorkFilmstrip } from '@/components/work/WorkFilmstrip';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Projects and case studies for Abdullah Ahmad, added as verified work is provided.',
  alternates: { canonical: '/work' },
};

/**
 * Work index (Section 6.2). The header drifts back as the page scrolls, the
 * rows rise into view, and the screenshot filmstrip slides with the scroll.
 */
export default async function WorkPage() {
  const projects = await getAllCaseStudies();

  return (
    <div className="pb-16 pt-32 md:pt-40">
      <Container className="flex flex-col gap-16">
        <header className="work-head hero-rise flex max-w-[48rem] flex-col gap-5">
          <SectionLabel title="Work" />
          <EmphasisHeading level={1} className="text-display-l">
            The [work].
          </EmphasisHeading>
          <p className="max-w-[52ch] text-pretty text-body-l text-text-muted">
            Verified projects and case studies will appear here as they are
            added.
          </p>
        </header>

        <Suspense
          fallback={<WorkIndex projects={projects} activeType={null} />}
        >
          <WorkIndexFromParams projects={projects} />
        </Suspense>
      </Container>

      <WorkFilmstrip projects={projects} />
    </div>
  );
}
