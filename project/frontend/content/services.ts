/**
 * Services offered (owner change OC.3). Every service is grounded in work on
 * the résumé — no prices, timelines or outcomes are promised here. Edit, add
 * or remove freely; the home section, `/services`, the book-a-call topic
 * picker and `/llms.txt` all read from this list.
 */

export type ServiceIcon =
  'server' | 'database' | 'store' | 'plug' | 'layout' | 'wrench';

export interface Service {
  slug: string;
  title: string;
  /** One line for cards and pickers. */
  summary: string;
  /** A short paragraph for the services page. */
  description: string;
  /** What the engagement covers. */
  includes: string[];
  stack: string[];
  icon: ServiceIcon;
  /** A case study that shows this service in practice. */
  proof?: { label: string; href: string };
}

export const services: Service[] = [];
