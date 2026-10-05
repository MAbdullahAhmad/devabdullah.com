import {
  Database,
  LayoutTemplate,
  Plug,
  Server,
  Store,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceIcon as ServiceIconName } from '@/content/services';

const ICONS: Record<ServiceIconName, LucideIcon> = {
  server: Server,
  database: Database,
  store: Store,
  plug: Plug,
  layout: LayoutTemplate,
  wrench: Wrench,
};

/** A service's icon in a small bordered tile that lights up with its card. */
export function ServiceIcon({ name }: { name: ServiceIconName }) {
  const Icon = ICONS[name];
  return (
    <span className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition-colors ease-out [transition-duration:var(--dur-base)] group-hover:border-accent group-hover:bg-accent-soft group-hover:text-accent-text">
      <Icon size={20} strokeWidth={1.5} aria-hidden />
    </span>
  );
}
