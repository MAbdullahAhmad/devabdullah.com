'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SELECTOR = '[data-reveal]:not([data-revealed])';

/**
 * The site's one motion script (renders nothing). Everything else is CSS —
 * see "Motion system" in `styles/globals.css`.
 *
 * 1. Scroll reveals: a single IntersectionObserver marks every
 *    `[data-reveal]` element `data-revealed` as it scrolls into view, including
 *    elements added later (a MutationObserver) and after client navigation.
 * 2. Spotlight: on fine pointers, `[data-spotlight]` cards get `--mx`/`--my`
 *    so a soft light follows the cursor.
 * 3. Magnetic: `[data-magnetic]` buttons lean slightly towards the cursor.
 * 4. Lens: over a `[data-lens]` element (the hero figure) a lens follows the
 *    cursor (`--lx`/`--ly`, `data-lens-on`); on touch screens a tap toggles
 *    it, centred on the face.
 *
 * With reduced motion everything is revealed at once and nothing follows the
 * pointer.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const reveal = (el: Element) => el.setAttribute('data-revealed', '');

    if (reduce) {
      document.querySelectorAll(SELECTOR).forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );
    const watch = (root: ParentNode) =>
      root.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));
    watch(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) observer.observe(node);
          watch(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduce.matches) return;

    let magnet: HTMLElement | null = null;
    let lens: HTMLElement | null = null;
    const release = () => {
      if (magnet) magnet.style.translate = '';
      magnet = null;
      lens?.removeAttribute('data-lens-on');
      lens = null;
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest) return;

      const spot = target.closest<HTMLElement>('[data-spotlight]');
      if (spot) {
        const box = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${event.clientX - box.left}px`);
        spot.style.setProperty('--my', `${event.clientY - box.top}px`);
      }

      const nextLens = target.closest<HTMLElement>('[data-lens]');
      if (nextLens !== lens) lens?.removeAttribute('data-lens-on');
      lens = nextLens;
      if (lens) {
        const box = lens.getBoundingClientRect();
        lens.style.setProperty('--lx', `${event.clientX - box.left}px`);
        lens.style.setProperty('--ly', `${event.clientY - box.top}px`);
        lens.style.setProperty('--lr-on', `${(box.width * 0.17).toFixed(1)}px`);
        lens.setAttribute('data-lens-on', '');
      }

      const next = target.closest<HTMLElement>('[data-magnetic]');
      if (next !== magnet) release();
      if (next) {
        magnet = next;
        const box = next.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) * 0.22;
        const dy = (event.clientY - (box.top + box.height / 2)) * 0.32;
        next.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', release);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', release);
      release();
    };
  }, []);

  // Touch screens: a tap on the lens element toggles it, centred on the face.
  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    const onTap = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const el = target?.closest?.<HTMLElement>('[data-lens]');
      if (!el) return;
      el.style.setProperty('--lx', '50%');
      el.style.setProperty('--ly', '17%');
      el.style.setProperty(
        '--lr-on',
        `${(el.getBoundingClientRect().width * 0.2).toFixed(1)}px`,
      );
      el.toggleAttribute('data-lens-on');
    };
    document.addEventListener('click', onTap);
    return () => document.removeEventListener('click', onTap);
  }, []);

  return null;
}
