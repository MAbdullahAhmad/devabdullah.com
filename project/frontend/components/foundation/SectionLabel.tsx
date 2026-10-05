import { cn } from '@/lib/cn';

interface SectionLabelProps {
  /** Two-digit section number, e.g. `01`. Optional. */
  number?: string;
  title: string;
  className?: string;
}

/**
 * The `( 01 — The Stack )` mono label above section headings (Section 4.6).
 * Parentheses and dash sit in `--text-subtle`; the number and title in
 * `--text-muted`.
 */
export function SectionLabel({ number, title, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-label text-text-muted',
        className,
      )}
    >
      <span className="text-text-subtle" aria-hidden>
        (
      </span>
      {number && <span>{number}</span>}
      {number && (
        <span className="text-text-subtle" aria-hidden>
          —
        </span>
      )}
      <span>{title}</span>
      <span className="text-text-subtle" aria-hidden>
        )
      </span>
    </span>
  );
}
