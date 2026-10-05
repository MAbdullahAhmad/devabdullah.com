import type { ReactNode } from 'react';
import { GitBranch, Info, Scale } from 'lucide-react';
import { cn } from '@/lib/cn';

type CalloutType = 'note' | 'decision' | 'trade-off';

const CONFIG = {
  note: { label: 'Note', Icon: Info },
  decision: { label: 'Decision', Icon: GitBranch },
  'trade-off': { label: 'Trade-off', Icon: Scale },
} as const;

/**
 * Note / decision / trade-off box for case studies (Section 7.2). Decisions
 * carry the accent rule — they are the moments the reader should notice.
 */
export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const { label, Icon } = CONFIG[type];

  return (
    <aside
      data-reveal="up"
      className={cn(
        'mt-8 rounded-md border bg-bg-elevated p-5 [&>div>p:first-child]:mt-0',
        type === 'decision' ? 'border-accent/40' : 'border-border',
      )}
    >
      <div className="flex items-center gap-2 font-mono text-label">
        <Icon
          size={14}
          strokeWidth={1.5}
          aria-hidden
          className={
            type === 'decision' ? 'text-accent-text' : 'text-text-subtle'
          }
        />
        <span
          className={
            type === 'decision' ? 'text-accent-text' : 'text-text-subtle'
          }
        >
          {label}
        </span>
        {title && <span className="text-text">· {title}</span>}
      </div>
      <div className="[&>p]:mt-3 [&>p]:text-body-s">{children}</div>
    </aside>
  );
}
