import type { CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { profile, type Role } from '@/content/profile';
import { cn } from '@/lib/cn';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionLabel } from '@/components/foundation/SectionLabel';
import { EmphasisHeading } from '@/components/foundation/EmphasisHeading';

type LogItem =
  | { kind: 'commit'; role: Role; init: boolean; current: boolean; id: string }
  | { kind: 'merge'; from: string; to: string; date: string; id: string };

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const city = (location: string) => location.split(',')[0].trim();

/** Newest first; each promotion becomes a merge marker above the new role. */
function buildLog(roles: Role[]): LogItem[] {
  const items: LogItem[] = [];
  roles.forEach((role, index) => {
    if (role.promotedFrom) {
      items.push({
        kind: 'merge',
        from: slug(role.promotedFrom),
        to: slug(role.title),
        date: role.start,
        id: `merge-${index}`,
      });
    }
    items.push({
      kind: 'commit',
      role,
      init: index === roles.length - 1,
      current: role.end === 'Present',
      id: `role-${index}`,
    });
  });
  return items;
}

/** The graph gutter node: a dot for roles, a diamond for merges. */
function Node({
  kind,
  current,
}: {
  kind: 'commit' | 'merge';
  current?: boolean;
}) {
  return (
    <span className="relative z-10 flex size-6 shrink-0 items-center justify-center">
      {kind === 'merge' ? (
        <span className="size-2.5 rotate-45 border border-accent bg-bg" />
      ) : (
        <span
          className={cn(
            'size-2.5 rounded-pill ring-4 ring-bg',
            current ? 'bg-accent' : 'bg-text-muted',
          )}
        />
      )}
    </span>
  );
}

/**
 * Experience as a git commit log (Section 6.1, Section 7). A thin line joins
 * the nodes like a git graph; promotions appear as diamond "merge" markers.
 * Each role is a native `<details>` that expands to show up to three CV
 * bullets, with no JavaScript.
 */
export function CommitLog() {
  if (profile.experience.length === 0) return null;
  const log = buildLog(profile.experience);

  return (
    <Section id="experience" aria-labelledby="experience-heading">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <SectionLabel number="05" title="Experience" />
          <div id="experience-heading">
            <EmphasisHeading level={2} className="text-display-l">
              Experience [timeline].
            </EmphasisHeading>
          </div>
        </div>

        <div className="relative">
          {/* The git graph line, centred on the node column. */}
          <span
            data-reveal="draw"
            className="absolute bottom-7 left-3 top-7 w-px -translate-x-1/2 bg-border"
            aria-hidden
          />

          <div className="flex flex-col">
            {log.map((item, index) =>
              item.kind === 'merge' ? (
                <div
                  key={item.id}
                  data-reveal="left"
                  style={
                    { '--reveal-delay': `${index * 0.07}s` } as CSSProperties
                  }
                  className="flex items-center gap-4 py-3 font-mono text-label"
                >
                  <Node kind="merge" />
                  <span className="w-44 shrink-0 text-text-subtle">
                    {item.date}
                  </span>
                  <span className="text-accent-text">
                    merge: {item.from} → {item.to}
                  </span>
                </div>
              ) : (
                <details
                  key={item.id}
                  data-reveal="left"
                  style={
                    { '--reveal-delay': `${index * 0.07}s` } as CSSProperties
                  }
                  className="disclosure group/role"
                >
                  <summary className="group flex items-start gap-4 rounded-md py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:items-center">
                    <Node kind="commit" current={item.current} />
                    <span className="flex flex-1 flex-col gap-1 md:flex-row md:items-baseline md:gap-4">
                      <span className="w-44 shrink-0 font-mono text-label text-text-subtle">
                        {item.role.start} –{' '}
                        {item.current ? 'now' : item.role.end}
                      </span>
                      <span className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
                        <h3 className="text-h4 text-text transition-colors group-hover:text-accent-text">
                          {item.init && (
                            <span className="mr-2 font-mono text-label text-text-subtle">
                              init:
                            </span>
                          )}
                          {item.role.title}
                        </h3>
                        <span className="text-body-s text-text-muted">
                          {item.role.companyShort ?? item.role.company} ·{' '}
                          {city(item.role.location)}
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.5}
                      aria-hidden
                      className="mt-1 shrink-0 text-text-subtle transition-transform ease-out [transition-duration:var(--dur-base)] group-open/role:rotate-180 md:mt-0"
                    />
                  </summary>
                  <ul className="flex flex-col gap-2 pb-5 pl-10 md:pl-[14.5rem]">
                    {item.role.bullets.slice(0, 3).map((bullet) => (
                      <li
                        key={bullet}
                        className="relative max-w-[62ch] pl-4 text-body-s text-text-muted before:absolute before:left-0 before:top-[0.7em] before:size-1 before:rounded-pill before:bg-border-strong"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </details>
              ),
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
