import type { CaseStudyMeta } from '@/lib/case-studies';
import type { CaseStudyScreen } from '@/lib/case-study-types';
import { ArrowUpRight } from 'lucide-react';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { Button } from '@/components/foundation/Button';
import { ProjectPreview } from '@/components/work/ProjectPreview';
import { ScreenTour } from '@/components/work/ScreenTour';

/**
 * Case-study hero (Section 6.3): label, title (`display-m`), one-line impact,
 * and the project visual: the screen tour when the project has real
 * screenshots, otherwise its preview in the shared browser frame.
 */
export function CaseHero({
  meta,
  index,
  screens,
}: {
  meta: CaseStudyMeta;
  index: number;
  screens?: CaseStudyScreen[];
}) {
  return (
    <header className="flex flex-col gap-10">
      <div className="hero-rise flex max-w-[48rem] flex-col gap-5">
        <SectionLabel
          number="Case Study"
          title={String(index + 1).padStart(2, '0')}
        />
        <h1 className="text-balance text-display-m text-text">{meta.title}</h1>
        <p className="max-w-[55ch] text-pretty text-body-l text-text-muted">
          {meta.summary}
        </p>
        {meta.url && (
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button
              href={meta.url}
              variant="primary"
              target="_blank"
              rel="noopener"
            >
              Visit live site
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden />
            </Button>
            <span className="font-mono text-label text-text-subtle">
              {new URL(meta.url).host}
            </span>
          </div>
        )}
      </div>

      <div className="hero-rise" style={{ animationDelay: '120ms' }}>
        {screens?.length ? (
          <ScreenTour
            screens={screens}
            label={`${meta.title} screens`}
            app={meta.appName}
          />
        ) : (
          <ProjectPreview
            project={meta}
            sizes="(min-width: 1280px) 1184px, 100vw"
            className="mx-auto w-full max-w-3xl"
          />
        )}
      </div>
    </header>
  );
}
