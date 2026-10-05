'use client';

import {
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowRight, LayoutGrid, List, X } from 'lucide-react';
import type { CaseStudyMeta } from '@/lib/case-studies';
import { WORK_CATEGORIES, type WorkCategory } from '@/lib/work-categories';
import { cn } from '@/lib/cn';
import { TechPath } from '@/components/foundation/TechPath';
import { ProjectPreview } from '@/components/work/ProjectPreview';
import { CoverImage } from '@/components/work/CoverImage';
import { LifecycleVisual } from '@/components/work/LifecycleVisual';
import { CursorPreview, useCursorFollow } from '@/components/ui/cursor-preview';

type View = 'list' | 'grid';

const chip =
  'rounded-pill border px-4 py-1.5 text-label transition-colors ease-out [transition-duration:var(--dur-base)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function Badge({ project }: { project: CaseStudyMeta }) {
  return project.caseStudy === false ? (
    <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.6875rem] text-text-subtle">
      Details
    </span>
  ) : (
    <span className="rounded-sm bg-accent-soft px-1.5 py-0.5 font-mono text-[0.6875rem] text-accent-text">
      Case study
    </span>
  );
}

/** The hover preview for a project: its cover, else the lifecycle diagram. */
function PreviewThumb({ project }: { project: CaseStudyMeta }) {
  return project.cover ? (
    <CoverImage
      src={project.cover}
      alt=""
      fill
      sizes="280px"
      className="object-cover object-top"
    />
  ) : (
    <div className="absolute inset-0 bg-bg-elevated p-2">
      <LifecycleVisual />
    </div>
  );
}

interface HoverHandlers {
  onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: () => void;
}

/** Case-study projects link to their page; others open the detail drawer. */
function ProjectLink({
  project,
  onOpen,
  className,
  children,
  ...hover
}: {
  project: CaseStudyMeta;
  onOpen: (project: CaseStudyMeta) => void;
  className: string;
  children: ReactNode;
} & HoverHandlers) {
  return project.caseStudy === false ? (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className={cn('w-full text-left', className)}
      {...hover}
    >
      {children}
    </button>
  ) : (
    <Link href={`/work/${project.slug}`} className={className} {...hover}>
      {children}
    </Link>
  );
}

/**
 * The /work index (Section 6.2): category filters that update the URL
 * (`?type=pos`), a list/grid view toggle, and animated re-flow on filter.
 * Filters only appear once there are at least two real categories. Projects
 * without a full write-up open a detail drawer instead of a page.
 */
