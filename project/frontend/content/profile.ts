/** Single source of truth for Abdullah Ahmad portfolio content. */

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface Stack {
  interface: string[];
  api: string[];
  database: string[];
  practice: string[];
}

export interface Role {
  title: string;
  company: string;
  /** Short display name for compact views such as the commit log. */
  companyShort?: string;
  location: string;
  /** e.g. "Full-time · On-site", "Contract · Remote". */
  type: string;
  /** Human-readable start, e.g. "Oct 2025". */
  start: string;
  /** Human-readable end, or "Present". */
  end: string;
  bullets: string[];
  /** Set when this role was a promotion from a previous title at the same company. */
  promotedFrom?: string;
}

export interface Education {
  qualification: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  grade?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  /** Role or job title. */
  title: string;
  company?: string;
  /** Optional avatar in /public (with the person's permission). */
  image?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface CvProject {
  name: string;
  subtitle: string;
  stack: string[];
  bullets: string[];
}

export interface Faq {
  question: string;
  answer: string;
  /** Optional links shown after the answer. */
  links?: { label: string; href: string }[];
}

export interface Profile {
  name: string;
  handle: string;
  role: string;
  /** The résumé's headline line. */
  headline: string;
  /** Hero tagline; the `[bracketed]` word renders as the accent emphasis. */
  tagline: string;
  summary: string;
  /** Short one-line positioning (Blueprint Section 3.5). */
  positioning: string;
  location: { city: string; country: string; timezone: string };
  availability: { open: boolean; note: string };
  contact: {
    email: string;
    phone?: string;
    linkedin: string;
    github: string;
    instagram?: string;
    upwork?: string;
  };
  stats: Stat[];
  stack: Stack;
  /** Skills exactly as grouped on the résumé (used by /cv). */
  skills: SkillGroup[];
  /** Projects exactly as listed on the résumé (used by /cv). */
  projects: CvProject[];
  /** Optional path to a downloadable CV PDF in /public; /cv falls back to print. */
  cvPdf?: string;
  /** Portrait in /public, used on About and the book-a-call page. */
  portrait: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  experience: Role[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  testimonials: Testimonial[];
  faq: Faq[];
}

export const profile: Profile = {
  name: 'Abdullah Ahmad',
  handle: 'abdullah-ahmad',
  portrait: {
    src: '/icon.svg',
    alt: 'Abdullah Ahmad portfolio mark',
    width: 512,
    height: 512,
  },
  role: 'Developer Portfolio',
  headline: 'Abdullah Ahmad — Developer Portfolio',
  tagline: 'A portfolio built to [grow].',
  summary:
    'This is the initial portfolio shell for Abdullah Ahmad. Verified experience, projects, skills and contact details will be added as they are provided.',
  positioning:
    'Developer portfolio for Abdullah Ahmad. Projects, experience and technical details are being added progressively.',
  location: { city: 'Location', country: 'To be added', timezone: 'UTC' },
  availability: {
    open: false,
    note: 'Availability details coming soon.',
  },
  contact: {
    email: 'hello@devabdullah.com',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
  },
  stats: [],
  stack: {
    interface: [],
    api: [],
    database: [],
    practice: [],
  },
  skills: [],
  projects: [],
  experience: [],
  education: [],
  certifications: [],
  languages: [],
  testimonials: [],
  faq: [],
};
