import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllCaseStudies,
  getCaseStudyPageSlugs,
  getNextCaseStudy,
} from '@/lib/case-studies';
import { getCaseStudy } from '@/lib/case-study-content';
import { screensBySlug } from '@/content/work/screens';
import { Container } from '@/components/layout/Container';
import { CaseHero } from '@/components/work/CaseHero';
import { MetaSidebar } from '@/components/work/MetaSidebar';
import { TableOfContents } from '@/components/work/TableOfContents';
import { NextProject } from '@/components/work/NextProject';

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getCaseStudyPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<'/work/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const study = await getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.meta.title} — Case Study`,
    description: study.meta.summary,
    alternates: { canonical: `/work/${slug}` },
  };
}

/** Case study (Section 6.3): hero, sticky meta + contents, MDX body, next link. */
export default async function CaseStudyPage(props: PageProps<'/work/[slug]'>) {
  const { slug } = await props.params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const all = await getAllCaseStudies();
  const index = all.findIndex((meta) => meta.slug === slug);
  const next = await getNextCaseStudy(slug);
  const { meta, Content, headings } = study;

  return (
    <article className="pb-16 pt-32 md:pt-40">
      <Container className="flex flex-col gap-16 md:gap-24">
        <CaseHero meta={meta} index={index} screens={screensBySlug[slug]} />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-10 lg:sticky lg:top-28">
              <MetaSidebar meta={meta} />
              <div className="hidden lg:block">
                <TableOfContents headings={headings} />
              </div>
            </div>
          </aside>

          <div className="max-w-reading lg:col-span-8">
            <Content />
          </div>
        </div>

        <NextProject next={next} />
      </Container>
    </article>
  );
}
