'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Maximize2, Pause, Play } from 'lucide-react';
import type { CaseStudyScreen } from '@/lib/case-study-types';
import { cx } from '@/lib/cx';

/** How long each screen stays up while the tour plays. */
const DWELL_MS = 6500;
/** Horizontal drag needed to count as a swipe. */
const SWIPE_PX = 48;

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (onChange: () => void) => {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

const pad = (n: number) => String(n).padStart(2, '0');

const control =
  'inline-flex size-10 items-center justify-center rounded-pill border border-border bg-bg-elevated text-text-muted transition-colors ease-out [transition-duration:var(--dur-base)] hover:border-border-strong hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/**
 * Screen tour: a case study's real screenshots as a carousel. A wide browser
 * frame whose address bar shows where each screen lives; the next screen
 * wipes in behind a thin accent scan line (the hero's motif). Below, a chapter
 * rail names every screen; while the tour plays, the active chapter's line
 * fills and the tour advances when it is full.
 *
 * It only plays while on screen, and pauses on hover, on keyboard focus and
 * with the pause button (WCAG 2.2.2); with reduced motion it starts paused and
 * screens change without the wipe. Arrow keys, swipes, the arrows and the
 * rail all move it. Styles: "Screen tour" in `styles/globals.css`.
 */
export function ScreenTour({
  screens,
  label,
  app = 'app',
}: {
  screens: CaseStudyScreen[];
  /** Accessible name, e.g. "Project dashboard screens". */
  label: string;
  /** Short app name shown in the address bar, e.g. `lms`. */
  app?: string;
}) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [stopped, setStopped] = useState<boolean | null>(null);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLOListElement>(null);
  const dragStart = useRef<number | null>(null);

  // Autoplay unless the visitor paused it; reduced motion starts paused.
  const playing = !(stopped ?? reduced);
  const running = playing && inView && !held;
  const count = screens.length;
  const screen = screens[index];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep the active chapter visible in the rail (scrolls the rail only).
  useEffect(() => {
    const list = rail.current;
    const item = list?.children[index] as HTMLElement | undefined;
    if (!list || !item) return;
    const left = item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2;
    list.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
  }, [index, reduced]);

  const go = (next: number, dir: 1 | -1) => {
    const target = (next + count) % count;
    if (target === index) return;
    setPrevious(index);
    setDirection(dir);
    setIndex(target);
  };
  const step = (delta: 1 | -1) => go(index + delta, delta);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') dragStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (start === null) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) > SWIPE_PX) step(delta < 0 ? 1 : -1);
  };

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label={label}
      className="screen-tour flex flex-col gap-6"
      style={{ '--tour-dwell': `${DWELL_MS}ms` } as CSSProperties}
      onKeyDown={onKeyDown}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHeld(true);
      }}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setHeld(false);
        }
      }}
    >
      <div className="tour-stage relative">
        <div aria-hidden className="tour-glow" />
        <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-[var(--shadow-floating)]">
          {/* Address bar: where this screen lives. */}
          <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-pill bg-border-strong" />
              <span className="size-2.5 rounded-pill bg-border-strong" />
              <span className="size-2.5 rounded-pill bg-border-strong" />
            </div>
            <div
              aria-hidden
              className="mx-auto flex min-w-0 items-center gap-2 rounded-pill border border-border bg-bg px-4 py-1 font-mono text-[0.6875rem] text-text-subtle"
            >
              <span className="text-accent-text">{app}</span>
              <span>/</span>
              <span key={index} className="tour-path truncate text-text-muted">
                {screen.path}
              </span>
            </div>
            <a
              href={screen.src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-7 items-center justify-center rounded-pill text-text-subtle transition-colors hover:bg-bg hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Open the ${screen.title} screenshot full size`}
            >
              <Maximize2 size={14} strokeWidth={1.5} aria-hidden />
            </a>
          </div>

          <div
            aria-live={running ? 'off' : 'polite'}
            className="relative touch-pan-y overflow-hidden bg-surface"
            style={{
              aspectRatio: `${screens[0].width} / ${screens[0].height}`,
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (dragStart.current = null)}
          >
            {screens.map((item, i) => {
              const active = i === index;
              const behind = i === previous;
              return (
                <div
                  key={item.src}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}: ${item.title}`}
                  aria-hidden={!active}
                  className={cx(
                    'tour-slide absolute inset-0',
                    active && 'is-active',
                    active && previous !== null && 'is-entering',
                    behind && 'is-behind',
                    direction === -1 && 'is-back',
                  )}
                  onAnimationEnd={(event) => {
                    if (active && event.target === event.currentTarget) {
                      setPrevious(null);
                    }
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1280px) 1184px, 100vw"
                    priority={i === 0}
                    className="object-cover object-top"
                    draggable={false}
                  />
                  {active && previous !== null && (
                    <span aria-hidden className="tour-scan" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caption and controls. */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
        <div
          key={index}
          className="tour-caption flex max-w-[60ch] flex-col gap-2"
        >
          <p className="flex items-baseline gap-3">
            <span className="font-mono text-label tabular-nums text-accent-text">
              {pad(index + 1)}
              <span className="text-text-subtle"> / {pad(count)}</span>
            </span>
            <span className="text-h4 text-text">{screen.title}</span>
          </p>
          <p className="text-pretty text-body-s text-text-muted">
            {screen.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={control}
            onClick={() => step(-1)}
            aria-label="Previous screen"
          >
            <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
          </button>
          <button
            type="button"
            className={control}
            onClick={() => setStopped(playing)}
            aria-label={playing ? 'Pause the tour' : 'Play the tour'}
          >
            {playing ? (
              <Pause size={16} strokeWidth={1.5} aria-hidden />
            ) : (
              <Play size={16} strokeWidth={1.5} aria-hidden />
            )}
          </button>
          <button
            type="button"
            className={control}
            onClick={() => step(1)}
            aria-label="Next screen"
          >
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </div>

      {/* Chapter rail. */}
      <ol
        ref={rail}
        // Up to nine chapters share one row; longer tours scroll sideways.
        className={cx(
          'tour-rail -mx-[var(--page-padding-x)] flex snap-x gap-2 overflow-x-auto px-[var(--page-padding-x)] pb-1',
          count <= 9 &&
            'md:mx-0 md:grid md:grid-cols-[repeat(var(--chapters),minmax(0,1fr))] md:overflow-visible md:px-0',
        )}
        style={{ '--chapters': count } as CSSProperties}
      >
        {screens.map((item, i) => {
          const active = i === index;
          return (
            <li
              key={item.src}
              className={cx('shrink-0 snap-start', count <= 9 && 'md:shrink')}
            >
              <button
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-current={active ? 'true' : undefined}
                aria-label={`Show screen ${i + 1}: ${item.title}`}
                className={cx(
                  'tour-chapter group flex w-36 flex-col gap-2 rounded-sm pt-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  count <= 9 && 'md:w-full',
                  active && 'is-active',
                )}
              >
                <span aria-hidden className="tour-line">
                  {active && (
                    <span
                      key={`${index}-${playing}`}
                      className={cx('tour-fill', !playing && 'is-static')}
                      style={{
                        animationPlayState: running ? 'running' : 'paused',
                      }}
                      onAnimationEnd={() => playing && step(1)}
                    />
                  )}
                </span>
                <span className="font-mono text-[0.6875rem] tabular-nums text-text-subtle transition-colors group-hover:text-text-muted">
                  {pad(i + 1)}
                </span>
                <span
                  className={cx(
                    'text-label leading-snug transition-colors',
                    active
                      ? 'text-text'
                      : 'text-text-subtle group-hover:text-text-muted',
                  )}
                >
                  {item.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
