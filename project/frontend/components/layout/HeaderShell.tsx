'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

/** Scroll distance after which the bar becomes the floating glass pill. */
const THRESHOLD = 24;
const SCROLLED = 1;
const HIDDEN = 2;

let lastY = 0;
let direction: 1 | -1 = 1;
let state = 0;

/**
 * Reads the scroll position into a small bit field: scrolled past the
 * threshold, and hidden — the footer fills the lower part of the screen and
 * the visitor is scrolling down. Scrolling up brings the header back.
 */
function measure() {
  const y = window.scrollY;
  if (y !== lastY) direction = y > lastY ? 1 : -1;
  lastY = y;
  const footer = document.querySelector('[data-site-footer]');
  const onFooter =
    !!footer && footer.getBoundingClientRect().top < window.innerHeight * 0.55;
  state =
    (y > THRESHOLD ? SCROLLED : 0) | (onFooter && direction === 1 ? HIDDEN : 0);
}

function subscribe(onChange: () => void) {
  const update = () => {
    measure();
    onChange();
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}

function getSnapshot() {
  measure();
  return state;
}

/**
 * The header's moving part. At the top of the page the header is a full-width
 * bar; once scrolled it settles into a floating, rounded glass pill (styles:
 * `.site-header` in `styles/globals.css`). It slides away while the visitor is
 * on the footer and returns when they scroll up. Its contents are rendered on
 * the server by `SiteHeader` and passed in as children, so they add no client
 * code.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  return (
    <header
      className="site-header print:hidden"
      data-scrolled={current & SCROLLED ? '' : undefined}
      data-hidden={current & HIDDEN ? '' : undefined}
    >
      <div className="site-header-bar">{children}</div>
    </header>
  );
}
