import type { WorkCategory } from '@/lib/work-categories';

/**
 * Case-study metadata (Blueprint Section 9.1). Lives in
 * `content/work/<slug>.meta.ts`, separate from the MDX body, so listing
 * projects never imports case-study content or its interactive components.
 */
export interface CaseStudyMeta {
  title: string;
  slug: string;
  /** One-line impact. */
  summary: string;
  /** Short type label, e.g. "POS & Operations". */
  type: string;
  stack: string[];
  status: 'live' | 'internal' | 'confidential';
  featured: boolean;
  order: number;
  /** Filter category on /work. */
  category: WorkCategory;
  /**
   * `false` for projects without a full write-up: they open a short drawer on
   * /work instead of a page. Defaults to `true`.
   */
  caseStudy?: boolean;
  /** Optional facts — omitted until confirmed. */
  year?: string;
  role?: string;
  timeline?: string;
  team?: string;
  /** Real screenshot path; omitted until one exists. */
  cover?: string;
  /** Public URL of the running system, when there is one. */
  url?: string;
  /** Short app name for the screen tour's address bar, e.g. `lms`. */
  appName?: string;
}

/** One real screenshot in a case study's screen tour. */
export interface CaseStudyScreen {
  src: string;
  width: number;
  height: number;
  /** Short name, e.g. "Order status board". */
  title: string;
  /** Where it lives in the app, as its own breadcrumb shows it. */
  path: string;
  /** One or two sentences on what the screen does. */
  description: string;
  alt: string;
}

/** A `##` section of a case study, for the table of contents. */
export interface CaseStudyHeading {
  id: string;
  title: string;
}
