/**
 * Keyboard skip link (Section 12.2). Hidden until focused, then jumps to the
 * main content landmark.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only print:hidden focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:rounded-pill focus:border focus:border-border-strong focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-body-s focus:text-text focus:outline-2 focus:outline-offset-2 focus:outline-accent"
    >
      Skip to content
    </a>
  );
}
