import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CaseStudyMeta, CaseStudyScreen } from '@/lib/case-study-types';
import { Button } from '@/components/foundation/Button';
import { TechPath } from '@/components/foundation/TechPath';

const SHOT_ORDER = ['back', 'middle', 'front'] as const;

/**
 * The lead project on the home page, as a showcase card: the facts and calls
 * to action on the left, and on the right a fan of three real screens in
 * browser frames. As the card scrolls into view the fan opens out of a neat
 * stack and the card settles from a slight scale; on hover the screens lift.
 * All CSS ("Featured project" in globals.css), scroll-driven where supported;
 * otherwise, and with reduced motion, the fan is simply open.
 *
 * The whole card links to the case study (the title's link is stretched over
 * it); the live-site button sits above that layer.
 */
export function FeaturedProject({
  project,
  number,
  screens,
}: {
  project: CaseStudyMeta;
  number: string;
  /** Front screen last. */
  screens: CaseStudyScreen[];
}) {
  const href = `/work/${project.slug}`;
  const shots = screens.slice(-3);
  const host = project.url ? new URL(project.url).host : null;

  return (
    <article className="work-feature group relative isolate grid overflow-hidden rounded-[1.75rem] border border-border bg-bg-elevated lg:grid-cols-12">
      <div aria-hidden className="work-feature-bg" />

      <div className="flex flex-col gap-6 p-7 md:p-10 lg:col-span-5 lg:justify-between lg:py-12 lg:pl-12 lg:pr-0">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-label tabular-nums text-accent-text">
              {number}
            </span>
            <span className="rounded-pill border border-border bg-bg px-3 py-1 text-label text-text-muted">
              {project.type}
            </span>
            {host && (
              <span className="inline-flex items-center gap-2 text-label text-text-muted">
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex size-full rounded-pill bg-success opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-pill bg-success" />
                </span>
                Live
              </span>
            )}
          </div>

          <h3 className="text-balance text-display-m text-text">
            <Link
              href={href}
              className="after:absolute after:inset-0 after:z-0 after:rounded-[1.75rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
            >
              {project.title}
            </Link>
          </h3>
          <p className="max-w-[44ch] text-pretty text-body-l text-text-muted">
            {project.summary}
          </p>
          <TechPath items={project.stack} />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="inline-flex h-12 items-center gap-2 rounded-pill bg-text px-6 font-medium text-bg transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:-translate-y-0.5">
            Read the case study
            <ArrowRight
              size={18}
              strokeWidth={1.5}
              aria-hidden
              className="transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-1"
            />
          </span>
          {project.url && (
            <Button
              href={project.url}
              variant="secondary"
              size="lg"
              target="_blank"
              rel="noopener"
              className="relative z-20"
            >
              Visit live site
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {/* The fan of screens (decorative: the case study has them all). */}
      <div
        aria-hidden
        className="work-fan pointer-events-none relative min-h-[17rem] sm:min-h-[24rem] lg:col-span-7 lg:min-h-[34rem]"
      >
        {shots.map((shot, index) => (
          <div
            key={shot.src}
            className={`work-shot work-shot-${SHOT_ORDER[index + 3 - shots.length]}`}
          >
            <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
              <span className="size-2 rounded-pill bg-border-strong" />
              <span className="size-2 rounded-pill bg-border-strong" />
              <span className="size-2 rounded-pill bg-border-strong" />
              <span className="ml-3 truncate font-mono text-[0.625rem] text-text-subtle">
                {host ?? project.appName ?? project.slug} / {shot.path}
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised WebPs; plain <img> keeps image code off the home bundle */}
            <img
              src={shot.src}
              alt=""
              width={shot.width}
              height={shot.height}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
        ))}
      </div>
    </article>
  );
}
