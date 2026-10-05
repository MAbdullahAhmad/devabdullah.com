'use client';

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

const maxScroll = () =>
  Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

/**
 * N–S compass scroll indicator (after moneyincheck.org): fixed on the right
 * edge, a thin line whose accent fill grows from N to S as the page scrolls.
 *
 * Unlike the original, it is a working scrollbar: it reports the position to
 * assistive tech (`aria-valuenow`), can be dragged or clicked to move through
 * the page, and answers the arrow keys, Page Up/Down, Home and End. Hidden on
 * small screens (styles: `.compass` in `styles/globals.css`).
 */
export function ScrollCompass() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    let frame = 0;
    let shown = -1;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
      if (fill.current) fill.current.style.transform = `scaleY(${progress})`;
      const percent = Math.round(progress * 100);
      if (percent !== shown && root.current) {
        shown = percent;
        root.current.setAttribute('aria-valuenow', String(percent));
        root.current.setAttribute('aria-valuetext', `${percent}% scrolled`);
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);

  const seek = (clientY: number, smooth: boolean) => {
    const box = line.current?.getBoundingClientRect();
    if (!box) return;
    const ratio = Math.min(1, Math.max(0, (clientY - box.top) / box.height));
    window.scrollTo({
      top: ratio * maxScroll(),
      behavior: smooth ? 'smooth' : 'instant',
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.setAttribute('data-dragging', '');
    seek(event.clientY, true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) seek(event.clientY, false);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    event.currentTarget.removeAttribute('data-dragging');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const page = window.innerHeight * 0.9;
    const steps: Record<string, number> = {
      ArrowDown: 80,
      ArrowRight: 80,
      ArrowUp: -80,
      ArrowLeft: -80,
      PageDown: page,
      PageUp: -page,
    };
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      window.scrollTo({ top: event.key === 'Home' ? 0 : maxScroll() });
    } else if (event.key in steps) {
      event.preventDefault();
      window.scrollBy({ top: steps[event.key] });
    }
  };

  return (
    <div
      ref={root}
      className="compass"
      role="scrollbar"
      aria-controls="main"
      aria-orientation="vertical"
      aria-label="Page scroll"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden className="compass-letter compass-letter-n">
        N
      </span>
      <span ref={line} aria-hidden className="compass-line">
        <span ref={fill} className="compass-fill" />
      </span>
      <span aria-hidden className="compass-letter compass-letter-s">
        S
      </span>
    </div>
  );
}