export function WorkIndex({
  projects,
  activeType,
}: {
  projects: CaseStudyMeta[];
  activeType: WorkCategory | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>('list');
  const [drawer, setDrawer] = useState<CaseStudyMeta | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { ref: preview, follow } = useCursorFollow();

  const categories = (Object.keys(WORK_CATEGORIES) as WorkCategory[]).filter(
    (category) => projects.some((project) => project.category === category),
  );
  const visible = activeType
    ? projects.filter((project) => project.category === activeType)
    : projects;

  const select = (category: WorkCategory | null) => {
    router.replace(category ? `/work?type=${category}` : '/work', {
      scroll: false,
    });
  };

  const number = (project: CaseStudyMeta) =>
    String(projects.indexOf(project) + 1).padStart(2, '0');

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {categories.length > 1 ? (
            <div
              role="group"
              aria-label="Filter by type"
              className="flex flex-wrap gap-2"
            >
              {[null, ...categories].map((category) => {
                const active = category === activeType;
                return (
                  <button
                    key={category ?? 'all'}
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(category)}
                    className={cn(
                      chip,
                      active
                        ? 'border-accent bg-accent-soft text-accent-text'
                        : 'border-border text-text-muted hover:border-border-strong hover:text-text',
                    )}
                  >
                    {category ? WORK_CATEGORIES[category] : 'All'}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="font-mono text-label text-text-subtle">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          )}

          <div
            role="group"
            aria-label="View"
            className="flex rounded-pill border border-border p-1"
          >
            {(
              [
                ['list', List, 'List view'],
                ['grid', LayoutGrid, 'Grid view'],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                aria-label={label}
                onClick={() => setView(value)}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  view === value
                    ? 'bg-surface text-text'
                    : 'text-text-subtle hover:text-text',
                )}
              >
                <Icon size={16} strokeWidth={1.5} aria-hidden />
              </button>
            ))}
          </div>
        </div>

        {view === 'list' ? (
          <motion.ol
            layout
            className="border-b border-border"
            onPointerMove={(event) => follow(event.clientX, event.clientY)}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((project, index) => (
                <motion.li
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-border"
                >
                  <div
                    data-reveal="up"
                    style={
                      { '--reveal-delay': `${index * 0.08}s` } as CSSProperties
                    }
                  >
                    <ProjectLink
                      onOpen={setDrawer}
                      project={project}
                      onPointerEnter={(event) => {
                        follow(event.clientX, event.clientY, hovered === null);
                        setHovered(project.slug);
                      }}
                      onPointerLeave={() => setHovered(null)}
                      className="group -mx-4 grid w-[calc(100%+2rem)] grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 rounded-md px-4 py-8 transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:grid-cols-12 md:items-baseline md:gap-6"
                    >
                      <span className="font-mono text-label text-text-subtle md:col-span-1">
                        {number(project)}
                      </span>
                      <span className="flex flex-col gap-2 md:col-span-5">
                        <span className="flex flex-wrap items-center gap-3">
                          <span className="text-h3 text-text">
                            {project.title}
                          </span>
                          <Badge project={project} />
                        </span>
                        <span className="max-w-[46ch] text-body-s text-text-muted">
                          {project.summary}
                        </span>
                      </span>
                      <TechPath
                        items={project.stack}
                        className="col-start-2 md:col-span-3 md:col-start-auto"
                      />
                      <span className="col-start-2 flex items-center justify-between gap-4 md:col-span-3 md:col-start-auto">
                        <span className="font-mono text-label text-text-muted">
                          {project.type}
                          {project.year && ` · ${project.year}`}
                        </span>
                        <ArrowRight
                          size={20}
                          strokeWidth={1.5}
                          aria-hidden
                          className="text-text-muted transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:translate-x-1 group-hover:text-text"
                        />
                      </span>
                    </ProjectLink>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ol>
        ) : (
          <motion.ul layout className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((project) => (
                <motion.li
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectLink
                    onOpen={setDrawer}
                    project={project}
                    className="lift group flex h-full flex-col gap-5 rounded-lg border border-border bg-bg-elevated p-4 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <ProjectPreview
                      project={project}
                      sizes="(min-width: 640px) 50vw, 100vw"
                    />
                    <span className="flex flex-col gap-2 px-1 pb-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-mono text-label text-text-subtle">
                          {number(project)} · {project.type}
                        </span>
                        <Badge project={project} />
                      </span>
                      <span className="text-h3 text-text">{project.title}</span>
                      <span className="text-body-s text-text-muted">
                        {project.summary}
                      </span>
                      <TechPath items={project.stack} className="mt-1" />
                    </span>
                  </ProjectLink>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* Cursor preview for the list view (as on the home page). */}
      {view === 'list' && (
        <CursorPreview
          previewRef={preview}
          active={
            hovered === null
              ? null
              : visible.findIndex((project) => project.slug === hovered)
          }
          items={visible.map((project) => ({
            key: project.slug,
            node: <PreviewThumb project={project} />,
          }))}
        />
      )}

      {/* Detail drawer for projects without a full case study. */}
      <Dialog.Root
        open={drawer !== null}
        onOpenChange={(open) => !open && setDrawer(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col gap-6 border-l border-border bg-bg-elevated p-8 focus:outline-none"
          >
            {drawer && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-label text-text-subtle">
                    {number(drawer)} · {drawer.type}
                  </span>
                  <Dialog.Close
                    aria-label="Close"
                    className="inline-flex size-9 items-center justify-center rounded-pill border border-border text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <X size={18} strokeWidth={1.5} aria-hidden />
                  </Dialog.Close>
                </div>
                <Dialog.Title className="text-display-m text-text">
                  {drawer.title}
                </Dialog.Title>
                <p className="text-body text-text-muted">{drawer.summary}</p>
                <TechPath items={drawer.stack} />
                <ProjectPreview project={drawer} />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </MotionConfig>
  );
}
