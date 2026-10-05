import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Service } from '@/content/services';
import { TechPath } from '@/components/foundation/TechPath';
import { ServiceIcon } from '@/components/services/ServiceIcon';

/**
 * A service card for the home grid: number, icon, title, one-line summary and
 * stack. The whole card links to the service on `/services`; on hover the
 * border takes the accent, a soft glow rises from the top and the arrow lifts.
 */
export function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  return (
    <Link
      href={`/services#${service.slug}`}
      data-spotlight
      className="service-card lift group relative isolate flex h-full flex-col gap-8 overflow-hidden rounded-lg border border-border bg-bg-elevated p-6 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:p-8"
    >
      <span className="flex items-start justify-between gap-4">
        <ServiceIcon name={service.icon} />
        <span className="font-mono text-label text-text-subtle">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-3">
        <h3 className="text-h4 text-text">{service.title}</h3>
        <span className="text-body-s text-text-muted">{service.summary}</span>
      </span>

      <span className="flex items-center justify-between gap-4 border-t border-border pt-5">
        <TechPath items={service.stack} />
        <ArrowUpRight
          size={18}
          strokeWidth={1.5}
          aria-hidden
          className="shrink-0 text-text-subtle transition-transform ease-out [transition-duration:var(--dur-base)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text"
        />
      </span>
    </Link>
  );
}
