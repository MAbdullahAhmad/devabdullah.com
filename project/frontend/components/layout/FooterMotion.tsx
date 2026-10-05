'use client';

import { useEffect, useRef } from 'react';

/** Base drift of the stack strip, in pixels per second. */
const BASE_SPEED = 36;

/**
 * The footer's two moving parts (owner change OC.9). Renders nothing.
 *
 * 1. Reveal: marks the footer `data-revealed` once a fifth of it is visible,
 *    which starts the line wipes and the signature (CSS in
 *    `site-footer.module.css`).
 * 2. Scroll-in: sets `--p` on the footer from 0 (its top just entering the
 *    viewport) to 1 (most of it in view), so the panel rises and settles
 *    slowly instead of arriving all at once.
 * 3. Stack strip: drifts left, speeds up while the page scrolls and reverses
 *    while scrolling up, like the original.
 *
 * Nothing moves for reduced motion (`--p` stays at its CSS default of 1).
 */
export function FooterMotion() {
  const probe = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = probe.current?.closest('footer');
    if (!footer) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        footer.setAttribute('data-revealed', '');
        reveal.disconnect();
      },
      { threshold: 0.2 },
    );
    reveal.observe(footer);

    const track = footer.querySelector<HTMLElement>('[data-footer-track]');
    if (!track || reduce) return () => reveal.disconnect();

    const progress = () => {
      const top = footer.getBoundingClientRect().top;
      const view = window.innerHeight;
      const p = Math.min(Math.max((view - top) / (view * 0.95), 0), 1);
      // Ease out, so the panel slows as it settles.
      footer.style.setProperty('--p', (1 - (1 - p) ** 3).toFixed(4));
    };
    progress();

    let x = 0;
    let direction = 1;
    let boost = 0;
    let lastY = window.scrollY;
    let last = 0;
    let frame = 0;

    const onScroll = () => {
      progress();
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (dy !== 0) direction = dy > 0 ? 1 : -1;
      boost = Math.min(boost + Math.abs(dy) * 6, 700);
    };

    const tick = (time: number) => {
      const seconds = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      // One copy's width: the track holds three identical copies.
      const loop = track.scrollWidth / 3;
      x -= (BASE_SPEED + boost) * direction * seconds;
      if (x <= -loop) x += loop;
      if (x > 0) x -= loop;
      boost *= 0.92;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const visible = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    visible.observe(footer);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', progress);

    return () => {
      window.removeEventListener('resize', progress);
      reveal.disconnect();
      visible.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <span ref={probe} hidden />;
}
