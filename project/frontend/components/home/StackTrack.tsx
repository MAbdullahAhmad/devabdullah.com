'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Where each layer's turn starts, as a share of the scroll through the track. */
const TURNS = [0.14, 0.4, 0.64, 0.88];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The scroll driver for the Stack scene. While the tall track is on screen it
 * writes, once per frame:
 *
 * - `--p`: progress through the track (0 → 1);
 * - `--e`: how exploded the mark is: it opens over the first 14%, holds, and
 *   closes again over the last stretch;
 * - `data-active`: the layer in focus (0 Interface, 1 API, 2 Database) or 3
 *   once the mark has closed ("One system").
 *
 * Everything visible is CSS reading those ("The Stack" in globals.css), so
 * this stays a few hundred bytes. Shown only on large screens with motion
 * allowed; everywhere else the section renders its static card version.
 */
export function StackTrack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? clamp(-rect.top / travel) : 0;
      const open = clamp(p / TURNS[0]);
      const close = clamp((0.98 - p) / (0.98 - TURNS[3]));
      const active = TURNS.findLastIndex((turn) => p >= turn);
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--e', (open * close).toFixed(4));
      el.dataset.active = String(Math.max(0, active));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        schedule();
      } else {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      }
    });
    observer.observe(el);
    update();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div ref={ref} className={className} data-active="0">
      {children}
    </div>
  );
}
