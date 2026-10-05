'use client';

import { Fragment, useEffect, useId, useRef, type CSSProperties } from 'react';

/** Glitch refresh interval (asdfworldwide.com: 0.2s). */
const GLITCH_MS = 200;

/** A random horizontal slice: `inset(top% 0 bottom% 0)`, 2–20% tall. */
function randomSlice() {
  const top = Math.random() * 95;
  const height = 2 + Math.random() * 18;
  return `inset(${top.toFixed(2)}% 0 ${(100 - top - height).toFixed(2)}% 0)`;
}

/**
 * The wave "hill" (after the shape asdfworldwide.com uses): a thin pointed
 * tip at the left rising in a straight edge to a rounded hump, then an easing
 * S-curve into a long tail. The base is flat along the bottom of the viewBox;
 * the fill fades out towards the right end (see the gradient).
 */
const HILL =
  'M18 206L300 70C338 52 392 47 432 55C474 63 522 90 562 104C604 118 650 121 720 123L720 240L0 240L0 214Z';

/**
 * Glitch tagline, after the "Born to be Different" section of
 * asdfworldwide.com: a single line set to fill the full width, whose words
 * rise out of masks one after another when it scrolls into view, with the
 * accent word glitching continuously — two offset copies with red and blue
 * fringes, each showing a random slice every 0.2s. Behind it, two soft wave
 * hills — one from the top-left, one turned over from the bottom-right —
 * whose bases overlap across the line, forming a flowing S-shaped ribbon. They
 * sway and breathe slowly, out of step.
 *
 * The line is fitted to its container on the client (a container-query font
 * size is the server-rendered fallback). Everything pauses off-screen; for
 * reduced motion the words appear at once, the glitch is off and the waves
 * are still.
 */
export function GlitchTagline({
  lead,
  accent,
}: {
  /** Words before the accent, e.g. "Built to be". */
  lead: string;
  /** The accent word that glitches, e.g. "Reliable". */
  accent: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const glitch = useRef<HTMLSpanElement>(null);
  const gradient = useId();

  useEffect(() => {
    const el = root.current;
    const text = line.current;
    const word = glitch.current;
    if (!el || !text || !word) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Fit the line to the container width.
    const fit = () => {
      text.style.fontSize = '100px';
      // The line's own box: scrollWidth would include the full-bleed band.
      const natural = text.getBoundingClientRect().width;
      const available = el.clientWidth;
      if (natural > 0) {
        text.style.fontSize = `${(100 * available * 0.98) / natural}px`;
      }
      // The hills' bases overlap across the line: they need its height.
      el.style.setProperty(
        '--line',
        `${text.getBoundingClientRect().height}px`,
      );
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(el);
    document.fonts?.ready.then(fit);

    // Reveal once, when the section's top reaches 90% of the viewport.
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute('data-revealed', '');
        reveal.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    reveal.observe(el);

    // Continuous glitch while on screen.
    let timer = 0;
    const tick = () => {
      word.style.setProperty('--clip-one', randomSlice());
      word.style.setProperty('--clip-two', randomSlice());
    };
    const visible = new IntersectionObserver(([entry]) => {
      el.toggleAttribute('data-active', entry.isIntersecting);
      window.clearInterval(timer);
      if (entry.isIntersecting && !reduce) {
        timer = window.setInterval(tick, GLITCH_MS);
      }
    });
    visible.observe(el);

    return () => {
      resize.disconnect();
      reveal.disconnect();
      visible.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const words = lead.split(' ');

  return (
    <div ref={root} className="glitch-tagline relative isolate">
      <div aria-hidden className="glitch-waves">
        {['top', 'bottom'].map((side) => (
          <svg
            key={side}
            className={`glitch-hill glitch-hill-${side}`}
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`${gradient}-${side}`} x1="0" x2="1">
                <stop offset="0.8" stopColor="currentColor" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* The bottom hill is the same shape turned over (in the viewBox,
                so the element itself keeps a plain box). */}
            <path
              d={HILL}
              fill={`url(#${gradient}-${side})`}
              transform={side === 'bottom' ? 'rotate(180 500 120)' : undefined}
            />
          </svg>
        ))}
      </div>

      <h2 className="sr-only">
        {lead} {accent}
      </h2>
      <p
        ref={line}
        aria-hidden
        className="glitch-line relative mx-auto w-max whitespace-nowrap font-semibold text-text"
      >
        {words.map((w, index) => (
          <Fragment key={index}>
            <span className="glitch-mask">
              <span
                className="glitch-word"
                style={{ '--w': index } as CSSProperties}
              >
                {w}
              </span>
            </span>{' '}
          </Fragment>
        ))}
        <span className="glitch-mask">
          <span
            ref={glitch}
            data-text={accent}
            className="glitch-word glitch-accent text-accent"
            style={{ '--w': words.length } as CSSProperties}
          >
            {accent}
          </span>
        </span>
      </p>
    </div>
  );
}
