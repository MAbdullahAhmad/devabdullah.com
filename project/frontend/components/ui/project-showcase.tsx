'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cx } from '@/lib/cx';
import { CursorPreview, useCursorFollow } from '@/components/ui/cursor-preview';

export interface ShowcaseProject {
  slug: string;
  title: string;
  description: string;
  /** Right-hand detail: the year when known, otherwise the project type. */
  meta: string;
  href: string;
  /** Server-rendered 280 × 180 preview (cover image or diagram). */
  thumb: ReactNode;
}

/**
 * Project showcase (21st.dev `project-showcase`), used for Selected Work on
 * the home page. Rows with a hover highlight, an underline that draws under
 * the title, an arrow that slides in and brighter secondary text; on pointer
 * devices a 280 × 180 preview follows the cursor, cross-fading (with blur)
 * between projects.
 *
 * Adapted from the original: real projects instead of demo data, row effects
 * also on keyboard focus, and the follow (`useCursorFollow`, shared with /work)
 * writes the transform directly and stops once settled (the original set React
 * state on every frame). The preview is hidden on touch screens and for
 * reduced motion.
 */
export function ProjectShowcase({
  projects,
  className,
}: {
  projects: ShowcaseProject[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { ref: preview, follow } = useCursorFollow();

  return (
    <div
      className={cx('relative w-full', className)}
      onPointerMove={(event) => follow(event.clientX, event.clientY)}
    >
      {/* Cursor preview — fine pointers only, never with reduced motion. */}
      <CursorPreview
        previewRef={preview}
        active={hovered}
        items={projects.map((project) => ({
          key: project.slug,
          node: project.thumb,
        }))}
      />

      <ul>
        {projects.map((project, index) => (
          <li
            key={project.slug}
            data-reveal="up"
            style={{ '--reveal-delay': `${index * 0.08}s` } as CSSProperties}
          >
            <Link
              href={project.href}
              className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onPointerEnter={(event) => {
                follow(event.clientX, event.clientY, hovered === null);
                setHovered(index);
              }}
              onPointerLeave={() => setHovered(null)}
            >
              <div className="relative border-t border-border py-5 transition-all duration-300 ease-out">
                {/* Background highlight on hover / focus. */}
                <div className="absolute inset-0 -mx-4 scale-95 rounded-lg bg-surface/70 px-4 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-2">
                      <h3 className="text-h4 font-medium tracking-tight text-text">
                        <span className="relative">
                          {project.title}
                          {/* Underline that draws in. */}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-text transition-all duration-300 ease-out group-hover:w-full group-focus-visible:w-full" />
                        </span>
                      </h3>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 -translate-x-2 translate-y-2 text-text-muted opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                      />
                    </div>
                    <p className="mt-1 text-body-s leading-relaxed text-text-muted transition-all duration-300 ease-out group-hover:text-text/70 group-focus-visible:text-text/70">
                      {project.description}
                    </p>
                  </div>
                  <span className="font-mono text-label tabular-nums text-text-muted transition-all duration-300 ease-out group-hover:text-text/60 group-focus-visible:text-text/60">
                    {project.meta}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {/* Bottom border for the last item. */}
      <div className="border-t border-border" />
    </div>
  );
}
