import { cn } from '@/lib/cn';
import { SkillTag } from '@/components/foundation/SkillTag';
import type { StackLayerData } from '@/components/home/stack-data';
import { MARK_PATHS, MARK_VIEWBOX } from '@/lib/brand-mark';

/** The brand mark with this layer's pieces lit and the others faint. */
function StackGlyph({ activeIndex }: { activeIndex: number }) {
  const layers = [
    { paths: [MARK_PATHS.ink[0]], color: 'var(--text)' },
    { paths: [MARK_PATHS.accent], color: 'var(--accent)' },
    { paths: [MARK_PATHS.ink[1], MARK_PATHS.ink[2]], color: 'var(--text)' },
  ];
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className="h-8 w-auto shrink-0"
      aria-hidden
      focusable="false"
    >
      {layers.map((layer, index) =>
        layer.paths.map((d) => (
          <path
            key={d}
            d={d}
            fill={index === activeIndex ? layer.color : 'var(--border-strong)'}
          />
        )),
      )}
    </svg>
  );
}

interface StackLayerProps {
  layer: StackLayerData;
  index: number;
  className?: string;
}

/**
 * One layer of the stack as a card (Section 6.1): name, skills as mono tags and
 * the CV proof line. The API layer carries the accent, matching the logo band.
 */
export function StackLayer({ layer, index, className }: StackLayerProps) {
  return (
    <div
      data-spotlight
      className={cn(
        'lift flex flex-col gap-5 rounded-lg border bg-bg-elevated p-6 md:p-8',
        layer.accent ? 'border-accent/40' : 'border-border',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label text-text-subtle">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3
            className={cn(
              'text-h3',
              layer.accent ? 'text-accent' : 'text-text',
            )}
          >
            {layer.name}
          </h3>
        </div>
        <StackGlyph activeIndex={index} />
      </div>

      <p className="max-w-[48ch] text-body-s text-text-muted">{layer.proof}</p>

      <ul className="flex flex-wrap gap-2">
        {layer.skills.map((skill) => (
          <li key={skill}>
            <SkillTag>{skill}</SkillTag>
          </li>
        ))}
      </ul>
    </div>
  );
}
