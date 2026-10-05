import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CaseStudyMeta } from '@/lib/case-study-types';
import { screensBySlug } from '@/content/work/screens';
import { Container } from '@/components/layout/Container';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';

/**
 * "Inside the work" on /work: every real screenshot, in two rows that slide in
 * opposite directions as the page scrolls. Pure CSS (a scroll-driven
 * animation on the section's view timeline, see "Work filmstrip" in
 * `styles/globals.css`); browsers without it, and reduced motion, show the
 * rows still. Decorative: the screens and their descriptions are on each case
 * study, which the caption links to.
 */
export function WorkFilmstrip({ projects }: { projects: CaseStudyMeta[] }) {
  const shots = projects.flatMap((project) =>
    (screensBySlug[project.slug] ?? []).map((screen) => ({
      ...screen,
      project,
    })),
  );
  if (shots.length < 4) return null;

  const rows = [
    shots.filter((_, i) => i % 2 === 0),
    shots.filter((_, i) => i % 2 === 1),
  ];
  const featured = shots[0].project;

  return (
    <section
      aria-labelledby="filmstrip-heading"
      className="work-filmstrip flex flex-col gap-12 overflow-x-clip py-24 md:py-32"
    >
      <Container className="flex flex-col gap-4">
        <SectionLabel title="Inside the work" />
        <div id="filmstrip-heading">
          <EmphasisHeading className="text-display-m">
            Real screens, real [systems].
          </EmphasisHeading>
        </div>
      </Container>

      <div aria-hidden className="flex flex-col gap-4 md:gap-6">
        {rows.map((row, r) => (
          <div
            key={r}
            className={`filmstrip-row flex w-max gap-4 md:gap-6 filmstrip-row-${r + 1}`}
          >
            {[...row, ...row].map((shot, i) => (
              <div
                key={`${shot.src}-${i}`}
                className="filmstrip-tile relative aspect-[1280/730] w-[16rem] shrink-0 overflow-hidden rounded-md border border-border bg-surface md:w-[26rem]"
              >
                <Image
                  src={shot.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 416px, 256px"
                  className="object-cover object-top"
                />
                <span className="filmstrip-label absolute bottom-2 left-2 rounded-pill border border-border bg-bg-elevated/85 px-2.5 py-1 text-label text-text backdrop-blur-md">
                  {shot.title}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Container>
        <Link
          href={`/work/${featured.slug}`}
          className="group inline-flex items-center gap-2 rounded-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Take the full tour of the {featured.title}
          <ArrowRight
            size={18}
            strokeWidth={1.5}
            aria-hidden
            className="transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-1"
          />
        </Link>
      </Container>
    </section>
  );
}
