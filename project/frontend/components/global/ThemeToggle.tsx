'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { switchTheme } from '@/lib/theme-transition';

const noopSubscribe = () => () => {};

/**
 * Returns false during SSR and the first hydration paint, then true once the
 * component is running in the browser — without a setState-in-effect. This
 * keeps the server and first client render identical, so the theme-dependent
 * icon (only knowable in the browser) never causes a hydration mismatch.
 */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Ink/Paper theme switch. Toggles between the resolved dark/light themes and
 * relies on next-themes for persistence and system sync. The new theme is
 * revealed by a scan sweeping down the page (`switchTheme`), and the sun/moon
 * icon turns as it swaps. Until mounted it renders a non-interactive
 * placeholder so the server and first client render match (the resolved theme
 * is only known in the browser).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => switchTheme(isDark ? 'light' : 'dark', setTheme)}
      disabled={!mounted}
      aria-label={
        mounted
          ? `Switch to ${isDark ? 'light' : 'dark'} theme`
          : 'Switch theme'
      }
      className="inline-flex size-9 items-center justify-center rounded-pill border border-border bg-bg-elevated text-text-muted transition-colors ease-out [transition-duration:var(--dur-base)] hover:border-border-strong hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {mounted ? (
        <span key={isDark ? 'sun' : 'moon'} className="theme-icon" aria-hidden>
          {isDark ? (
            <Sun size={20} strokeWidth={1.5} />
          ) : (
            <Moon size={20} strokeWidth={1.5} />
          )}
        </span>
      ) : (
        <span className="size-5" aria-hidden />
      )}
    </button>
  );
}
