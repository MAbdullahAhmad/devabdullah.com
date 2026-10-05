'use client';

import { useEffect, useRef } from 'react';

interface StatCounterProps {
  value: number;
  suffix?: string;
  /** Count-up duration in ms (Section 6.1: 600ms). */
  duration?: number;
  className?: string;
}

/**
 * Counts up to `value` once, the first time it scrolls into view (Section 6.1).
 * The final value is server-rendered, so no-JS visitors and crawlers see the
 * real number; the count-up is driven imperatively (no React state), so there
 * is no hydration mismatch and no flash. Reduced motion shows the final value
 * immediately.
 */
export function StatCounter({
  value,
  suffix = '',
  duration = 600,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Reset while off-screen so the count-up is never seen jumping backwards.
    el.textContent = `0${suffix}`;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // Expo-out easing, matching --ease-out.
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = `${Math.round(eased * value)}${suffix}`;
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
