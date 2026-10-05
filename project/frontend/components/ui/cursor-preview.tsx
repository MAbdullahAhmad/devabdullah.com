'use client';

import { useEffect, useRef, type ReactNode, type RefObject } from 'react';

/** Fraction of the remaining distance covered each frame. */
const LERP = 0.15;

/**
 * The cursor-follow behind a hover preview: `follow(x, y)` sets a target and
 * a requestAnimationFrame loop eases the preview towards it, writing the
 * transform directly and stopping once settled (no React state per frame).
 * `snap` jumps straight there, for the first hover.
 */
export function useCursorFollow() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const paint = () => {
    const el = ref.current;
    if (!el) return;
    const { x, y } = position.current;
    el.style.transform = `translate3d(${x + 20}px, ${y - 100}px, 0)`;
  };

  const tick = () => {
    const dx = target.current.x - position.current.x;
    const dy = target.current.y - position.current.y;
    position.current.x += dx * LERP;
    position.current.y += dy * LERP;
    paint();
    frame.current =
      Math.abs(dx) + Math.abs(dy) > 0.5 ? requestAnimationFrame(tick) : 0;
  };

  const follow = (x: number, y: number, snap = false) => {
    target.current = { x, y };
    if (snap) {
      position.current = { x, y };
      paint();
    }
    if (!frame.current) frame.current = requestAnimationFrame(tick);
  };

  return { ref, follow };
}

/**
 * The floating 280 × 180 preview (21st.dev `project-showcase`): it fades and
 * scales in while something is hovered and cross-fades, with blur, between
 * items. Fine pointers only, never with reduced motion.
 */
export function CursorPreview({
  previewRef,
  items,
  active,
}: {
  previewRef: RefObject<HTMLDivElement | null>;
  items: { key: string; node: ReactNode }[];
  /** Index of the hovered item, or null. */
  active: number | null;
}) {
  const visible = active !== null;
  return (
    <div
      ref={previewRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 hidden overflow-hidden rounded-xl shadow-2xl will-change-transform motion-reduce:!hidden [@media(hover:hover)_and_(pointer:fine)]:block"
      style={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
        transition:
          'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="relative h-[180px] w-[280px] overflow-hidden rounded-xl bg-surface">
        {items.map((item, index) => (
          <div
            key={item.key}
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{
              opacity: active === index ? 1 : 0,
              scale: active === index ? 1 : 1.1,
              filter: active === index ? 'none' : 'blur(10px)',
            }}
          >
            {item.node}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/20 to-transparent" />
      </div>
    </div>
  );
}
