import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedCaseStudies } from '@/lib/case-studies';
import type { CaseStudyMeta } from '@/lib/case-study-types';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';
import { CoverImage } from '@/components/work/CoverImage';
import { FeaturedProject } from '@/components/home/FeaturedProject';
import { screensBySlug } from '@/content/work/screens';
import { LifecycleVisual } from '@/components/work/LifecycleVisual';
import {
  ProjectShowcase,
  type ShowcaseProject,
} from '@/components/ui/project-showcase';

/**
 * The cursor preview for a project: its real cover when one exists, otherwise
 * the illustrative lifecycle diagram (never a fake screenshot). Rendered on the
 * server, so no preview code reaches the home page's client bundle.
 */
function ProjectThumb({ project }: { project: CaseStudyMeta }) {
  if (project.cover) {
    return (
      <CoverImage
        src={project.cover}
        alt=""
        fill
        sizes="280px"
        className="object-cover"
      />
    );
  }
  return (
    <div className="absolute inset-0 bg-bg-elevated p-2">
      <LifecycleVisual />
    </div>
  );
}

/**
 * Selected work (Section 6.1): a header row, then every featured project with
 * real screens as a showcase card (`FeaturedProject`) in a scroll stack. On
 * large screens each card pins below the header while the next slides up
 * over it, and the covered card eases back. Projects without screens follow
 * in the 21st.dev `project-showcase` list with the cursor preview.
 */
export async function SelectedWork() {
  const featured = await getFeaturedCaseStudies();
  if (featured.length === 0) return null;
  // Projects with real screens get a showcase card; the rest go in the list.
  const showcased = featured.filter(
    (project) => screensBySlug[project.slug]?.length,
  );
  const cards = showcased.map((project) => {
    const screens = screensBySlug[project.slug];
    return {
      project,
      number: String(featured.indexOf(project) + 1).padStart(2, '0'),
      // Back to front: a secondary screen, the workflow screen, the cover.
      fan: [screens[1], screens[3], screens[0]].filter(Boolean),
    };
  });

  const projects: ShowcaseProject[] = featured
    .filter((project) => !showcased.includes(project))
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      description: project.summary,
      meta: project.year ?? project.type,
      href: `/work/${project.slug}`,
      thumb: <ProjectThumb project={project} />,
    }));

  return (
    <Section id="work" aria-labelledby="work-heading">
      <Container className="flex flex-col gap-12 md:gap-16">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <SectionLabel number="03" title="Selected Work" />
            <div id="work-heading">
              <EmphasisHeading level={2} className="text-display-l">
                Selected [work].
              </EmphasisHeading>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:items-end lg:text-right">
            <p className="max-w-[40ch] text-body text-text-muted">
              Systems built for real businesses. Open one for the full case
              study.
            </p>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 rounded-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              All projects
              <ArrowRight
                size={18}
                strokeWidth={1.5}
                aria-hidden
                className="transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* A scroll stack: each card pins below the header and the next one
            slides up over it ("Work stack" in globals.css). */}
        {cards.length > 0 && (
          <ol
            className="work-stack"
            style={
              {
                timelineScope: cards
                  .map((_, i) => `--work-card-${i}`)
                  .join(', '),
              } as CSSProperties
            }
          >
            {cards.map(({ project, number, fan }, i) => (
              <li key={project.slug} className="work-stack-item">
                {/* Scrolls normally (the card is sticky): it drives the
                    previous card's "covered" animation. */}
                <span
                  aria-hidden
                  className="work-stack-marker"
                  style={
                    { viewTimelineName: `--work-card-${i}` } as CSSProperties
                  }
                />
                <div
                  className="work-stack-card"
                  data-covered={i < cards.length - 1 ? '' : undefined}
                  style={
                    {
                      '--i': i,
                      animationTimeline:
                        i < cards.length - 1
                          ? `--work-card-${i + 1}`
                          : undefined,
                    } as CSSProperties
                  }
                >
                  <FeaturedProject
                    project={project}
                    number={number}
                    screens={fan}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}

        {projects.length > 0 && <ProjectShowcase projects={projects} />}
      </Container>
    </Section>
  );
}
