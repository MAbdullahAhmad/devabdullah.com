'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import type { CaseStudyMeta } from '@/lib/case-studies';
import { COMMAND_MENU_EVENT } from '@/lib/command-menu';

const CommandMenu = lazy(() =>
  import('@/components/global/CommandMenu').then((mod) => ({
    default: mod.CommandMenu,
  })),
);

/**
 * Keeps cmdk out of the first-load bundle (Section 12.1). Listens for ⌘K /
 * Ctrl K and `openCommandMenu()`; on the first request it loads the real menu
 * already open, which then handles every later shortcut itself.
 */
export function CommandMenuLoader({ projects }: { projects: CaseStudyMeta[] }) {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;
    const request = () => setRequested(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        request();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(COMMAND_MENU_EVENT, request);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(COMMAND_MENU_EVENT, request);
    };
  }, [requested]);

  return requested ? (
    <Suspense fallback={null}>
      <CommandMenu projects={projects} defaultOpen />
    </Suspense>
  ) : null;
}
