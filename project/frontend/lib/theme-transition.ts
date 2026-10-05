import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

/** `data-theme` values for each theme (see ThemeProvider's `value` map). */
const ATTRIBUTE: Record<Theme, string> = { light: 'paper', dark: 'ink' };

/**
 * Switches the theme with a scan sweep, the site's own motif: a glowing
 * accent line travels down the screen and the new theme is revealed behind
 * it with a soft, feathered edge and a faint trail of light.
 *
 * Built on the View Transitions API. The browser snapshots the page in the
 * old theme; inside the transition the theme is applied synchronously and a
 * scan element is added with its own `view-transition-name`, so it renders on
 * a layer above both snapshots. The CSS ("Theme transition" in globals.css)
 * masks the new snapshot with a gradient driven by `--sweep` and moves the
 * scan in step. The element is removed when the transition finishes.
 *
 * Without the API (older browsers), or when the visitor prefers reduced
 * motion, the theme simply changes at once.
 */
export function switchTheme(next: Theme, setTheme: (theme: Theme) => void) {
  const root = document.documentElement;
  let scan: HTMLElement | null = null;

  const apply = (withScan: boolean) => {
    // Set the attribute ourselves so the new snapshot is already in the new
    // theme; next-themes then persists the choice and re-applies the same.
    root.setAttribute('data-theme', ATTRIBUTE[next]);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));
    if (withScan) {
      scan = document.createElement('div');
      scan.className = 'theme-scan';
      scan.setAttribute('aria-hidden', 'true');
      document.body.append(scan);
    }
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) {
    apply(false);
    return;
  }

  root.dataset.themeTransition = '';
  const transition = document.startViewTransition(() => apply(true));
  const done = () => {
    scan?.remove();
    delete root.dataset.themeTransition;
  };
  transition.finished.then(done, done);
}
