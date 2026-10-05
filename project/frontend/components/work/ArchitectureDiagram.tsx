'use client';

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface ArchitectureNode {
  id: string;
  /** Small mono tag, e.g. "Client", "API". */
  layer: string;
  title: string;
  /** One line under the title. */
  detail?: string;
  /** Shown when the box is selected — why this layer exists. */
  note?: string;
  /** Highlight as the accent layer (the API band, per the logo). */
  accent?: boolean;
}

interface ArchitectureDiagramProps {
  nodes: ArchitectureNode[];
  /** Labels for the connectors between consecutive nodes. */
  links?: string[];
  caption?: string;
}

function Connector({ label, index }: { label?: string; index: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center md:w-16 md:self-stretch"
      aria-hidden
    >
      {/* Line + arrowhead: vertical on mobile, horizontal from md. */}
      <div className="relative h-10 w-px overflow-hidden bg-border-strong md:h-px md:w-full">
        <span
          className="arch-packet-y absolute inset-0 md:hidden"
          style={{ animationDelay: `${index * 0.45}s` }}
        >
          <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-pill bg-accent" />
        </span>
        <span
          className="arch-packet-x absolute inset-0 hidden md:block"
          style={{ animationDelay: `${index * 0.45}s` }}
        >
          <span className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rounded-pill bg-accent" />
        </span>
      </div>
      <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-border-strong md:bottom-auto md:left-auto md:right-0 md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:-rotate-45" />
      {label && (
        <span className="absolute left-[calc(50%+0.75rem)] whitespace-nowrap font-mono text-[0.6875rem] leading-tight text-text-subtle md:bottom-[calc(50%+0.5rem)] md:left-1/2 md:max-w-16 md:-translate-x-1/2 md:whitespace-normal md:text-center">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * System diagram for case studies (Section 7.2): boxes and arrows, Client →
 * API → Services → Database. Small "packets" travel along the arrows only
 * while the diagram is on screen (transform-only CSS; none with reduced
 * motion). Each box is a button that reveals a short note on why it exists.
 */
export function ArchitectureDiagram({
  nodes,
  links = [],
  caption,
}: ArchitectureDiagramProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const noteId = useId();
  const selectedNode = nodes.find((node) => node.id === selected);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      data-running={inView || undefined}
      className="arch mt-8 flex flex-col gap-4 rounded-md border border-border bg-bg-elevated p-5 md:p-8"
    >
      <div className="flex flex-col items-stretch md:flex-row md:items-center">
        {nodes.map((node, index) => {
          const isSelected = node.id === selected;
          return (
            <Fragment key={node.id}>
              {index > 0 && (
                <Connector label={links[index - 1]} index={index} />
              )}
              <button
                type="button"
                onClick={() => setSelected(isSelected ? null : node.id)}
                aria-pressed={isSelected}
                aria-controls={noteId}
                className={cn(
                  'flex shrink-0 flex-col gap-1 rounded-md border bg-bg px-4 py-3 text-left transition-colors ease-out [transition-duration:var(--dur-base)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:min-w-0 md:flex-1',
                  isSelected
                    ? 'border-accent'
                    : node.accent
                      ? 'border-accent/40 hover:border-accent'
                      : 'border-border hover:border-border-strong',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[0.6875rem]',
                    node.accent ? 'text-accent-text' : 'text-text-subtle',
                  )}
                >
                  {node.layer}
                </span>
                <span className="text-h4 text-text">{node.title}</span>
                {node.detail && (
                  <span className="text-body-s text-text-muted">
                    {node.detail}
                  </span>
                )}
              </button>
            </Fragment>
          );
        })}
      </div>

      <div
        id={noteId}
        aria-live="polite"
        className="min-h-12 border-t border-border pt-4 text-body-s text-text-muted"
      >
        {selectedNode?.note ? (
          <p>
            <span className="font-mono text-label text-text">
              {selectedNode.title}
            </span>
            {' — '}
            {selectedNode.note}
          </p>
        ) : (
          <p className="text-body-s text-text-subtle">
            Select a box to see why it is there.
          </p>
        )}
      </div>

      {caption && (
        <figcaption className="text-body-s text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
