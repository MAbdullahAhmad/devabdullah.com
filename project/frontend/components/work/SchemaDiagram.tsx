'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface SchemaColumn {
  name: string;
  type?: string;
  key?: 'pk' | 'fk';
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface SchemaRelation {
  /** `table.column` */
  from: string;
  /** `table.column` */
  to: string;
  /** e.g. "many → one" */
  label?: string;
}

interface SchemaDiagramProps {
  tables: SchemaTable[];
  relations: SchemaRelation[];
  caption?: string;
}

const tableOf = (ref: string) => ref.split('.')[0];

interface Path {
  d: string;
  key: string;
  tables: [string, string];
}

/** A soft curve between the nearest edges of two table cards. */
function connect(a: DOMRect, b: DOMRect, origin: DOMRect): string {
  const ax = a.left - origin.left;
  const ay = a.top - origin.top;
  const bx = b.left - origin.left;
  const by = b.top - origin.top;
  const overlapX = a.left < b.right && b.left < a.right;

  if (overlapX) {
    // Stacked: bottom of the upper card to the top of the lower one.
    const [top, bottom, topX, bottomX] =
      ay < by
        ? [ay + a.height, by, ax + a.width / 2, bx + b.width / 2]
        : [by + b.height, ay, bx + b.width / 2, ax + a.width / 2];
    const mid = (top + bottom) / 2;
    return `M ${topX} ${top} C ${topX} ${mid}, ${bottomX} ${mid}, ${bottomX} ${bottom}`;
  }

  const leftToRight = ax < bx;
  const x1 = leftToRight ? ax + a.width : ax;
  const x2 = leftToRight ? bx : bx + b.width;
  const y1 = ay + a.height / 2;
  const y2 = by + b.height / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

/**
 * Entity–relationship diagram for case studies (Section 7.2). Tables are
 * focusable cards; relationship curves are measured from the real layout and
 * re-drawn on resize. Hovering or focusing a table highlights its relations
 * and dims the rest. Relations are also listed as text, so the model reads
 * without the lines.
 */
export function SchemaDiagram({
  tables,
  relations,
  caption,
}: SchemaDiagramProps) {
  const container = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const [paths, setPaths] = useState<Path[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const measure = () => {
      const origin = el.getBoundingClientRect();
      setSize({ width: origin.width, height: origin.height });
      setPaths(
        relations.flatMap((relation) => {
          const from = cards.current.get(tableOf(relation.from));
          const to = cards.current.get(tableOf(relation.to));
          if (!from || !to) return [];
          return [
            {
              key: `${relation.from}-${relation.to}`,
              d: connect(
                from.getBoundingClientRect(),
                to.getBoundingClientRect(),
                origin,
              ),
              tables: [tableOf(relation.from), tableOf(relation.to)] as [
                string,
                string,
              ],
            },
          ];
        }),
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [relations]);

  const related = new Set(
    active
      ? relations
          .filter((r) => tableOf(r.from) === active || tableOf(r.to) === active)
          .flatMap((r) => [tableOf(r.from), tableOf(r.to)])
      : [],
  );

  return (
    <figure className="mt-8 flex flex-col gap-4 rounded-md border border-border bg-bg-elevated p-5 md:p-8">
      <div ref={container} className="relative">
        <svg
          className="pointer-events-none absolute inset-0"
          width={size.width}
          height={size.height}
          aria-hidden
        >
          {paths.map((path) => {
            const lit = active !== null && path.tables.includes(active);
            return (
              <path
                key={path.key}
                d={path.d}
                fill="none"
                strokeWidth={lit ? 1.5 : 1}
                strokeDasharray={lit ? undefined : '3 4'}
                className={cn(
                  'transition-[stroke,opacity] ease-out [transition-duration:var(--dur-base)]',
                  lit ? 'stroke-accent' : 'stroke-border-strong',
                  active !== null && !lit && 'opacity-30',
                )}
              />
            );
          })}
        </svg>

        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-x-12 gap-y-10">
          {tables.map((table) => {
            const isActive = table.name === active;
            const dim =
              active !== null && !isActive && !related.has(table.name);
            return (
              <div
                key={table.name}
                ref={(node) => {
                  if (node) cards.current.set(table.name, node);
                  else cards.current.delete(table.name);
                }}
                tabIndex={0}
                onPointerEnter={() => setActive(table.name)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(table.name)}
                onBlur={() => setActive(null)}
                aria-label={`Table ${table.name}`}
                className={cn(
                  'self-start overflow-hidden rounded-md border bg-bg transition-[border-color,opacity] ease-out [transition-duration:var(--dur-base)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  isActive
                    ? 'border-accent'
                    : related.has(table.name)
                      ? 'border-accent/50'
                      : 'border-border',
                  dim && 'opacity-40',
                )}
              >
                <div className="border-b border-border bg-surface px-3 py-2 font-mono text-label text-text">
                  {table.name}
                </div>
                <ul className="flex flex-col py-1">
                  {table.columns.map((column) => (
                    <li
                      key={column.name}
                      className="flex items-center justify-between gap-3 px-3 py-1 font-mono text-[0.6875rem]"
                    >
                      <span className="flex items-center gap-1.5 text-text-muted">
                        {column.key && (
                          <span
                            className={cn(
                              'rounded-sm px-1 text-[0.625rem] uppercase',
                              column.key === 'pk'
                                ? 'bg-accent-soft text-accent-text'
                                : 'bg-surface text-text-subtle',
                            )}
                          >
                            {column.key}
                          </span>
                        )}
                        {column.name}
                      </span>
                      {column.type && (
                        <span className="text-text-subtle">{column.type}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="flex flex-col gap-1 border-t border-border pt-4 font-mono text-label">
        {relations.map((relation) => {
          const lit =
            active !== null &&
            (tableOf(relation.from) === active ||
              tableOf(relation.to) === active);
          return (
            <li
              key={`${relation.from}-${relation.to}`}
              className={cn(
                'transition-colors',
                lit ? 'text-accent-text' : 'text-text-subtle',
              )}
            >
              {relation.from} → {relation.to}
              {relation.label && (
                <span className="text-text-subtle"> · {relation.label}</span>
              )}
            </li>
          );
        })}
      </ul>

      {caption && (
        <figcaption className="text-body-s text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
