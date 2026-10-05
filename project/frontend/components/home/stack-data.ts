import { profile } from '@/content/profile';

export interface StackLayerData {
  /** `interface` | `api` | `database` */
  key: 'interface' | 'api' | 'database';
  name: string;
  skills: string[];
  /** One-line proof, taken from the real CV (Section 6.1). */
  proof: string;
  /** The API layer is the accent band, matching the logo. */
  accent: boolean;
}

/** Top-to-bottom: Interface → API → Database (Section 6.1). */
export const stackLayers: StackLayerData[] = [
  {
    key: 'interface',
    name: 'Interface',
    skills: profile.stack.interface,
    proof: 'Cut the time to ship a new screen from weeks to days.',
    accent: false,
  },
  {
    key: 'api',
    name: 'API',
    skills: profile.stack.api,
    proof:
      'Built the Laravel backends behind SaaS products, CMS platforms and ERPs.',
    accent: true,
  },
  {
    key: 'database',
    name: 'Database',
    skills: profile.stack.database,
    proof:
      'Designed and managed the databases those systems run on, from schema to reporting.',
    accent: false,
  },
];

/** The supporting practice line under the section. */
export const alsoLine = `Also: ${profile.stack.practice.join(', ')}.`;
