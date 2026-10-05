import type { CaseStudyMeta } from '@/lib/case-studies';
import type { Role, SkillGroup } from '@/content/profile';
import type { MouseEvent } from 'react';

export type PanelId =
  | 'work'
  | 'about'
  | 'project'
  | 'notes'
  | 'api'
  | 'apps'
  | 'settings'
  | 'terminal';

/** Explicit public subset: never send private contact fields to this feature. */
export interface MyMacData {
  name: string;
  role: string;
  summary: string;
  location: string;
  availability: string | null;
  github: string;
  linkedin: string;
  instagram?: string;
  experience: Role[];
  skills: SkillGroup[];
  projects: CaseStudyMeta[];
}

export interface PanelSelection {
  id: PanelId;
  title: string;
  href: string;
  projectSlug?: string;
}

export interface PanelProps {
  selection: PanelSelection;
  data: MyMacData;
  open: (event: MouseEvent<HTMLAnchorElement>, panel: PanelSelection) => void;
  resetLayout: () => void;
  iconStyle: 'default' | 'clear';
  setIconStyle: (style: 'default' | 'clear') => void;
  noteTopic: string;
  setNoteTopic: (topic: string) => void;
}
