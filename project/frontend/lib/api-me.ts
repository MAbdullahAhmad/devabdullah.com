import { profile } from '@/content/profile';

export interface ApiMe {
  name: string;
  handle: string;
  role: string;
  focus: string[];
  experience_years: number;
  location: { city: string; country: string; timezone: string };
  available: boolean;
  stack: { interface: string[]; api: string[]; database: string[] };
  links: { site: string; linkedin: string; github: string };
  contact: string;
}

export function buildApiMe(siteUrl: string): ApiMe {
  const years = profile.stats.find((stat) => /year/i.test(stat.label))?.value;
  return {
    name: profile.name,
    handle: profile.handle,
    role: profile.experience[0]?.title ?? profile.role,
    focus: [],
    experience_years: years ?? 0,
    location: profile.location,
    available: profile.availability.open,
    stack: {
      interface: profile.stack.interface,
      api: profile.stack.api,
      database: profile.stack.database,
    },
    links: {
      site: siteUrl,
      linkedin: profile.contact.linkedin,
      github: profile.contact.github,
    },
    contact: profile.contact.email,
  };
}
