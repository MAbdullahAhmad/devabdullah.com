import { cx } from '@/lib/cx';

/** Stages as the résumé describes them: drop-off → processing → delivery. */
const STAGES = ['Drop-off', 'Processing', 'Delivered'] as const;

const ORDERS: { id: string; stage: number; items: string }[] = [
  { id: '#1042', stage: 2, items: '6 items' },
  { id: '#1043', stage: 1, items: '3 items' },
  { id: '#1044', stage: 1, items: '9 items' },
  { id: '#1045', stage: 0, items: '2 items' },
];

/**
 * An illustrative (not screenshot) view of the Laundry POS job lifecycle —
 * orders moving from drop-off through processing to delivery, as the résumé
 * describes. Uses placeholder order numbers only; no real customer data.
 * Shown until real screenshots or demo-data captures exist.
 */
export function LifecycleVisual({ className }: { className?: string }) {
  return (
    <div className={cx('flex flex-col gap-3 p-4', className)} aria-hidden>
      <div className="grid grid-cols-3 gap-1.5">
        {STAGES.map((stage, index) => (
          <div key={stage} className="flex flex-col gap-1.5">
            <span
              className={cx(
                'h-1 rounded-pill',
                index === 1 ? 'bg-accent' : 'bg-border-strong',
              )}
            />
            <span className="font-mono text-[0.625rem] text-text-subtle">
              {stage}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-border rounded-sm border border-border bg-bg">
        {ORDERS.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between gap-3 px-3 py-2 font-mono text-[0.6875rem]"
          >
            <span className="text-text">{order.id}</span>
            <span className="text-text-subtle">{order.items}</span>
            <span
              className={cx(
                'rounded-pill px-2 py-0.5',
                order.stage === 1
                  ? 'bg-accent-soft text-accent-text'
                  : 'bg-surface text-text-muted',
              )}
            >
              {STAGES[order.stage]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
