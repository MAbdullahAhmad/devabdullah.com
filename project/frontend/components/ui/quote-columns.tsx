'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import { Pause, Play } from 'lucide-react';
import { cx } from '@/lib/cx';

export interface QuoteItem {
  quote: string;
  name: string;
  /** Role or job title. */
  title: string;
  company?: string;
  /** Optional avatar in /public; falls back to the first initial. */
  image?: string;
}

/**
 * From this many quotes, each column gets its own share. Between LOOP_MIN and
 * MARQUEE_MIN every column shows all the quotes in a different rotation, so
 * a small set still fills the three looping columns (and phones, which show
 * one column, still see every quote). Below LOOP_MIN they sit in a grid.
 */
const MARQUEE_MIN = 6;
const LOOP_MIN = 3;
/** Column speeds in px/s (21st.dev `testimonials-6`: 30, 50, 35). */
const SPEEDS = [30, 50, 35];
/** Hovering halves the speed, as in the original. */
const HOVER_RATE = 0.5;
const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function QuoteCard({ item }: { item: QuoteItem }) {
  return (
    <figure className="lift w-full max-w-xs rounded-[1.5rem] border border-border bg-bg-elevated p-8 shadow-lg shadow-text/5">
      <blockquote className="text-pretty text-body-s text-text">
        {item.quote}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-2">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- a 32px avatar; plain <img> keeps image code out of the bundle
          <img
            src={item.image}
            alt={`${item.name}'s profile picture`}
            width={32}
            height={32}
            loading="lazy"
            className="size-8 rounded-pill object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-body-s font-medium text-accent-text"
          >
            {item.name.charAt(0)}
          </span>
        )}
        <span className="flex flex-col">
          <cite className="text-body-s font-medium not-italic leading-5 tracking-tight text-text">
            {item.name}
          </cite>
          <span className="text-body-s leading-5 tracking-tight text-text-muted">
            {item.title}
            {item.company && `, ${item.company}`}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Quote columns (owner change OC.8), the 21st.dev `testimonials-6` design:
 * up to three columns of cards that loop vertically at their own speeds and
 * slow to half speed on hover, inside a fade mask. A Pause button stops the
 * motion (WCAG 2.2.2); with reduced motion, or fewer than six quotes, the
 * cards sit in a static grid. The looping copy is hidden from assistive tech,
 * so each quote is read once.
 */
export function QuoteColumns({
  items,
  className,
}: {
  items: QuoteItem[];
  className?: string;
}) {
  const reduce = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Duration per column = one copy's height ÷ its speed, so each column moves
  // at a constant px/s whatever its content.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const tracks = [...el.querySelectorAll<HTMLElement>('[data-quote-track]')];
    const update = () =>
      tracks.forEach((track, index) => {
        const distance = track.scrollHeight / 2;
        track.style.animationDuration = `${distance / SPEEDS[index % 3]}s`;
      });
    update();
    const observer = new ResizeObserver(update);
    tracks.forEach((track) => observer.observe(track));
    return () => observer.disconnect();
  }, [items, reduce]);

  if (reduce || items.length < LOOP_MIN) {
    return (
      <div
        className={cx(
          'mx-auto grid max-w-5xl justify-items-center gap-6 md:grid-cols-2',
          items.length > 4 && 'lg:grid-cols-3',
          className,
        )}
      >
        {items.map((item) => (
          <QuoteCard key={item.name + item.quote} item={item} />
        ))}
      </div>
    );
  }

  // Few quotes: every column is a rotation of all of them; the rotated
  // copies are repeats, so they are hidden from assistive technology.
  const rotated = items.length < MARQUEE_MIN;
  const size = Math.ceil(items.length / 3);
  const columns = [0, 1, 2].map((index) =>
    rotated
      ? [...items.slice(index), ...items.slice(0, index)]
      : items.slice(index * size, index * size + size),
  );

  const setRate = (rate: number) => {
    root.current
      ?.getAnimations({ subtree: true })
      .forEach((animation) => animation.updatePlaybackRate(rate));
  };

  return (
    <div className={cx('flex flex-col gap-6', className)}>
      <div
        ref={root}
        onPointerEnter={() => setRate(HOVER_RATE)}
        onPointerLeave={() => setRate(1)}
        data-paused={paused ? '' : undefined}
        className="quote-columns mx-auto flex max-h-[40rem] w-full max-w-5xl justify-center gap-6 overflow-hidden"
      >
        {columns.map((column, index) => (
          <div
            key={index}
            className={cx(
              'w-full max-w-xs',
              index === 1 && 'hidden md:block',
              index === 2 && 'hidden lg:block',
            )}
          >
            <div
              data-quote-track
              className="quote-track flex flex-col gap-6"
              style={{ '--quote-gap': '1.5rem' } as CSSProperties}
            >
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  aria-hidden={
                    copy === 1 || (rotated && index > 0) || undefined
                  }
                  className="flex flex-col gap-6"
                >
                  {column.map((item) => (
                    <li key={item.name + item.quote}>
                      <QuoteCard item={item} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        className="inline-flex items-center gap-2 self-center rounded-pill border border-border px-4 py-1.5 text-label text-text-muted transition-colors hover:border-border-strong hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {paused ? (
          <Play size={12} strokeWidth={1.5} aria-hidden />
        ) : (
          <Pause size={12} strokeWidth={1.5} aria-hidden />
        )}
        {paused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
}
