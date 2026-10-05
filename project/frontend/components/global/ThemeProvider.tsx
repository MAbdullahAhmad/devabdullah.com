'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Wraps next-themes with the portfolio's Ink/Paper mapping.
 *
 * The internal theme names stay `light`/`dark` so `enableSystem` can resolve
 * the visitor's `prefers-color-scheme`, while `value` writes our brand names
 * to `data-theme` (`ink` for dark, `paper` for light) to match the tokens in
 * `styles/globals.css`. The blocking script next-themes injects sets the
 * attribute before paint, so there is no flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      value={{ light: 'paper', dark: 'ink' }}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
