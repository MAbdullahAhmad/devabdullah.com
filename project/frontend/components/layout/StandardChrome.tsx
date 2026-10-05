'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/** Keep the regular shell server-rendered, but omit it on the desktop route. */
export function StandardChrome({ children }: { children: ReactNode }) {
  return usePathname() === '/my-mac' ? null : children;
}
