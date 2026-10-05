import { Fragment } from 'react';
import { cx } from '@/lib/cx';

interface TechPathProps {
  /** Technologies in order, e.g. `['Laravel', 'PHP', 'MySQL']`. */
  items: string[];
  className?: string;
}

/**
 * Technologies written as a mono path — `Laravel / PHP / MySQL` — with the
 * separators in `--text-subtle` (Section 4.6).
 */
export function TechPath({ items, className }: TechPathProps) {
  return (
    <span className={cx('font-mono text-label text-text-muted', className)}>
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && (
            <span className="text-text-subtle" aria-hidden>
              {' / '}
            </span>
          )}
          {item}
        </Fragment>
      ))}
    </span>
  );
}
